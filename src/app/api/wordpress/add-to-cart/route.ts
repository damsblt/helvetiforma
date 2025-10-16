import { NextRequest, NextResponse } from 'next/server';
import { wordpressAuthClient } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  const { postId } = await request.json();
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  try {
    // Récupérer product_id depuis ACF
    const postResponse = await wordpressAuthClient(token).get(`/wp/v2/posts/${postId}`);
    const productId = postResponse.data.acf?.woocommerce;
    
    if (!productId) {
      return NextResponse.json({ error: 'Produit WooCommerce non trouvé pour cet article' }, { status: 404 });
    }
    
    // Rediriger vers la boutique WooCommerce
    return NextResponse.json({
      checkoutUrl: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/shop/`,
      productId: productId,
      message: 'Redirection vers la boutique. Vous pourrez ajouter le produit au panier.'
    });
  } catch (error: any) {
    console.error('Erreur add-to-cart:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'ajout au panier',
      details: error.message 
    }, { status: 500 });
  }
}
