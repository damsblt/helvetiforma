import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export async function POST(request: NextRequest) {
  try {
    const { userId, postId, postTitle, postSlug, amount, stripeSessionId, stripePaymentIntentId } = await request.json()

    if (!userId || !postId) {
      return NextResponse.json(
        { error: 'userId et postId requis' },
        { status: 400 }
      )
    }

    // Créer un client Sanity avec token pour les opérations d'écriture
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      token: process.env.SANITY_API_TOKEN!,
      useCdn: false,
      apiVersion: '2023-05-03'
    })

    // Créer un document d'achat dans Sanity
    const purchase = await client.create({
      _type: 'purchase',
      userId,
      postId,
      postSlug: postSlug || 'unknown-slug',
      postTitle: postTitle || 'Article inconnu',
      amount: amount / 100, // Convertir de centimes en CHF
      purchasedAt: new Date().toISOString(),
      stripeSessionId,
      status: 'completed'
    })

    console.log('✅ Achat enregistré dans Sanity:', {
      purchaseId: purchase._id,
      userId,
      postId,
      postTitle,
      amount: amount / 100
    })

    return NextResponse.json({
      success: true,
      purchaseId: purchase._id
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'achat:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'achat' },
      { status: 500 }
    )
  }
}