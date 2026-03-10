import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const DELETE = withAuth(async (request, { session }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const result = await prisma.job.deleteMany({ where: { teamId: session.activeTeamId } });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} jobs`,
      deletedCount: result.count
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to clear jobs:', error);
    return NextResponse.json({ error: 'Failed to clear jobs' }, { status: 500 });
  }
});
