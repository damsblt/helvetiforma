import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function GET(request: NextRequest) {
  try {
    console.log('WooCommerce course products API - Starting request');
    
    // Use the enhanced WooCommerce service with retry logic and better error handling
    const products = await wooCommerceService.getProducts({
      status: 'publish',
      per_page: 50
    });
    
    console.log('WooCommerce course products API - Successfully fetched products:', products.length);

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
    
    // Enhanced error handling with specific error types
    if (error instanceof Error) {
      // Network/connectivity issues
      if (error.message.includes('ENOTFOUND') || error.message.includes('fetch failed') || error.message.includes('network error')) {
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
      
      // Authentication errors
      if (error.message.includes('Authentication failed') || error.message.includes('401')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'WooCommerce API authentication failed',
            message: 'Erreur d\'authentification - vérifiez les clés API'
          },
          { status: 401 }
        );
      }
      
      // Configuration errors
      if (error.message.includes('Missing required environment variables') || error.message.includes('configuration error')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'WooCommerce API configuration error',
            message: 'Erreur de configuration - variables d\'environnement manquantes'
          },
          { status: 500 }
        );
      }
      
      // Timeout errors
      if (error.message.includes('timeout') || error.message.includes('took too long')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'WooCommerce API timeout',
            message: 'Délai d\'attente dépassé - réessayez plus tard'
          },
          { status: 408 }
        );
      }
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
