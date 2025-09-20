import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing WooCommerce service...');
    
    // Test getting a product
    const product = await wooCommerceService.getProduct(120);
    
    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.regular_price
      }
    });
  } catch (error) {
    console.error('WooCommerce test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
