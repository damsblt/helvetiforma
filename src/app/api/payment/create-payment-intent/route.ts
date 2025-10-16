import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { getWordPressPostById } from '@/lib/wordpress'

export async function POST(request: NextRequest) {
  try {
    const { postId, userId } = await request.json()
    
    console.log('🔍 PaymentIntent API - Request data:', { 
      postId, 
      userId 
    })
    
    if (!userId) {
      console.log('❌ User ID manquant')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (!postId) {
      console.log('❌ ID de l\'article manquant')
      return NextResponse.json(
        { error: 'ID de l\'article requis' },
        { status: 400 }
      )
    }

    console.log('🔍 Recherche de l\'article dans WordPress avec ID:', postId)
    
    // Récupérer l'article depuis WordPress
    const post = await getWordPressPostById(postId)
    
    console.log('🔍 Article trouvé dans WordPress:', post)

    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    if (post.accessLevel !== 'premium') {
      return NextResponse.json(
        { error: 'Cet article n\'est pas disponible à l\'achat' },
        { status: 400 }
      )
    }

    // Vérifier si l'article est gratuit (prix = 0)
    const isFree = post.price === 0 || post.price === null || post.price === undefined
    
    if (isFree) {
      // Pour les articles gratuits, retourner un clientSecret spécial
      return NextResponse.json({ 
        success: true,
        clientSecret: 'free_article',
        isFree: true
      })
    }

    // Créer un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(post.price),
      currency: 'chf',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        postId: post._id.toString(),
        postSlug: typeof post.slug === 'string' ? post.slug : post.slug?.current || '',
        userId: userId,
        postTitle: post.title,
      },
    })

    return NextResponse.json({ 
      success: true,
      clientSecret: paymentIntent.client_secret 
    })

  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
