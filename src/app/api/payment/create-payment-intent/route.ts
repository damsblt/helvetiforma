import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { sanityClient } from '@/lib/sanity'
import { getServerSession } from 'next-auth'
import { workingAuthOptions } from '@/lib/auth-working'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()
    
    // Get the current session
    const session = await getServerSession(workingAuthOptions)
    
    console.log('🔍 PaymentIntent API - Session:', { 
      hasSession: !!session, 
      user: session?.user ? { 
        id: (session.user as any).id, 
        email: session.user.email 
      } : null,
      postId 
    })
    
    if (!session?.user) {
      console.log('❌ Utilisateur non connecté')
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer un achat' },
        { status: 401 }
      )
    }
    
    const user = session.user
    const userId = (user as any).id
    
    if (!userId) {
      console.log('❌ ID utilisateur manquant dans la session')
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }
    
    if (!postId) {
      console.log('❌ ID de l\'article manquant')
      return NextResponse.json(
        { error: 'ID de l\'article requis' },
        { status: 400 }
      )
    }

    console.log('🔍 Recherche de l\'article dans Sanity avec ID:', postId)
    
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
    
    console.log('🔍 Article trouvé dans Sanity:', post)

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
        userId: userId,
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
