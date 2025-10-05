import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPurchases } from '@/lib/purchases'

export async function GET(request: NextRequest) {
  try {
    // Vérifier la session utilisateur
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching purchases for user:', { userId, email: session.user.email })

    // Récupérer les achats de l'utilisateur
    const purchases = await getUserPurchases(userId)
    
    console.log('🔍 Found purchases:', { 
      count: purchases.length,
      purchases: purchases.map(p => ({ 
        id: p._id, 
        title: p.postTitle, 
        amount: p.amount, 
        status: p.status,
        date: p.purchasedAt 
      }))
    })

    return NextResponse.json({
      success: true,
      purchases: purchases,
      count: purchases.length
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des achats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achats' },
      { status: 500 }
    )
  }
}
