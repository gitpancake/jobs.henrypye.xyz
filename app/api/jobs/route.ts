import { NextResponse } from 'next/server';
import { getAllJobs, createJob } from '@/lib/jobs';
import { CreateJobSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'APPLIED' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED' | null;
    
    const jobs = await getAllJobs(status || undefined);
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = CreateJobSchema.parse({
      ...body,
      applicationDate: body.applicationDate ? new Date(body.applicationDate) : undefined,
    });
    
    const job = await createJob(validatedData);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}