import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    // Get existing WooCommerce products
    const products = await wooCommerceService.getProducts({
      status: 'publish',
      per_page: 10
    });

    // Filter course products
    const courseProducts = products.filter((product: any) => {
      return product.meta_data?.some((meta: any) =>
        meta.key === '_tutor_course_id' ||
        (meta.key === '_tutor_product' && meta.value === 'yes')
      );
    });

    // Simulate updating products with course details
    const results = [];

    for (const product of courseProducts) {
      try {
        // Get current product details
        const currentProduct = await wooCommerceService.getProduct(product.id);
        
        // Update product with enhanced course details
        const updatedData = {
          ...currentProduct,
          meta_data: [
            ...(currentProduct.meta_data || []),
            {
              key: '_course_duration',
              value: '3 jours'
            },
            {
              key: '_course_level',
              value: 'Intermédiaire'
            },
            {
              key: '_course_price',
              value: currentProduct.regular_price || '0'
            },
            {
              key: '_intro_video',
              value: ''
            }
          ]
        };

        // Update the product
        const updatedProduct = await wooCommerceService.updateProduct(product.id, updatedData);

        results.push({
          product_id: product.id,
          product_name: product.name,
          status: 'updated',
          message: 'Course details added successfully',
          course_duration: '3 jours',
          course_level: 'Intermédiaire',
          course_price: currentProduct.regular_price || '0'
        });

      } catch (error) {
        results.push({
          product_id: product.id,
          product_name: product.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Demo synchronization completed'
    });

  } catch (error) {
    console.error('Demo sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run demo sync',
        message: 'Erreur lors de la démonstration de synchronisation'
      },
      { status: 500 }
    );
  }
}
