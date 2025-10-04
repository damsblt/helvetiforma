import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { checkUserPurchase } from '@/lib/purchases'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Try to get session from cookies first
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    const { data: { session } } = await supabase.auth.getSession()
    
    const debugInfo: any = {
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
        raw_user_meta_data: session.user.user_metadata,
        app_metadata: session.user.app_metadata
      } : null,
      headers: {
        authorization: authHeader ? 'present' : 'missing',
        cookie: cookieHeader ? 'present' : 'missing',
        cookieValue: cookieHeader
      },
      timestamp: new Date().toISOString()
    }

    // If user is logged in, check their purchases
    if (session?.user) {
      const testPostId = '040b76b6-4718-4b2c-a11f-c6277c9f937c' // test-2 post
      const hasPurchased = await checkUserPurchase(session.user.id, testPostId)
      
      // Also check all purchases for this user
      const { createClient } = require('@sanity/client')
      const sanityClient = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        token: process.env.SANITY_API_TOKEN,
        useCdn: false,
        apiVersion: '2023-05-03'
      })
      
      const allUserPurchases = await sanityClient.fetch(
        `*[_type == "purchase" && userId == $userId] | order(purchasedAt desc)`,
        { userId: session.user.id }
      )
      
      debugInfo.purchaseCheck = {
        postId: testPostId,
        hasPurchased,
        userId: session.user.id,
        allPurchases: allUserPurchases.map((p: any) => ({
          id: p._id,
          postId: p.postId,
          postTitle: p.postTitle,
          status: p.status,
          amount: p.amount
        }))
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
