import { NextResponse } from 'next/server';
import { getJobStats } from '@/lib/jobs';

export async function GET() {
  try {
    const stats = await getJobStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job stats' }, { status: 500 });
  }
}