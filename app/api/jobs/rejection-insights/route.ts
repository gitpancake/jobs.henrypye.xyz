import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeRejectionPatterns, getUserCV } from '@/lib/ai-service';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async () => {
  try {
    const rejectedJobs = await prisma.job.findMany({
      where: {
        status: 'REJECTED',
        description: {
          not: null,
        },
      },
      orderBy: { applicationDate: 'desc' },
    });

    // Filter out jobs with empty descriptions
    const jobsWithDescriptions = rejectedJobs.filter(
      (job) => job.description && job.description.trim() !== ''
    );

    if (jobsWithDescriptions.length === 0) {
      return NextResponse.json(
        { error: 'No rejected jobs with descriptions found to analyze.' },
        { status: 400 }
      );
    }

    const cvContent = await getUserCV();

    const insights = await analyzeRejectionPatterns(
      jobsWithDescriptions,
      cvContent
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Rejection insights failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          { error: 'AI service not configured. Please add your Anthropic API key.' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze rejection patterns.' },
      { status: 500 }
    );
  }
});
