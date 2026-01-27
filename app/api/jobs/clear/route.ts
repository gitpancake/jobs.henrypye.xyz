import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const result = await prisma.job.deleteMany({});
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.count} jobs`,
      deletedCount: result.count 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to clear jobs:', error);
    return NextResponse.json({ error: 'Failed to clear jobs' }, { status: 500 });
  }
}