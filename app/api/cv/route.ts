import { NextResponse } from 'next/server';
import { getUserCV, saveUserCV } from '@/lib/ai-service';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request, { session }) => {
  try {
    const cv = await getUserCV(session.uid);
    return NextResponse.json({ content: cv });
  } catch (error) {
    console.error('Failed to get CV:', error);
    return NextResponse.json({ error: 'Failed to get CV' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { session }) => {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'CV content is required' }, { status: 400 });
    }

    await saveUserCV(content, session.uid);
    return NextResponse.json({ message: 'CV saved successfully' });
  } catch (error) {
    console.error('Failed to save CV:', error);
    return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
  }
});
