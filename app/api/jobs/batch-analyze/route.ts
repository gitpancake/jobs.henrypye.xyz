import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeJobDescription, getUserCV } from '@/lib/ai-service';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const POST = withAuth(async (request, { session }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const jobsToAnalyze = await prisma.job.findMany({
      where: {
        teamId: session.activeTeamId,
        AND: [
          { description: { not: null } },
          { description: { not: '' } },
          { aiAnalyzedAt: null }
        ]
      },
      select: {
        id: true,
        title: true,
        company: true,
        description: true
      }
    });

    if (jobsToAnalyze.length === 0) {
      return NextResponse.json({
        message: 'No jobs found that need analysis.',
        analyzed: 0,
        total: 0
      });
    }

    const cvContent = await getUserCV(session.activeTeamId);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const BATCH_SIZE = 3;
    for (let i = 0; i < jobsToAnalyze.length; i += BATCH_SIZE) {
      const batch = jobsToAnalyze.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (job) => {
          try {
            if (!job.description) return;

            const analysis = await analyzeJobDescription(job.description, cvContent || undefined);

            await prisma.job.update({
              where: { id: job.id },
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

            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(`${job.company} - ${job.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`Batch analysis failed for job ${job.id}:`, error);
          }
        })
      );

      if (i + BATCH_SIZE < jobsToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return NextResponse.json({
      message: `Batch analysis completed. Successfully analyzed ${successCount} jobs.`,
      analyzed: successCount,
      errors: errorCount,
      total: jobsToAnalyze.length,
      errorDetails: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch analysis failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json({
          error: 'AI service not configured. Please add your Anthropic API key.'
        }, { status: 500 });
      }

      if (error.message.includes('connection pool') || error.message.includes('Timed out')) {
        return NextResponse.json({
          error: 'Database connection timeout. Please try again in a moment.'
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      error: 'Batch analysis failed. Please try again.'
    }, { status: 500 });
  }
});
