import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { recordPurchase, updatePurchaseStatus } from '@/lib/purchases-supabase'
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

          // Enregistrer l'achat dans Supabase
          const result = await recordPurchase({
            userId,
            postId,
            postTitle: postTitle || 'Article inconnu',
            amount: session.amount_total || 0,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
          })

          if (!result.success) {
            console.error('Erreur lors de l\'enregistrement de l\'achat:', result.error)
          } else {
            console.log(`Achat enregistré: ${postTitle} pour ${userId}`)
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        try {
          const result = await updatePurchaseStatus(
            paymentIntent.metadata.stripeSessionId,
            'completed',
            paymentIntent.id
          )

          if (!result.success) {
            console.error('Erreur lors de la mise à jour du statut:', result.error)
          } else {
            console.log('Statut de l\'achat mis à jour avec succès')
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut:', error)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        try {
          const result = await updatePurchaseStatus(
            paymentIntent.metadata.stripeSessionId,
            'failed',
            paymentIntent.id
          )

          if (!result.success) {
            console.error('Erreur lors de la mise à jour du statut:', result.error)
          } else {
            console.log('Statut de l\'achat mis à jour en échec')
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut:', error)
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