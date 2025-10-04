import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth-supabase'
import { sanityClient } from '@/lib/sanity'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer un achat' },
        { status: 401 }
      )
    }

    const { postId } = await request.json()
    
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

    // Créer la session de paiement Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: post.title,
              description: `Article premium: ${post.title}`,
            },
            unit_amount: formatAmountForStripe(post.price),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/posts/${post.slug.current}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/posts/${post.slug.current}?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        postId: post._id,
        userId: user.id,
        postTitle: post.title,
      },
    })

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
