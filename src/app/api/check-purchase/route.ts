import { NextRequest, NextResponse } from 'next/server'
import { checkUserPurchase } from '@/lib/wordpress-purchases'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const userId = searchParams.get('userId')

    if (!postId) {
      return NextResponse.json(
        { error: 'postId parameter is required' },
        { status: 400 }
      )
    }

    // If no userId provided, return not authenticated
    if (!userId) {
      return NextResponse.json(
        { hasPurchased: false, isAuthenticated: false, error: 'userId parameter required' },
        { status: 200 }
      )
    }

    // Check if user has purchased this specific article
    const hasPurchased = await checkUserPurchase(userId, postId)

    console.log('🔍 Check purchase API:', {
      userId,
      postId,
      hasPurchased
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