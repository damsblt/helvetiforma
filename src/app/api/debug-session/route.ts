import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { workingAuthOptions } from '@/lib/auth-working'
import { checkUserPurchase } from '@/lib/purchases'

export async function GET(request: NextRequest) {
  try {
    // Get NextAuth session
    const session = await getServerSession(workingAuthOptions)
    
    // Try to get session from cookies first
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    const debugInfo: any = {
      hasSession: !!session,
      user: session?.user ? {
        id: (session.user as any).id || 'no-id',
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
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
      const userId = (session.user as any).id
      const hasPurchased = await checkUserPurchase(userId, testPostId)
      
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
        { userId: userId }
      )
      
      debugInfo.purchaseCheck = {
        postId: testPostId,
        hasPurchased,
        userId: userId,
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
