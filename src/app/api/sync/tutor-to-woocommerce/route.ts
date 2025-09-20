import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

interface TutorCourse {
  ID: number;
  post_title: string;
  post_content: string;
  post_excerpt: string;
  post_status: string;
  post_date: string;
  post_modified: string;
  post_author: number;
  guid: string;
  featured_image?: string;
  course_price?: string;
  course_duration?: string;
  course_level?: string;
  intro_video?: string;
  meta?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    // SYNC DISABLED - No longer creating products from courses
    return NextResponse.json({
      success: true,
      message: 'Sync disabled - Course to product sync is no longer active'
    });

    // Get course details from Tutor LMS
    const tutorResponse = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/courses/${courseId}`);
    
    if (!tutorResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found in Tutor LMS',
          message: 'Cours non trouvé dans Tutor LMS'
        },
        { status: 404 }
      );
    }

    const tutorCourse: TutorCourse = await tutorResponse.json();

    // Get course meta data
    const metaResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${courseId}`);
    const courseMeta = metaResponse.ok ? await metaResponse.json() : {};

    // Extract course details from meta
    const courseDuration = courseMeta.meta?._course_duration || '3 jours';
    const courseLevel = courseMeta.meta?._course_level || 'Intermédiaire';
    const coursePrice = courseMeta.meta?._course_price || '0';
    const introVideo = courseMeta.meta?._intro_video || '';

    // Create WooCommerce product data
    const productData: any = {
      name: tutorCourse.post_title,
      description: tutorCourse.post_content,
      short_description: tutorCourse.post_excerpt,
      status: tutorCourse.post_status === 'publish' ? 'publish' : 'draft',
      virtual: true,
      downloadable: false,
      meta_data: [
        {
          key: '_tutor_course_id',
          value: courseId.toString()
        },
        {
          key: '_tutor_product',
          value: 'yes'
        },
        {
          key: '_course_duration',
          value: courseDuration
        },
        {
          key: '_course_level',
          value: courseLevel
        },
        {
          key: '_course_price',
          value: coursePrice
        },
        {
          key: '_intro_video',
          value: introVideo
        }
      ]
    };

    // Set price if not free
    if (coursePrice && coursePrice !== '0') {
      productData.regular_price = coursePrice;
    }

    // Add featured image if available
    if (tutorCourse.featured_image) {
      productData.images = [
        {
          src: tutorCourse.featured_image,
          alt: tutorCourse.post_title
        }
      ];
    }

    // Create WooCommerce product
    const wooCommerceProduct = await wooCommerceService.createProduct(productData);

    return NextResponse.json({
      success: true,
      data: {
        tutor_course_id: courseId,
        woo_commerce_product_id: wooCommerceProduct.id,
        product_name: wooCommerceProduct.name,
        message: 'Product created successfully'
      },
      message: 'Produit WooCommerce créé avec succès'
    });

  } catch (error) {
    console.error('Tutor to WooCommerce sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync course to WooCommerce',
        message: 'Erreur lors de la synchronisation du cours vers WooCommerce'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to sync all courses
export async function GET(request: NextRequest) {
  try {
    // SYNC DISABLED - No longer creating products from courses
    return NextResponse.json({
      success: true,
      message: 'Sync disabled - Course to product sync is no longer active'
    });
    
    // Unreachable code below - keeping for reference
    /*
    if (!tutorResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch Tutor LMS courses',
          message: 'Impossible de récupérer les cours Tutor LMS'
        },
        { status: 500 }
      );
    }

    const tutorCourses: TutorCourse[] = await tutorResponse.json();
    const results = [];

    for (const course of tutorCourses) {
      try {
        // Check if WooCommerce product already exists for this course
        const existingProducts = await wooCommerceService.getProducts({
          meta_key: '_tutor_course_id',
          meta_value: course.ID.toString()
        });

        if (existingProducts.length > 0) {
          results.push({
            tutor_course_id: course.ID,
            woo_commerce_product_id: existingProducts[0].id,
            status: 'already_exists',
            message: 'Product already exists'
          });
          continue;
        }

        // Get course meta data
        const metaResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${course.ID}`);
        const courseMeta = metaResponse.ok ? await metaResponse.json() : {};

        // Extract course details from meta
        const courseDuration = courseMeta.meta?._course_duration || '3 jours';
        const courseLevel = courseMeta.meta?._course_level || 'Intermédiaire';
        const coursePrice = courseMeta.meta?._course_price || '0';
        const introVideo = courseMeta.meta?._intro_video || '';

        // Create WooCommerce product data
        const productData = {
          name: course.post_title,
          description: course.post_content,
          short_description: course.post_excerpt,
          status: course.post_status === 'publish' ? 'publish' : 'draft',
          virtual: true,
          downloadable: false,
          meta_data: [
            {
              key: '_tutor_course_id',
              value: course.ID.toString()
            },
            {
              key: '_tutor_product',
              value: 'yes'
            },
            {
              key: '_course_duration',
              value: courseDuration
            },
            {
              key: '_course_level',
              value: courseLevel
            },
            {
              key: '_course_price',
              value: coursePrice
            },
            {
              key: '_intro_video',
              value: introVideo
            }
          ]
        };

        // Set price if not free
        if (coursePrice && coursePrice !== '0') {
          productData.regular_price = coursePrice;
        }

        // Add featured image if available
        if (course.featured_image) {
          productData.images = [
            {
              src: course.featured_image,
              alt: course.post_title
            }
          ];
        }

        const wooCommerceProduct = await wooCommerceService.createProduct(productData);

        results.push({
          tutor_course_id: course.ID,
          woo_commerce_product_id: wooCommerceProduct.id,
          status: 'created',
          message: 'Product created successfully'
        });

      } catch (error) {
        console.error(`Error syncing course ${course.ID}:`, error);
        results.push({
          tutor_course_id: course.ID,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Synchronisation terminée'
    });

  } catch (error) {
    console.error('Bulk sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync courses',
        message: 'Erreur lors de la synchronisation des cours'
      },
      { status: 500 }
    );
  }
    */
  } catch (error) {
    console.error('Sync courses error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync courses',
        message: 'Erreur lors de la synchronisation des cours'
      },
      { status: 500 }
    );
  }
}
