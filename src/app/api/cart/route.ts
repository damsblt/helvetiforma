import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

// GET /api/cart - Get cart contents
export async function GET(request: NextRequest) {
  try {
    // For now, we'll use a simple in-memory cart
    // In production, you'd store this in a database or session
    const cart = {
      items: [],
      total: 0,
      currency: 'CHF'
    };

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Cart retrieved successfully'
    });

  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get cart',
        message: 'Erreur lors de la récupération du panier'
      },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity = 1 } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details from WooCommerce
    const product = await wooCommerceService.getProduct(parseInt(product_id));
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create cart item
    const cartItem = {
      product_id: product.id,
      name: product.name,
      price: parseFloat(product.regular_price),
      quantity: quantity,
      total: parseFloat(product.regular_price) * quantity,
      image: product.images?.[0]?.src || '',
      course_id: product.meta_data?.find((meta: any) => 
        meta.key === '_tutor_course_id'
      )?.value,
      course_duration: product.meta_data?.find((meta: any) => 
        meta.key === '_course_duration'
      )?.value || '3 jours',
      course_level: product.meta_data?.find((meta: any) => 
        meta.key === '_course_level'
      )?.value || 'Intermédiaire'
    };

    // For demo purposes, we'll return the cart item
    // In production, you'd store this in a database or session
    const cart = {
      items: [cartItem],
      total: cartItem.total,
      currency: 'CHF',
      item_count: quantity
    };

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add item to cart',
        message: 'Erreur lors de l\'ajout au panier'
      },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const { product_id, quantity } = await request.json();

    if (!product_id || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll return updated cart
    // In production, you'd update the cart in database/session
    const cart = {
      items: [],
      total: 0,
      currency: 'CHF',
      item_count: 0
    };

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update cart',
        message: 'Erreur lors de la mise à jour du panier'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll return empty cart
    // In production, you'd remove the item from database/session
    const cart = {
      items: [],
      total: 0,
      currency: 'CHF',
      item_count: 0
    };

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove item from cart',
        message: 'Erreur lors de la suppression du panier'
      },
      { status: 500 }
    );
  }
}
