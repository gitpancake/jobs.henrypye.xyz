import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeJobDescription, getUserCV } from '@/lib/ai-service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ 
        error: 'AI service not configured. Please add your Anthropic API key.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to analyze job description' 
    }, { status: 500 });
  }
}