import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'job_tracker_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthCredentials {
  username: string;
  password: string;
}

export function validateCredentials(credentials: AuthCredentials): boolean {
  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;
  
  if (!validUsername || !validPassword) {
    console.error('AUTH_USERNAME or AUTH_PASSWORD not configured');
    return false;
  }
  
  return credentials.username === validUsername && credentials.password === validPassword;
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
    return authCookie?.value === 'authenticated';
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

export function checkAuthMiddleware(request: NextRequest): NextResponse | null {
  // Skip auth check for login/logout routes and API auth
  if (request.nextUrl.pathname.startsWith('/api/auth') || 
      request.nextUrl.pathname === '/login') {
    return null;
  }
  
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return null;
}