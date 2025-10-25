import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return a 401 since we don't have proper WordPress session management
    // This prevents the infinite loop in AuthContext
    return NextResponse.json(
      { error: 'No WordPress session found' },
      { status: 401 }
    )
  } catch (error) {
    console.error('❌ Error getting WordPress user:', error)
    return NextResponse.json(
      { error: 'No WordPress session found' },
      { status: 401 }
    )
  }
}
