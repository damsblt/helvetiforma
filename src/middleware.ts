import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // No specific route protection needed for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    // No specific routes to match
  ],
}

