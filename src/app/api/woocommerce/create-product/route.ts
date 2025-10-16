import { NextRequest, NextResponse } from 'next/server'

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch'
const WORDPRESS_USER = process.env.WORDPRESS_USER || 'gibivawa'
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD || ')zH2TdGo(alNTOAi'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'autorisation interne
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.INTERNAL_API_SECRET || 'default-secret'}`
    
    if (authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, title, slug, price, operation } = await request.json()

    if (!postId || !title || !price) {
      return NextResponse.json(
        { error: 'postId, title et price requis' },
        { status: 400 }
      )
    }

    console.log('🔄 Création du produit WooCommerce:', { postId, title, price, operation })

    // Vérifier si WooCommerce est accessible
    const wcTestResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    })

    if (!wcTestResponse.ok) {
      throw new Error(`WooCommerce non accessible: ${wcTestResponse.status}`)
    }

    // Vérifier si un produit existe déjà pour cet article
    const existingProductsResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products?search=${encodeURIComponent(title)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    })

    let existingProduct = null
    if (existingProductsResponse.ok) {
      const products = await existingProductsResponse.json()
      existingProduct = products.find((product: any) => 
        product.meta_data?.some((meta: any) => 
          meta.key === 'sanity_post_id' && meta.value === postId
        )
      )
    }

    if (existingProduct) {
      console.log('📝 Produit existant trouvé, mise à jour...')
      
      // Mettre à jour le produit existant
      const updateResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products/${existingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: title,
          regular_price: price.toString(),
          status: 'publish'
        })
      })

      if (updateResponse.ok) {
        const updatedProduct = await updateResponse.json()
        console.log('✅ Produit mis à jour:', updatedProduct.id)
        
        return NextResponse.json({
          success: true,
          productId: updatedProduct.id,
          action: 'updated',
          message: 'Produit WooCommerce mis à jour avec succès'
        })
      } else {
        throw new Error(`Erreur mise à jour produit: ${updateResponse.status}`)
      }
    } else {
      console.log('🆕 Création d\'un nouveau produit...')
      
      // Créer un nouveau produit
      const productData = {
        name: title,
        type: 'simple',
        regular_price: price.toString(),
        virtual: true,
        downloadable: false,
        status: 'publish',
        description: `Article premium: ${title}`,
        short_description: `Accès à l'article premium "${title}"`,
        meta_data: [
          {
            key: 'sanity_post_id',
            value: postId
          },
          {
            key: 'sanity_slug',
            value: slug || ''
          },
          {
            key: 'article_type',
            value: 'premium'
          }
        ]
      }

      const createResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (createResponse.ok) {
        const newProduct = await createResponse.json()
        console.log('✅ Nouveau produit créé:', newProduct.id)
        
        return NextResponse.json({
          success: true,
          productId: newProduct.id,
          action: 'created',
          message: 'Produit WooCommerce créé avec succès'
        })
      } else {
        const errorText = await createResponse.text()
        throw new Error(`Erreur création produit: ${createResponse.status} - ${errorText}`)
      }
    }

  } catch (error) {
    console.error('❌ Erreur création produit WooCommerce:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du produit WooCommerce',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Gérer les requêtes GET pour les tests
export async function GET() {
  return NextResponse.json({ 
    message: 'WooCommerce product creation endpoint is active',
    timestamp: new Date().toISOString()
  })
}
