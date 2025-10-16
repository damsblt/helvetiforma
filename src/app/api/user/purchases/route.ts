import { NextRequest, NextResponse } from 'next/server'
import { getUserPurchases } from '@/lib/user-content'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      )
    }

    // Récupérer les achats de l'utilisateur
    const purchases = await getUserPurchases(userId)

    return NextResponse.json({
      success: true,
      purchases,
      count: purchases.length
    })

  } catch (error) {
    console.error('Erreur récupération achats utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achats' },
      { status: 500 }
    )
  }
}