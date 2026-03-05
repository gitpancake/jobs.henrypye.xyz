import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';

const SESSION_COOKIE = 'firebase-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setAuthCookie(idToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    await adminAuth.verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
}

export function withAuth(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any): Promise<Response> => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(request, context);
  };
}
