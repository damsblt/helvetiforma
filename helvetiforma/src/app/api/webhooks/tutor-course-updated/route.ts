import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_id, action } = body;

    // WEBHOOK ENABLED - Course update to product sync is active
    console.log('TutorLMS course update webhook received:', { course_id, action });

    if (!course_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course ID is required',
          message: 'ID du cours requis'
        },
        { status: 400 }
      );
    }

    // Fetch course via public WordPress REST (no extra auth required)
    const wpCourseResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/courses/${course_id}`);
    if (!wpCourseResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found in WordPress',
          message: 'Cours non trouvé dans WordPress'
        },
        { status: 404 }
      );
    }
    const tutorCourse = await wpCourseResponse.json();

    if (!tutorCourse) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found in Tutor LMS',
          message: 'Cours non trouvé dans Tutor LMS'
        },
        { status: 404 }
      );
    }

    // Get course meta data
    const metaResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${course_id}`);
    const courseMeta = metaResponse.ok ? await metaResponse.json() : {};

    // Optional: Try Tutor endpoint for extra details, but don't fail if unauthorized
    let courseDetails = {} as any;
    try {
      const detailsResponse = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/courses/${course_id}`);
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        courseDetails = detailsData.data || {};
      }
    } catch {}

    // Small delay to ensure WP saved meta
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if WooCommerce product already exists for this course (paginate up to 10 pages)
    let existingProduct = null as any;
    {
      let page = 1;
      const perPage = 100;
      while (!existingProduct && page <= 10) {
        const productsPage = await wooCommerceService.getProducts({ per_page: perPage, page });
        if (!productsPage || productsPage.length === 0) break;
        existingProduct = productsPage.find((product: any) => 
          product.meta_data?.some((meta: any) => 
            meta.key === '_tutor_course_id' && meta.value === course_id.toString()
          )
        );
        page++;
      }
    }

    // If no product exists yet, create it on update as well
    let isCreating = false;
    if (!existingProduct) {
      isCreating = true;
    }

    // Extract course details from meta and course details
    const courseDuration = courseMeta.meta?._course_duration || 
      (courseDetails as any).course_duration?.[0] ? 
        `${(courseDetails as any).course_duration[0].hours}h ${(courseDetails as any).course_duration[0].minutes}min` : 
        '3 jours';
    const courseLevel = courseMeta.meta?._course_level || 
      (courseDetails as any).course_level?.[0] || 
      'Intermédiaire';
    // Allow overriding price from webhook body (sent by mu-plugin)
    let coursePrice = courseMeta.meta?._course_price || '0';
    if ((body as any)?.course_price !== undefined && (body as any)?.course_price !== null && (body as any)?.course_price !== '') {
      coursePrice = String((body as any).course_price);
    }
    const coursePriceTypeOverride = (body as any)?.course_price_type ? String((body as any).course_price_type) : '';
    const introVideo = courseMeta.meta?._intro_video || '';
    
    // Extract additional course attributes
    const courseInstructor = courseMeta.meta?._course_instructor || 
      (courseDetails as any).course_instructor || 
      'Formateur certifié';
    const courseLanguage = courseMeta.meta?._course_language || 
      (courseDetails as any).course_language || 
      'Français';
    const courseCertificate = courseMeta.meta?._course_certificate || 
      (courseDetails as any).course_certificate || 
      'Oui';
    const courseBenefits = courseMeta.meta?._course_benefits || 
      (courseDetails as any).course_benefits || 
      [];
    const courseRequirements = courseMeta.meta?._course_requirements || 
      (courseDetails as any).course_requirements || 
      [];
    const courseTargetAudience = courseMeta.meta?._course_target_audience || 
      (courseDetails as any).course_target_audience || 
      [];
    const courseMaterialIncludes = courseMeta.meta?._course_material_includes || 
      (courseDetails as any).course_material_includes || 
      [];
    const courseRating = tutorCourse.ratings?.rating_avg || 0;
    const courseRatingCount = tutorCourse.ratings?.rating_count || 0;
    const courseCategories = tutorCourse.course_category?.map((cat: any) => cat.name) || [];
    const courseTags = tutorCourse.course_tag?.map((tag: any) => tag.name) || [];
    const coursePriceType = (courseDetails as any).course_price_type?.[0] || 
      courseMeta.meta?._course_price_type || 
      'paid';

    // Create WooCommerce product data for update
    const productData: any = {
      name: tutorCourse.title?.rendered || tutorCourse.title || '',
      description: tutorCourse.content?.rendered || '',
      short_description: tutorCourse.excerpt?.rendered || (tutorCourse.content?.rendered || '').replace(/<[^>]*>/g, '').slice(0, 160),
      status: tutorCourse.status === 'publish' ? 'publish' : 'draft',
      type: 'simple',
      virtual: true,
      downloadable: false,
      manage_stock: false,
      catalog_visibility: 'visible',
      meta_data: [
        {
          key: '_tutor_course_id',
          value: course_id.toString()
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
        },
        {
          key: '_course_instructor',
          value: courseInstructor
        },
        {
          key: '_course_language',
          value: courseLanguage
        },
        {
          key: '_course_certificate',
          value: courseCertificate
        },
        {
          key: '_course_rating',
          value: courseRating.toString()
        },
        {
          key: '_course_rating_count',
          value: courseRatingCount.toString()
        },
        {
          key: '_course_price_type',
          value: coursePriceType
        }
      ]
    };

    // Add array-based attributes as separate meta entries
    if (Array.isArray(courseBenefits) && courseBenefits.length > 0) {
      productData.meta_data.push({
        key: '_course_benefits',
        value: JSON.stringify(courseBenefits)
      });
    }

    if (Array.isArray(courseRequirements) && courseRequirements.length > 0) {
      productData.meta_data.push({
        key: '_course_requirements',
        value: JSON.stringify(courseRequirements)
      });
    }

    if (Array.isArray(courseTargetAudience) && courseTargetAudience.length > 0) {
      productData.meta_data.push({
        key: '_course_target_audience',
        value: JSON.stringify(courseTargetAudience)
      });
    }

    if (Array.isArray(courseMaterialIncludes) && courseMaterialIncludes.length > 0) {
      productData.meta_data.push({
        key: '_course_material_includes',
        value: JSON.stringify(courseMaterialIncludes)
      });
    }

    if (Array.isArray(courseCategories) && courseCategories.length > 0) {
      productData.meta_data.push({
        key: '_course_categories',
        value: JSON.stringify(courseCategories)
      });
    }

    if (Array.isArray(courseTags) && courseTags.length > 0) {
      productData.meta_data.push({
        key: '_course_tags',
        value: JSON.stringify(courseTags)
      });
    }

    // Decide price from override or meta
    const effectivePriceType = coursePriceTypeOverride || (courseMeta.meta?._course_price_type || '');
    let sanitizedPrice = '';
    if (typeof coursePrice === 'string') {
      sanitizedPrice = coursePrice.replace(/[^0-9.,]/g, '').replace(',', '.');
    }
    if (effectivePriceType && effectivePriceType.toLowerCase().includes('free')) {
      productData.regular_price = '0.00';
      productData.sale_price = '';
      productData.meta_data = [...(productData.meta_data || []), { key: '_regular_price', value: '0.00' }, { key: '_price', value: '0.00' }];
    } else if (sanitizedPrice) {
      const numeric = parseFloat(sanitizedPrice);
      if (Number.isFinite(numeric) && numeric >= 0) {
        const fixed = numeric.toFixed(2);
        productData.regular_price = fixed;
        productData.sale_price = '';
        productData.meta_data = [...(productData.meta_data || []), { key: '_regular_price', value: fixed }, { key: '_price', value: fixed }];
      }
    }

    // Add featured image if available
    // Featured image: try WP REST featured media
    if (tutorCourse.featured_media) {
      try {
        const mediaResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/media/${tutorCourse.featured_media}`);
        if (mediaResponse.ok) {
          const media = await mediaResponse.json();
          const imageUrl = media.source_url;
          if (imageUrl) {
            productData.images = [
              { src: imageUrl, alt: tutorCourse.title?.rendered || '' }
            ];
          }
        }
      } catch {}
    }

    // Create or update product
    const wooCommerceProduct = isCreating
      ? await wooCommerceService.createProduct(productData)
      : await wooCommerceService.updateProduct(existingProduct.id, productData);

    // Trigger frontend revalidation
    try {
      // Revalidate by paths
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?path=/courses&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?path=/courses/${course_id}&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?path=/formations&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?path=/elearning&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      // Revalidate by tags
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?tag=courses&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?tag=woocommerce-products&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      console.log('Frontend revalidation triggered for course:', course_id);
    } catch (revalidationError) {
      console.error('Error triggering frontend revalidation:', revalidationError);
      // Don't fail the webhook if revalidation fails
    }

    return NextResponse.json({
      success: true,
      data: {
        tutor_course_id: course_id,
        woo_commerce_product_id: wooCommerceProduct.id,
        product_name: wooCommerceProduct.name,
        action_taken: 'updated',
        message: 'Product updated successfully',
        frontend_revalidated: true
      },
      message: 'Produit WooCommerce mis à jour avec succès'
    });

  } catch (error) {
    console.error('Tutor course update webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process course update webhook',
        message: 'Erreur lors du traitement du webhook de mise à jour de cours'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test the webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('course_id');

  if (!courseId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Course ID is required',
        message: 'ID du cours requis'
      },
      { status: 400 }
    );
  }

  // Simulate webhook call
  const mockBody = {
    course_id: parseInt(courseId),
    action: 'course_updated'
  };

  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockBody)
  });

  return POST(mockRequest as NextRequest);
}
