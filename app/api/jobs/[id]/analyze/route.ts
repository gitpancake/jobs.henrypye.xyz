import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeJobDescription, getUserCV } from '@/lib/ai-service';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const POST = withAuth(async (request, { session, params }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  const { id: jobId } = params;

  try {
    const job = await prisma.job.findFirst({
      where: { id: jobId, teamId: session.activeTeamId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!job.description) {
      return NextResponse.json({ error: 'Job has no description to analyze' }, { status: 400 });
    }

    const cvContent = await getUserCV(session.activeTeamId);

    const analysis = await analyzeJobDescription(job.description, cvContent || undefined);

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        salaryMin: analysis.salaryMin,
        salaryMax: analysis.salaryMax,
        salaryCurrency: analysis.salaryCurrency,
        responsibilities: analysis.responsibilities,
        requirements: analysis.requirements,
        benefits: analysis.benefits,
        workArrangement: analysis.workArrangement,
        suitabilityScore: analysis.suitabilityScore,
        suitabilityReason: analysis.suitabilityReason,
        suggestedNextSteps: analysis.suggestedNextSteps,
        aiAnalyzedAt: new Date(),
      }
    });

    return NextResponse.json({
      message: 'Job analyzed successfully',
      job: updatedJob,
      analysis
    });
  } catch (error) {
    console.error('AI analysis failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      jobId
    });

    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY') || error.message.includes('invalid_api_key')) {
        return NextResponse.json({
          error: 'AI service not configured. Please add your Anthropic API key.'
        }, { status: 500 });
      }
      if (error.message.includes('rate_limit')) {
        return NextResponse.json({
          error: 'AI service rate limit exceeded. Please try again in a moment.'
        }, { status: 429 });
      }
      if (error.message.includes('quota_exceeded')) {
        return NextResponse.json({
          error: 'AI service quota exceeded. Please try again later.'
        }, { status: 429 });
      }
      if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        return NextResponse.json({
          error: 'AI analysis timed out. Please try again.'
        }, { status: 503 });
      }
      if (error.message.includes('Failed to parse') || error.message.includes('JSON')) {
        return NextResponse.json({
          error: 'AI analysis returned invalid data. Please try again.'
        }, { status: 503 });
      }
      if (error.message.includes('connection pool') || error.message.includes('Timed out')) {
        return NextResponse.json({
          error: 'Database connection timeout. Please try again in a moment.'
        }, { status: 503 });
      }
      if (error.message.includes('P2024')) {
        return NextResponse.json({
          error: 'Database connection pool exhausted. Please try again.'
        }, { status: 503 });
      }
      if (error.message.includes('AI service') || error.message.includes('temporarily unavailable')) {
        return NextResponse.json({
          error: error.message
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      error: 'Failed to analyze job description. Please try again.'
    }, { status: 500 });
  }
});
