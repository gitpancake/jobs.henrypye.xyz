import { NextResponse } from 'next/server';
import { getJobStats } from '@/lib/jobs';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async () => {
  try {
    const stats = await getJobStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job stats' }, { status: 500 });
  }
});