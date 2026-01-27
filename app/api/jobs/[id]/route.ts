import { NextResponse } from 'next/server';
import { getJobById, updateJob, deleteJob } from '@/lib/jobs';
import { UpdateJobSchema } from '@/lib/validations';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const job = await getJobById(id);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
});

export const PUT = withAuth(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = UpdateJobSchema.parse({
      ...body,
      applicationDate: body.applicationDate ? new Date(body.applicationDate) : undefined,
    });
    
    const job = await updateJob(id, validatedData);
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await deleteJob(id);
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
});