import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('🎉 Course checkout session completed:', session.id)
      console.log('🔍 Session metadata:', session.metadata)

      if (session.payment_status === 'paid' && session.metadata) {
        const { courseId, userId, courseTitle, courseSlug } = session.metadata
        
        if (courseId && userId) {
          console.log('🔄 Processing course enrollment...')
          
          // Enroll user in course
          try {
            const enrollmentResponse = await fetch(`${STRIPE_CONFIG.baseUrl}/api/tutor-lms/enrollments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseId,
                userId,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                paymentMethod: 'stripe',
                paymentIntentId: session.payment_intent
              })
            })

            const enrollmentData = await enrollmentResponse.json()
            
            if (enrollmentData.success) {
              console.log('✅ Course enrollment successful:', enrollmentData)
            } else {
              console.error('❌ Course enrollment failed:', enrollmentData)
            }
          } catch (enrollmentError) {
            console.error('❌ Enrollment error:', enrollmentError)
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

