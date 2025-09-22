import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';
import { unstable_cache } from 'next/cache';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

// Cached function to get course products
const getCachedCourseProducts = unstable_cache(
  async () => {
    // Get all products that are courses (have tutor product flag)
    const products = await wooCommerceService.getProducts({
      status: 'publish',
      per_page: 100
    });

    // Filter products that are courses (have tutor product flag)
    const courseProducts = products.filter((product: any) => {
      return product.meta_data?.some((meta: any) => 
        meta.key === '_tutor_course_id' || 
        (meta.key === '_tutor_product' && meta.value === 'yes')
      );
    });

    // Transform the data to include course information
    const transformedProducts = courseProducts.map((product: any) => {
      const tutorCourseId = product.meta_data?.find((meta: any) => 
        meta.key === '_tutor_course_id'
      )?.value || product.id;

      const courseDuration = product.meta_data?.find((meta: any) => 
        meta.key === '_course_duration'
      )?.value || '3 jours';

      const courseLevel = product.meta_data?.find((meta: any) => 
        meta.key === '_course_level'
      )?.value || 'Intermédiaire';

      return {
        id: product.id,
        name: product.name,
        price: product.regular_price,
        description: product.description || '',
        short_description: product.short_description || '',
        images: product.images,
        tutor_course_id: tutorCourseId,
        course_duration: courseDuration,
        course_level: courseLevel,
        course_slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        virtual: product.virtual,
        downloadable: product.downloadable
      };
    });

    return transformedProducts;
  },
  ['course-products'],
  {
    tags: ['courses', 'woocommerce-products'],
    revalidate: 3600 // Revalidate every hour
  }
);

export async function GET(request: NextRequest) {
  try {
    const transformedProducts = await getCachedCourseProducts();

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      message: 'Course products with content retrieved successfully'
    });

  } catch (error) {
    console.error('WooCommerce courses with content API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch course products with content',
        message: 'Erreur lors de la récupération des produits de formation avec contenu'
      },
      { status: 500 }
    );
  }
}
