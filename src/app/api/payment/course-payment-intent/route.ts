import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, amount } = await request.json()
    
    console.log('🎯 Course Payment Intent - Request:', { courseId, userId, amount })
    
    if (!courseId || !userId || amount === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters',
          message: 'Course ID, User ID, and amount are required' 
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

    // Get course details for metadata
    let courseTitle = 'Formation'
    try {
      const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/tutor/v1/courses/${courseId}`)
      if (courseResponse.ok) {
        const course = await courseResponse.json()
        courseTitle = course.title || 'Formation'
      }
    } catch (error) {
      console.warn('Could not fetch course details for metadata:', error)
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'chf',
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseTitle,
        type: 'course'
      },
      description: `Achat de la formation: ${courseTitle}`,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('✅ Course Payment Intent created:', paymentIntent.id)

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('❌ Course Payment Intent Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

