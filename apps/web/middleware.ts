import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/admin', '/me', '/contribute'];
const ADMIN_PATHS = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('access_token')?.value;
  const roleCookie = request.cookies.get('user_role')?.value;

  console.log('[MIDDLEWARE]', {
    pathname,
    hasToken: !!token,
    role: roleCookie,
    cookies: request.cookies.getAll().map(c => c.name),
  });

  if (!token) {
    console.log('[MIDDLEWARE] No token, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes: check role stored in cookie (set at login)
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdmin && !['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'EDITOR'].includes(roleCookie ?? '')) {
    console.log('[MIDDLEWARE] Non-admin trying to access admin route, redirecting');
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  console.log('[MIDDLEWARE] Access granted');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/me/:path*',
    '/contribute/:path*',
  ],
};
