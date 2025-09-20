import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    // Try direct API call first to debug the issue
    const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
    const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';
    
    const baseUrl = `${WORDPRESS_URL}/wp-json/wc/v3`;
    const auth = Buffer.from(
      `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
    
    console.log('Direct API call - Environment check:', {
      WORDPRESS_URL,
      hasConsumerKey: !!WOOCOMMERCE_CONSUMER_KEY,
      hasConsumerSecret: !!WOOCOMMERCE_CONSUMER_SECRET,
      baseUrl,
      authLength: auth.length
    });
    
    const url = `${baseUrl}/products?status=publish&per_page=50`;
    console.log('Direct API call - Fetching URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });
    
    console.log('Direct API call - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Direct API call - Error response:', errorText);
      throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
    }
    
    const products = await response.json();
    console.log('Direct API call - Successfully fetched products:', products.length);

    console.log('All WooCommerce products:', products.length);
    console.log('Sample product meta_data:', products[0]?.meta_data);

    // Filter products that are courses (have tutor product flag or tutor course ID)
    const courseProducts = products.filter((product: any) => {
      return product.meta_data?.some((meta: any) => 
        meta.key === '_tutor_course_id' || 
        (meta.key === '_tutor_product' && meta.value === 'yes')
      );
    });

    console.log('Course products found:', courseProducts.length);

    // Transform the data to include course information
    const transformedProducts = courseProducts.map((product: any) => {
      const tutorCourseId = product.meta_data?.find((meta: any) => 
        meta.key === '_tutor_course_id'
      )?.value || product.id; // Use product ID as fallback

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
        description: product.description,
        short_description: product.short_description,
        images: product.images,
        tutor_course_id: tutorCourseId,
        course_duration: courseDuration,
        course_level: courseLevel,
        course_slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        virtual: product.virtual,
        downloadable: product.downloadable
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      message: 'Course products retrieved successfully'
    });

  } catch (error) {
    console.error('WooCommerce course products API error:', error);
    
    // If WooCommerce API is not accessible, return mock data for development
    if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('fetch failed'))) {
      console.log('WooCommerce API not accessible, returning mock data');
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 1,
            name: 'Gestion des salaires - 30000',
            price: '30000',
            description: 'Description du cours de gestion des salaires',
            short_description: 'Cours complet sur la gestion des salaires',
            images: [],
            tutor_course_id: '1',
            course_duration: '3 jours',
            course_level: 'Intermédiaire',
            course_slug: 'gestion-des-salaires-30000',
            virtual: true,
            downloadable: false
          },
          {
            id: 2,
            name: 'Charges sociales - 25000',
            price: '25000',
            description: 'Description du cours de charges sociales',
            short_description: 'Cours sur les charges sociales et cotisations',
            images: [],
            tutor_course_id: '2',
            course_duration: '2 jours',
            course_level: 'Avancé',
            course_slug: 'charges-sociales-25000',
            virtual: true,
            downloadable: false
          }
        ],
        message: 'Mock course products (WooCommerce API not accessible)'
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch course products',
        message: 'Erreur lors de la récupération des produits de formation'
      },
      { status: 500 }
    );
  }
}
