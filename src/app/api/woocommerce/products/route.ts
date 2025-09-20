import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : 10,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || 'publish',
    };

    const products = await wooCommerceService.getProducts(params);

    return NextResponse.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });

  } catch (error) {
    console.error('WooCommerce products API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        message: 'Erreur lors de la récupération des produits'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    // Validate required fields
    if (!productData.name || !productData.type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product name and type are required',
          message: 'Le nom et le type du produit sont requis'
        },
        { status: 400 }
      );
    }

    const product = await wooCommerceService.createProduct(productData);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('WooCommerce create product API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create product',
        message: 'Erreur lors de la création du produit'
      },
      { status: 500 }
    );
  }
}
