import { NextRequest, NextResponse } from 'next/server'
import { getWordPressPostById } from '@/lib/wordpress'
import { checkForExistingArticleOrder, logOrderCreationAttempt } from '@/lib/woocommerce-duplicate-prevention'

export async function POST(request: NextRequest) {
  try {
    const { postId, userId, amount } = await request.json()
    
    console.log('🔍 Record Purchase API - Request:', { postId, userId, amount })
    
    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'postId and userId are required' },
        { status: 400 }
      )
    }

    // Get the article details
    const post = await getWordPressPostById(postId)
    if (!post) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Find WooCommerce product ID
    let productId = post.acf?.woocommerce_product_id || post.meta?.woocommerce_product_id
    
    if (!productId) {
      // Search by SKU
      try {
        const productResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products?sku=article-${postId}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          }
        })
        
        if (productResponse.ok) {
          const products = await productResponse.json()
          if (products && products.length > 0) {
            productId = products[0].id
          }
        }
      } catch (error) {
        console.error('Error finding product by SKU:', error)
      }
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'WooCommerce product not found' },
        { status: 404 }
      )
    }

    // Check if customer exists, create if not
    let customerId = null
    
    try {
      // First, try to find customer by email
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`)
      if (userResponse.ok) {
        const user = await userResponse.json()
        const email = user.email || `user${userId}@example.com`
        
        // Search for existing customer by email
        const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          }
        })
        
        if (searchResponse.ok) {
          const customers = await searchResponse.json()
          if (customers && customers.length > 0) {
            customerId = customers[0].id
            console.log('✅ Found existing customer:', customerId)
          }
        }
        
        // If no customer found, create a new one
        if (!customerId) {
          console.log('🔍 Creating new customer for user:', userId)
          const newCustomerResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
            },
            body: JSON.stringify({
              email: email,
              first_name: user.name || 'User',
              last_name: '',
              username: user.slug || `user${userId}`,
              password: 'temp_password_123' // WooCommerce requires a password
            })
          })
          
          if (newCustomerResponse.ok) {
            const newCustomer = await newCustomerResponse.json()
            customerId = newCustomer.id
            console.log('✅ Created new customer:', customerId)
          } else {
            const errorData = await newCustomerResponse.json()
            console.error('❌ Failed to create customer:', errorData)
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling customer:', error)
    }
    
    // If we still don't have a customer ID, create a guest order
    if (!customerId) {
      console.log('⚠️ No customer ID available, creating guest order')
    }

    // Check for existing order to prevent duplicates
    const existingOrder = await checkForExistingArticleOrder(
      customerId || 0,
      postId,
      productId
    );
    
    logOrderCreationAttempt('article', {
      customerId: customerId || 0,
      productId,
      postId
    }, existingOrder);
    
    if (existingOrder) {
      console.log(`⚠️  Skipping order creation - duplicate order ${existingOrder.id} already exists`);
      return NextResponse.json({ 
        success: true, 
        orderId: existingOrder.id,
        message: 'Order already exists, returning existing order ID'
      });
    }

    // Create WooCommerce order
    const orderData: any = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      line_items: [
        {
          product_id: productId,
          quantity: 1
        }
      ],
      meta_data: [
        {
          key: '_helvetiforma_article_id',
          value: postId
        },
        {
          key: '_post_id',
          value: postId
        },
        {
          key: '_user_id',
          value: userId
        }
      ]
    }
    
    // Only add customer_id if we have one
    if (customerId) {
      orderData.customer_id = customerId
    } else {
      // For guest orders, add billing information
      orderData.billing = {
        first_name: 'Guest',
        last_name: 'User',
        email: `user${userId}@example.com`
      }
    }

    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify(orderData)
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('WooCommerce order creation failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    const order = await orderResponse.json()
    console.log('✅ Order created:', order.id)

    return NextResponse.json({ 
      success: true, 
      orderId: order.id 
    })

  } catch (error) {
    console.error('❌ Record Purchase API - Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
