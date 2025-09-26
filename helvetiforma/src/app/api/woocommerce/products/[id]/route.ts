import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID',
          message: 'ID de produit invalide'
        },
        { status: 400 }
      );
    }

    const product = await wooCommerceService.getProduct(productId);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });

  } catch (error) {
    console.error('WooCommerce product API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        message: 'Erreur lors de la récupération du produit'
      },
      { status: 500 }
    );
  }
}