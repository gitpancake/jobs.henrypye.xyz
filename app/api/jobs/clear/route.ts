import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

export const DELETE = withAuth(async (request, { session }) => {
  try {
    const result = await prisma.job.deleteMany({ where: { userId: session.uid } });
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.count} jobs`,
      deletedCount: result.count 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to clear jobs:', error);
    return NextResponse.json({ error: 'Failed to clear jobs' }, { status: 500 });
  }
});