import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, amount, paymentIntentId, paymentMethod } = await request.json()
    
    console.log('🛒 Course Purchase Recording - Request:', { courseId, userId, amount, paymentIntentId, paymentMethod })
    
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

    // Get course details
    let courseTitle = 'Formation'
    let courseSlug = ''
    try {
      const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/tutor/v1/courses/${courseId}`)
      if (courseResponse.ok) {
        const course = await courseResponse.json()
        courseTitle = course.title || 'Formation'
        courseSlug = course.slug || ''
      }
    } catch (error) {
      console.warn('Could not fetch course details:', error)
    }

    // Get or create WooCommerce customer
    let customerId = parseInt(userId)
    try {
      const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
        }
      })
      
      if (!customerResponse.ok) {
        // Create customer
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`)
        if (userResponse.ok) {
          const user = await userResponse.json()
          const newCustomerResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
            },
            body: JSON.stringify({
              email: user.email || `user${userId}@example.com`,
              first_name: user.name || 'User',
              username: user.slug || `user${userId}`
            })
          })
          
          if (newCustomerResponse.ok) {
            const newCustomer = await newCustomerResponse.json()
            customerId = newCustomer.id
          }
        }
      }
    } catch (error) {
      console.error('Error handling customer:', error)
    }

    // Create WooCommerce order for course purchase
    const orderData = {
      payment_method: paymentMethod || 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: customerId,
      line_items: [
        {
          name: courseTitle,
          product_id: 0, // Virtual product for course
          quantity: 1,
          total: (amount * 100).toString(), // Amount in cents
          meta_data: [
            {
              key: '_course_id',
              value: courseId.toString()
            },
            {
              key: '_course_slug',
              value: courseSlug
            }
          ]
        }
      ],
      meta_data: [
        {
          key: '_helvetiforma_course_id',
          value: courseId.toString()
        },
        {
          key: '_course_id',
          value: courseId.toString()
        },
        {
          key: '_payment_intent_id',
          value: paymentIntentId || ''
        },
        {
          key: '_course_title',
          value: courseTitle
        }
      ]
    }

    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify(orderData)
    })

    if (orderResponse.ok) {
      const order = await orderResponse.json()
      console.log('✅ Course purchase recorded in WooCommerce:', order.id)
      
      return NextResponse.json({
        success: true,
        message: 'Course purchase recorded successfully',
        data: {
          orderId: order.id,
          courseId,
          userId,
          amount,
          paymentIntentId
        }
      })
    } else {
      const errorData = await orderResponse.json()
      console.error('❌ WooCommerce order creation failed:', errorData)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create WooCommerce order',
          message: errorData.message || 'Could not record purchase'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Course Purchase Recording Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record course purchase',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

