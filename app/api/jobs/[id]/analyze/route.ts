import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeJobDescription, getUserCV } from '@/lib/ai-service';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: jobId } = await params;
    
    // Get the job
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    if (!job.description) {
      return NextResponse.json({ error: 'Job has no description to analyze' }, { status: 400 });
    }
    
    // Get user's CV for suitability analysis
    const cvContent = await getUserCV();
    
    // Perform AI analysis
    const analysis = await analyzeJobDescription(job.description, cvContent || undefined);
    
    // Update job with analysis results
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
    
    // Handle specific Prisma errors
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
      
      if (error.message.includes('P2024')) {
        return NextResponse.json({ 
          error: 'Database connection pool exhausted. Please try again.' 
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to analyze job description. Please try again.' 
    }, { status: 500 });
  }
});