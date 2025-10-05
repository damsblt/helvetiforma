import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUserPurchase } from '@/lib/purchases'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'postId parameter is required' },
        { status: 400 }
      )
    }

    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { hasPurchased: false, isAuthenticated: false },
        { status: 200 }
      )
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { hasPurchased: false, isAuthenticated: true, error: 'User ID not found' },
        { status: 200 }
      )
    }

    // Check if user has purchased this specific article
    const hasPurchased = await checkUserPurchase(userId, postId)

    console.log('🔍 Check purchase API:', {
      userId,
      postId,
      hasPurchased,
      userEmail: session.user.email
    })

    return NextResponse.json({
      hasPurchased,
      isAuthenticated: true,
      userId,
      postId
    })

  } catch (error) {
    console.error('❌ Error checking purchase:', error)
    return NextResponse.json(
      { error: 'Error checking purchase status' },
      { status: 500 }
    )
  }
}