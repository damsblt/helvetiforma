import { NextRequest, NextResponse } from 'next/server'
import { getUserContent } from '@/lib/user-content'

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

    // Récupérer tout le contenu de l'utilisateur
    const content = await getUserContent(userId)

    return NextResponse.json({
      success: true,
      content
    })

  } catch (error) {
    console.error('Erreur récupération contenu utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu' },
      { status: 500 }
    )
  }
}
