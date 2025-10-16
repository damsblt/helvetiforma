import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Vérifier le secret du webhook Sanity (sécurité)
    const secret = request.headers.get('sanity-webhook-secret')
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Extraire les informations du webhook
    const { _type, _id, operation } = body
    
    console.log('Sanity webhook received:', { _type, _id, operation })

    // Traiter seulement les articles (posts)
    if (_type === 'post') {
      // Récupérer les détails complets de l'article
      const post = await sanityClient.fetch(
        `*[_type == "post" && _id == $postId][0]{
          _id,
          title,
          slug,
          accessLevel,
          price,
          _createdAt,
          _updatedAt
        }`,
        { postId: _id }
      )

      if (!post) {
        console.log('Article non trouvé:', _id)
        return NextResponse.json({ message: 'Article not found' }, { status: 404 })
      }

      console.log('Article trouvé:', {
        title: post.title,
        accessLevel: post.accessLevel,
        price: post.price
      })

      // Vérifier si c'est un article premium
      if (post.accessLevel === 'premium' && post.price && post.price > 0) {
        console.log('🔄 Article premium détecté, création du produit WooCommerce...')
        
        try {
          // Appeler l'API de création de produit WooCommerce
          const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/woocommerce/create-product`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET || 'default-secret'}`
            },
            body: JSON.stringify({
              postId: post._id,
              title: post.title,
              slug: post.slug?.current,
              price: post.price,
              operation
            })
          })

          if (response.ok) {
            const result = await response.json()
            console.log('✅ Produit WooCommerce créé:', result)
          } else {
            console.error('❌ Erreur création produit WooCommerce:', await response.text())
          }
        } catch (error) {
          console.error('❌ Erreur lors de la création du produit WooCommerce:', error)
        }
      } else {
        console.log('Article non premium, aucune action requise')
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erreur webhook Sanity:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

// Gérer les requêtes GET pour les tests
export async function GET() {
  return NextResponse.json({ 
    message: 'Sanity webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
