import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect admin routes - calendar is now public
  if (pathname.startsWith('/admin')) {
    // For now, allow access to admin routes
    // In production, you might want to add Supabase auth check here
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only protect admin routes
    '/admin/:path*',
  ],
}

