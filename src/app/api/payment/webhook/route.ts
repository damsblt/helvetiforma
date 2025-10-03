import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sanityClient } from '@/lib/sanity'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Erreur de vérification webhook:', err)
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const { postId, userId, postTitle } = session.metadata || {}
          
          if (!postId || !userId) {
            console.error('Métadonnées manquantes dans la session')
            break
          }

          // Enregistrer l'achat dans Sanity
          await recordPurchase({
            userId,
            postId,
            postTitle: postTitle || 'Article inconnu',
            amount: session.amount_total ? session.amount_total / 100 : 0,
            stripeSessionId: session.id,
            purchasedAt: new Date().toISOString(),
          })

          console.log(`Achat enregistré: ${postTitle} pour ${userId}`)
        }
        break
      }
      
      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error)
    return NextResponse.json(
      { error: 'Erreur de traitement' },
      { status: 500 }
    )
  }
}

async function recordPurchase({
  userId,
  postId,
  postTitle,
  amount,
  stripeSessionId,
  purchasedAt,
}: {
  userId: string
  postId: string
  postTitle: string
  amount: number
  stripeSessionId: string
  purchasedAt: string
}) {
  try {
    // Créer un document d'achat dans Sanity
    await sanityClient.create({
      _type: 'purchase',
      userId,
      postId,
      postTitle,
      amount,
      stripeSessionId,
      purchasedAt,
      status: 'completed',
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'achat:', error)
    throw error
  }
}
