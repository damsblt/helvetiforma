import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { simpleAuthOptions } from '@/lib/auth-simple'

export async function GET() {
  try {
    console.log('🔍 Testing simple NextAuth configuration...')
    
    const session = await getServerSession(simpleAuthOptions)
    
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
    console.error('❌ Simple NextAuth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
