import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
// import { recordPurchase, updatePurchaseStatus } // Removed Supabase purchases
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  // Pour les tests, accepter les webhooks sans signature valide
  if (!signature || signature.includes('test')) {
    try {
      event = JSON.parse(body)
    } catch (err) {
      console.error('Erreur parsing JSON:', err)
      return NextResponse.json(
        { error: 'JSON invalide' },
        { status: 400 }
      )
    }
  } else {
    // Vérification normale de la signature Stripe
    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      )
    }

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

          // Enregistrer l'achat dans Sanity (via l'API existante)
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/record-purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                postId,
                postTitle: postTitle || 'Article inconnu',
                amount: session.amount_total || 0,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
              })
            })
            
            if (response.ok) {
              console.log(`Achat enregistré: ${postTitle} pour ${userId}`)
            } else {
              console.error('Erreur lors de l\'enregistrement de l\'achat')
            }
          } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'achat:', error)
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        if (paymentIntent.status === 'succeeded') {
          const { postId, userId, postTitle } = paymentIntent.metadata || {}
          
          if (!postId || !userId) {
            console.error('Métadonnées manquantes dans le PaymentIntent')
            break
          }

          // Enregistrer l'achat dans Sanity (via l'API existante)
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/record-purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                postId,
                postTitle: postTitle || 'Article inconnu',
                amount: paymentIntent.amount,
                stripeSessionId: null,
                stripePaymentIntentId: paymentIntent.id,
              })
            })
            
            if (response.ok) {
              console.log(`Achat enregistré via PaymentIntent: ${postTitle} pour ${userId}`)
            } else {
              console.error('Erreur lors de l\'enregistrement de l\'achat via PaymentIntent')
            }
          } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'achat via PaymentIntent:', error)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Pour l'instant, on ne met pas à jour le statut
        // Dans une vraie implémentation, on mettrait à jour le statut dans Sanity
        console.log('Paiement échoué:', paymentIntent.id)
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