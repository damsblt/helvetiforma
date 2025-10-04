import { NextRequest, NextResponse } from 'next/server'
import { checkUserPurchase } from '@/lib/purchases'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const postId = searchParams.get('postId')

    if (!userId || !postId) {
      return NextResponse.json(
        { error: 'userId and postId are required' },
        { status: 400 }
      )
    }

    const hasPurchased = await checkUserPurchase(userId, postId)

    return NextResponse.json({
      hasPurchased,
      userId,
      postId
    })

  } catch (error) {
    console.error('Error checking purchase:', error)
    return NextResponse.json(
      { error: 'Error checking purchase' },
      { status: 500 }
    )
  }
}
