import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getJobAnalytics } from '@/lib/jobs';

async function handler(request: Request, { session }: { session: { activeTeamId: string } }) {
  try {
    const analytics = await getJobAnalytics(session.activeTeamId);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export const GET = withAuth(handler);