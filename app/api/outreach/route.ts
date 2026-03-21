import { NextResponse } from 'next/server';
import { getAllOutreach, createOutreach } from '@/lib/outreach';
import { CreateOutreachSchema } from '@/lib/validations';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const GET = withAuth(async (_request, { session }) => {
  try {
    const outreach = await getAllOutreach(session.activeTeamId);
    return NextResponse.json(outreach);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch outreach' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { session }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const body = await request.json();

    const validatedData = CreateOutreachSchema.parse({
      ...body,
      outreachDate: body.outreachDate ? new Date(body.outreachDate) : undefined,
      responseDate: body.responseDate ? new Date(body.responseDate) : null,
    });

    const outreach = await createOutreach(validatedData, session.activeTeamId);
    return NextResponse.json(outreach, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create outreach' }, { status: 500 });
  }
});
