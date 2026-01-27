import { NextResponse } from 'next/server';
import { getJobStats } from '@/lib/jobs';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async () => {
  try {
    const stats = await getJobStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Job stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch job stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});