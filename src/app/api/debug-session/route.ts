import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { checkUserPurchase } from '@/lib/purchases'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    const debugInfo: any = {
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      } : null,
      timestamp: new Date().toISOString()
    }

    // If user is logged in, check their purchases
    if (session?.user) {
      const testPostId = '040b76b6-4718-4b2c-a11f-c6277c9f937c' // test-2 post
      const hasPurchased = await checkUserPurchase(session.user.id, testPostId)
      
      debugInfo.purchaseCheck = {
        postId: testPostId,
        hasPurchased,
        userId: session.user.id
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
