import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();
    
    console.log('API /cart/add received:', { productId, quantity, type: typeof productId });

    if (!productId) {
      console.error('No product ID provided');
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
          message: 'ID du produit requis'
        },
        { status: 400 }
      );
    }

    // Get product details from WooCommerce
    console.log('Fetching product from WooCommerce:', productId);
    const product = await wooCommerceService.getProduct(productId);
    console.log('WooCommerce product response:', product);

    if (!product) {
      console.error('Product not found in WooCommerce:', productId);
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: 'Produit non trouvé'
        },
        { status: 404 }
      );
    }

    // Create cart item
    const cartItem = {
      product_id: product.id,
      quantity: quantity,
      name: product.name,
      price: parseFloat(product.regular_price || '0'),
      total: parseFloat(product.regular_price || '0') * quantity,
      image: product.images?.[0]?.src || '',
      course_id: product.meta_data?.find((meta: any) => meta.key === '_tutor_course_id')?.value || product.id,
      course_duration: product.meta_data?.find((meta: any) => meta.key === '_course_duration')?.value,
      course_level: product.meta_data?.find((meta: any) => meta.key === '_course_level')?.value,
    };

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Product added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    
    // Ensure we always return a proper error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to add product to cart';
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: 'Erreur lors de l\'ajout du produit au panier',
      details: error instanceof Error ? error.stack : undefined
    };
    
    console.error('Returning error response:', errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
