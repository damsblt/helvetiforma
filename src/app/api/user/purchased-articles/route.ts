import { NextRequest, NextResponse } from 'next/server'
import { getUserPurchasedArticles } from '@/lib/wordpress'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    console.log('🔍 API: Récupération des articles achetés pour l\'utilisateur:', userId)

    const articles = await getUserPurchasedArticles(userId)

    return NextResponse.json({
      success: true,
      articles,
      count: articles.length
    })

  } catch (error) {
    console.error('❌ Erreur API articles achetés:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles achetés' },
      { status: 500 }
    )
  }
}
