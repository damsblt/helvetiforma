// WordPress-WooCommerce Sync Utility
export interface ArticleData {
  postId: number
  title: string
  content: string
  accessLevel: string
  price: number
}

export async function syncArticleWithWooCommerce(article: ArticleData) {
  try {
    const response = await fetch('/api/wordpress/sync-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(article)
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to sync article')
    }

    return result
  } catch (error) {
    console.error('Error syncing article:', error)
    throw error
  }
}

export async function deleteArticleFromWooCommerce(postId: number) {
  try {
    const response = await fetch('/api/wordpress/sync-article', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete article product')
    }

    return result
  } catch (error) {
    console.error('Error deleting article product:', error)
    throw error
  }
}

export async function checkArticleProduct(postId: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products?sku=article-${postId}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to check product')
    }

    const products = await response.json()
    return products.length > 0 ? products[0] : null
  } catch (error) {
    console.error('Error checking article product:', error)
    return null
  }
}
