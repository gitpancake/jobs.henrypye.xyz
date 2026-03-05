import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 }
      );
    }

    await adminAuth.verifyIdToken(idToken);
    await setAuthCookie(idToken);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
