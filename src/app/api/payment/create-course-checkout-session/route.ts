import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, amount, courseTitle, courseSlug } = await request.json()
    
    console.log('🎯 Course Checkout Session - Request:', { courseId, userId, amount, courseTitle, courseSlug })
    
    if (!courseId || !userId || !amount || !courseTitle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters',
          message: 'Course ID, User ID, amount, and course title are required' 
        },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid amount',
          message: 'Amount must be greater than 0' 
        },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: courseTitle,
              description: `Formation: ${courseTitle}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/courses/${courseSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/courses/${courseSlug}?payment=cancelled`,
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseTitle,
        courseSlug,
        type: 'course'
      },
      customer_email: userId.includes('@') ? userId : undefined,
    })

    console.log('✅ Course Checkout Session created:', session.id)

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('❌ Course Checkout Session Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
