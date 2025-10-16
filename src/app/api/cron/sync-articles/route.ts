import { NextRequest, NextResponse } from 'next/server'
import { syncArticleWithWooCommerce, deleteArticleFromWooCommerce } from '@/lib/wordpress-sync'

const CRON_SECRET = process.env.CRON_SECRET || 'helvetiforma-cron-secret-2025'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting scheduled article sync...')
    
    // Get all published posts from WordPress
    const posts = await fetchWordPressPosts()
    
    if (!posts || posts.length === 0) {
      return NextResponse.json({ 
        message: 'No posts found',
        synced: 0,
        errors: 0
      })
    }

    let synced = 0
    let errors = 0
    const results = []

    for (const post of posts) {
      try {
        const accessLevel = post.acf?.access || post.acf?.access_level || 'public'
        const price = parseFloat(post.acf?.price) || 0

        // Only sync premium articles with valid price
        if (accessLevel === 'premium' && price > 0) {
          const result = await syncArticleWithWooCommerce({
            postId: post.id,
            title: post.title.rendered,
            content: post.content.rendered,
            accessLevel: accessLevel,
            price: price
          })

          results.push({
            postId: post.id,
            title: post.title.rendered,
            status: 'synced',
            productId: result.productId,
            sku: result.sku
          })
          synced++
        } else {
          results.push({
            postId: post.id,
            title: post.title.rendered,
            status: 'skipped',
            reason: accessLevel !== 'premium' ? 'not_premium' : 'no_price'
          })
        }
      } catch (error) {
        console.error(`❌ Error syncing post ${post.id}:`, error)
        results.push({
          postId: post.id,
          title: post.title.rendered,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
        errors++
      }
    }

    console.log(`✅ Scheduled sync completed: ${synced} synced, ${errors} errors`)

    return NextResponse.json({
      message: 'Scheduled sync completed',
      synced,
      errors,
      total: posts.length,
      results
    })

  } catch (error) {
    console.error('❌ Scheduled sync error:', error)
    return NextResponse.json(
      { error: 'Scheduled sync failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function fetchWordPressPosts() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/posts?per_page=100&status=publish`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching WordPress posts:', error)
    return null
  }
}
