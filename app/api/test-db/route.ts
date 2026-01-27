import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Simple database connection test
    await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful',
      env: {
        hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        hasNonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
        prismaPrefix: process.env.POSTGRES_PRISMA_URL ? process.env.POSTGRES_PRISMA_URL.substring(0, 20) + '...' : 'Not set',
        nonPoolingPrefix: process.env.POSTGRES_URL_NON_POOLING ? process.env.POSTGRES_URL_NON_POOLING.substring(0, 20) + '...' : 'Not set'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        hasNonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
        prismaPrefix: process.env.POSTGRES_PRISMA_URL ? process.env.POSTGRES_PRISMA_URL.substring(0, 20) + '...' : 'Not set',
        nonPoolingPrefix: process.env.POSTGRES_URL_NON_POOLING ? process.env.POSTGRES_URL_NON_POOLING.substring(0, 20) + '...' : 'Not set'
      }
    }, { status: 500 });
  }
}