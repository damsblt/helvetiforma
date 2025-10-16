import { NextRequest, NextResponse } from 'next/server'

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL + '/wp-json/wc/v3'
const WOOCOMMERCE_AUTH = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString('base64')

export async function POST(request: NextRequest) {
  try {
    const { postId, title, content, accessLevel, price } = await request.json()
    
    if (!postId || !title || !accessLevel || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, title, accessLevel, price' },
        { status: 400 }
      )
    }

    // Only create products for premium articles
    if (accessLevel !== 'premium' || price <= 0) {
      return NextResponse.json(
        { error: 'Only premium articles with valid price can be synced' },
        { status: 400 }
      )
    }

    const sku = `article-${postId}`
    
    // Check if product already exists
    const existingProducts = await fetch(
      `${WOOCOMMERCE_API_URL}/products?sku=${sku}`,
      {
        headers: {
          'Authorization': `Basic ${WOOCOMMERCE_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const existingData = await existingProducts.json()
    
    if (existingData.length > 0) {
      // Update existing product
      const productId = existingData[0].id
      const updateResponse = await fetch(
        `${WOOCOMMERCE_API_URL}/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${WOOCOMMERCE_AUTH}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: title,
            description: content,
            regular_price: price.toString(),
            meta_data: [
              { key: '_post_id', value: postId.toString() },
              { key: '_helvetiforma_article', value: 'yes' }
            ]
          })
        }
      )

      if (updateResponse.ok) {
        return NextResponse.json({
          success: true,
          action: 'updated',
          productId: productId,
          sku: sku
        })
      }
    } else {
      // Create new product
      const createResponse = await fetch(
        `${WOOCOMMERCE_API_URL}/products`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${WOOCOMMERCE_AUTH}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: title,
            type: 'simple',
            status: 'publish',
            featured: false,
            catalog_visibility: 'visible',
            description: content,
            short_description: content.substring(0, 200) + '...',
            sku: sku,
            regular_price: price.toString(),
            manage_stock: false,
            stock_status: 'instock',
            virtual: true,
            downloadable: false,
            meta_data: [
              { key: '_post_id', value: postId.toString() },
              { key: '_helvetiforma_article', value: 'yes' }
            ]
          })
        }
      )

      if (createResponse.ok) {
        const product = await createResponse.json()
        return NextResponse.json({
          success: true,
          action: 'created',
          productId: product.id,
          sku: sku
        })
      }
    }

    return NextResponse.json(
      { error: 'Failed to sync article with WooCommerce' },
      { status: 500 }
    )

  } catch (error) {
    console.error('Error syncing article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { postId } = await request.json()
    
    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    const sku = `article-${postId}`
    
    // Find product by SKU
    const existingProducts = await fetch(
      `${WOOCOMMERCE_API_URL}/products?sku=${sku}`,
      {
        headers: {
          'Authorization': `Basic ${WOOCOMMERCE_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const existingData = await existingProducts.json()
    
    if (existingData.length > 0) {
      const productId = existingData[0].id
      
      // Delete product
      const deleteResponse = await fetch(
        `${WOOCOMMERCE_API_URL}/products/${productId}?force=true`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${WOOCOMMERCE_AUTH}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (deleteResponse.ok) {
        return NextResponse.json({
          success: true,
          action: 'deleted',
          productId: productId,
          sku: sku
        })
      }
    }

    return NextResponse.json(
      { error: 'Product not found or failed to delete' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
