import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { hostname } = request.nextUrl;
  
  // Handle page redirects for new structure
  if (pathname === '/formations-archive') {
    return NextResponse.redirect(new URL('/formations', request.url));
  }
  
  // Skip construction page redirect for localhost development and Vercel preview
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
  const isVercelPreview = hostname.includes('vercel.app') || hostname.includes('vercel.com');
  
  // In development mode or Vercel preview, allow all pages
  if (isLocalhost || isVercelPreview) {
    return NextResponse.next();
  }
  
  // For production (helvetiforma.ch), redirect to construction page
  const isProduction = hostname === 'helvetiforma.ch' || hostname === 'www.helvetiforma.ch';
  
  if (isProduction && pathname !== '/construction') {
    // Redirect to construction page for main domain
    return NextResponse.redirect(new URL('/construction', request.url));
  }
  
  // For Vercel domain, allow access to all pages
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

