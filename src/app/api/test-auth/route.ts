import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔍 Testing NextAuth server-side session...')
    
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user ? {
        id: (session.user as any)?.id,
        email: session.user.email,
        name: session.user.name
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ NextAuth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
