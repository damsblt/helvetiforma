import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, courseId, userId } = await request.json()
    
    console.log('🔄 Processing course payment:', { sessionId, courseId, userId })
    
    if (!sessionId || !courseId || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters' 
        },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    console.log('🔍 Stripe session:', {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total
    })

    if (session.payment_status === 'paid') {
      // Enroll user in course
      try {
        const enrollmentResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tutor-lms/enrollments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            userId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            paymentMethod: 'stripe',
            paymentIntentId: sessionId // Use the checkout session ID instead of payment intent
          })
        })

        const enrollmentData = await enrollmentResponse.json()
        
        if (enrollmentData.success) {
          console.log('✅ Course enrollment successful:', enrollmentData)
          return NextResponse.json({
            success: true,
            message: 'Payment processed and user enrolled successfully',
            data: enrollmentData
          })
        } else {
          console.error('❌ Course enrollment failed:', enrollmentData)
          return NextResponse.json({
            success: false,
            error: 'Enrollment failed',
            details: enrollmentData
          }, { status: 500 })
        }
      } catch (enrollmentError) {
        console.error('❌ Enrollment error:', enrollmentError)
        return NextResponse.json({
          success: false,
          error: 'Enrollment processing failed',
          details: enrollmentError
        }, { status: 500 })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        payment_status: session.payment_status
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Process course payment error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
