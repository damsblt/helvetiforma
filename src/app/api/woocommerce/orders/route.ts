import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : 10,
      status: searchParams.get('status') || undefined,
      customer: searchParams.get('customer') ? parseInt(searchParams.get('customer')!) : undefined,
    };

    const orders = await wooCommerceService.getOrders(params);

    return NextResponse.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    });

  } catch (error) {
    console.error('WooCommerce orders API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        message: 'Erreur lors de la récupération des commandes'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required fields
    if (!orderData.line_items || !Array.isArray(orderData.line_items) || orderData.line_items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order must have at least one line item',
          message: 'La commande doit contenir au moins un article'
        },
        { status: 400 }
      );
    }

    const order = await wooCommerceService.createOrder(orderData);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('WooCommerce create order API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order',
        message: 'Erreur lors de la création de la commande'
      },
      { status: 500 }
    );
  }
}
