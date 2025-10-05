import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { sanityClient } from '@/lib/sanity'

export async function POST(request: NextRequest) {
  try {
    const { postId, user } = await request.json()
    
    if (!user || !user.id || !user.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer un achat' },
        { status: 401 }
      )
    }
    
    if (!postId) {
      return NextResponse.json(
        { error: 'ID de l\'article requis' },
        { status: 400 }
      )
    }

    // Récupérer l'article depuis Sanity
    const post = await sanityClient.fetch(
      `*[_type == "post" && _id == $postId][0]{
        _id,
        title,
        price,
        accessLevel,
        slug
      }`,
      { postId }
    )

    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    if (post.accessLevel !== 'premium' || !post.price) {
      return NextResponse.json(
        { error: 'Cet article n\'est pas disponible à l\'achat' },
        { status: 400 }
      )
    }

    // Créer un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(post.price),
      currency: 'chf',
      metadata: {
        postId: post._id,
        postSlug: post.slug.current,
        userId: user.id,
        postTitle: post.title,
      },
    })

    return NextResponse.json({ 
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
