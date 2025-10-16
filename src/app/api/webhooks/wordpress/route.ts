import { NextRequest, NextResponse } from 'next/server'
import { syncArticleWithWooCommerce, deleteArticleFromWooCommerce } from '@/lib/wordpress-sync'

const WEBHOOK_SECRET = process.env.WORDPRESS_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    if (token !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
    }

    const body = await request.json()
    const { action, post_id, post_title, post_content, post_status, acf_data } = body

    console.log(`🔔 WordPress webhook received: ${action} for post ${post_id}`)

    // Only process published posts
    if (post_status !== 'publish') {
      console.log(`⏭️ Skipping non-published post ${post_id}`)
      return NextResponse.json({ message: 'Skipped non-published post' })
    }

    // Extract ACF data
    const accessLevel = acf_data?.access || acf_data?.access_level || 'public'
    const price = parseFloat(acf_data?.price) || 0

    console.log(`📊 Post ${post_id} - Access: ${accessLevel}, Price: ${price}`)

    if (action === 'post_updated' || action === 'post_created') {
      // Only sync premium articles with valid price
      if (accessLevel === 'premium' && price > 0) {
        try {
          const result = await syncArticleWithWooCommerce({
            postId: post_id,
            title: post_title,
            content: post_content,
            accessLevel: accessLevel,
            price: price
          })

          console.log(`✅ Successfully synced post ${post_id}:`, result)
          return NextResponse.json({
            success: true,
            action: 'synced',
            productId: result.productId,
            sku: result.sku
          })
        } catch (error) {
          console.error(`❌ Failed to sync post ${post_id}:`, error)
          return NextResponse.json(
            { error: 'Failed to sync article', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          )
        }
      } else {
        console.log(`⏭️ Post ${post_id} is not premium or has no price, skipping sync`)
        return NextResponse.json({ message: 'Post not premium, skipped sync' })
      }
    } else if (action === 'post_deleted') {
      try {
        const result = await deleteArticleFromWooCommerce(post_id)
        console.log(`🗑️ Successfully deleted product for post ${post_id}:`, result)
        return NextResponse.json({
          success: true,
          action: 'deleted',
          productId: result.productId,
          sku: result.sku
        })
      } catch (error) {
        console.error(`❌ Failed to delete product for post ${post_id}:`, error)
        return NextResponse.json(
          { error: 'Failed to delete article product', details: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ message: 'Action not handled' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    message: 'WordPress webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}
