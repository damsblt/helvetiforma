import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to construction page, login, and static assets
  const allowedPaths = [
    '/construction',
    '/login',
    '/register',
    '/api',
    '/_next',
    '/favicon.ico',
    '/images',
    '/css',
    '/js'
  ];
  
  // Check if the current path is allowed
  const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));
  
  // If it's an allowed path, continue normally
  if (isAllowedPath) {
    return NextResponse.next();
  }
  
  // Check if user has authentication cookie
  const authCookie = request.cookies.get('auth') || request.cookies.get('user');
  const hasAuth = authCookie && authCookie.value !== 'undefined';
  
  // If no authentication and not on an allowed path, redirect to construction with current path
  if (!hasAuth) {
    const constructionUrl = new URL('/construction', request.url);
    constructionUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(constructionUrl);
  }
  
  // User is authenticated, allow access to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

