import { NextResponse } from 'next/server';
import { bulkCreateJobs } from '@/lib/jobs';
import { BulkImportSchema } from '@/lib/validations';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const POST = withAuth(async (request, { session }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const body = await request.json();

    const validatedData = BulkImportSchema.parse({
      jobs: body.jobs.map((job: { applicationDate: string | Date; [key: string]: unknown }) => ({
        ...job,
        applicationDate: new Date(job.applicationDate),
      })),
    });

    const createdJobs = await bulkCreateJobs(validatedData.jobs, session.activeTeamId);

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
});
