import { NextResponse } from 'next/server';
import { bulkCreateJobs } from '@/lib/jobs';
import { BulkImportSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = BulkImportSchema.parse({
      jobs: body.jobs.map((job: { applicationDate: string | Date; [key: string]: unknown }) => ({
        ...job,
        applicationDate: new Date(job.applicationDate),
      })),
    });
    
    const createdJobs = await bulkCreateJobs(validatedData.jobs);
    
    return NextResponse.json({ 
      message: `Successfully imported ${createdJobs.length} jobs`,
      jobs: createdJobs 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to import jobs' }, { status: 500 });
  }
}