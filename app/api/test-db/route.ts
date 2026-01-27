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
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        urlPrefix: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) + '...' : 'Not set'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        urlPrefix: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) + '...' : 'Not set'
      }
    }, { status: 500 });
  }
}