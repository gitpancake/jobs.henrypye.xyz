import { NextResponse } from 'next/server';
import { getOutreachById, updateOutreach, deleteOutreach } from '@/lib/outreach';
import { UpdateOutreachSchema } from '@/lib/validations';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const GET = withAuth(async (_request, { session, params }) => {
  try {
    const { id } = params;
    const outreach = await getOutreachById(id, session.activeTeamId);

    if (!outreach) {
      return NextResponse.json({ error: 'Outreach not found' }, { status: 404 });
    }

    return NextResponse.json(outreach);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch outreach' }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, { session, params }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const { id } = params;
    const body = await request.json();

    const validatedData = UpdateOutreachSchema.parse({
      ...body,
      outreachDate: body.outreachDate ? new Date(body.outreachDate) : undefined,
      responseDate: body.responseDate ? new Date(body.responseDate) : body.responseDate === null ? null : undefined,
    });

    const outreach = await updateOutreach(id, session.activeTeamId, validatedData);
    return NextResponse.json(outreach);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update outreach' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (_request, { session, params }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const { id } = params;
    await deleteOutreach(id, session.activeTeamId);
    return NextResponse.json({ message: 'Outreach deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete outreach' }, { status: 500 });
  }
});
