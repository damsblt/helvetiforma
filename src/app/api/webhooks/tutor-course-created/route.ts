import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    const { course_id, action } = body;

    // WEBHOOK ENABLED - Course to product sync is active
    console.log(`[${webhookId}] TutorLMS course webhook received:`, { course_id, action, timestamp: new Date().toISOString() });

    if (!course_id) {
      console.error(`[${webhookId}] Missing course_id in webhook payload`);
      return NextResponse.json(
        {
          success: false,
          error: 'Course ID is required',
          message: 'ID du cours requis'
        },
        { status: 400 }
      );
    }

    // Add delay to ensure course is fully processed
    console.log(`[${webhookId}] Adding delay to ensure course is fully processed...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

    // Use the same authentication method as working API endpoints
    const tutorAuth = process.env.TUTOR_CLIENT_ID && process.env.TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${process.env.TUTOR_CLIENT_ID}:${process.env.TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;

    // Get course details from WordPress API with retry logic
    console.log(`[${webhookId}] Fetching course details with retry logic...`);
    let tutorCourse = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !tutorCourse) {
      try {
        console.log(`[${webhookId}] Attempt ${retryCount + 1}/${maxRetries} to fetch course ${course_id}...`);
        const tutorResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/courses/${course_id}`);
        
        if (tutorResponse.ok) {
          const courseData = await tutorResponse.json();
          if (courseData && courseData.id === parseInt(course_id)) {
            tutorCourse = courseData;
            console.log(`[${webhookId}] Course fetched successfully:`, { id: courseData.id, title: courseData.title?.rendered });
          } else {
            console.warn(`[${webhookId}] Course data invalid, retrying...`);
          }
        } else {
          console.warn(`[${webhookId}] Course fetch failed with status ${tutorResponse.status}, retrying...`);
        }
      } catch (error) {
        console.warn(`[${webhookId}] Course fetch error on attempt ${retryCount + 1}:`, error instanceof Error ? error.message : 'Unknown error');
      }
      
      if (!tutorCourse && retryCount < maxRetries - 1) {
        retryCount++;
        const delay = retryCount * 1000; // Increasing delay: 1s, 2s, 3s
        console.log(`[${webhookId}] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        retryCount++;
      }
    }
    
    if (!tutorCourse) {
      console.error(`[${webhookId}] Failed to fetch course ${course_id} after ${maxRetries} attempts`);
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found in WordPress after retries',
          message: 'Cours non trouvé dans WordPress après plusieurs tentatives'
        },
        { status: 404 }
      );
    }

    // Get course meta data
    const metaResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${course_id}`);
    const courseMeta = metaResponse.ok ? await metaResponse.json() : {};

    // Get detailed course information from TutorLMS API
    const detailsResponse = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/courses/${course_id}`, {
      headers: {
        'Authorization': tutorAuth,
        'Content-Type': 'application/json'
      }
    });
    
    let courseDetails = {};
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      courseDetails = detailsData.data || {};
    }

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
    try {
      if ((body as any)?.course_price !== undefined && (body as any)?.course_price !== null && (body as any)?.course_price !== '') {
        coursePrice = String((body as any).course_price);
      }
    } catch {}
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

    // Create WooCommerce product data
    const productData: any = {
      name: tutorCourse.title?.rendered || tutorCourse.name,
      description: tutorCourse.content?.rendered || tutorCourse.description,
      short_description: tutorCourse.excerpt?.rendered || tutorCourse.short_description || '',
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

    // Set price if not free
    let sanitizedPrice = '';
    if (typeof coursePrice === 'string') {
      sanitizedPrice = coursePrice.replace(/[^0-9.,]/g, '').replace(',', '.');
    }
    if (sanitizedPrice) {
      const numeric = parseFloat(sanitizedPrice);
      if (Number.isFinite(numeric) && numeric >= 0) {
        const fixed = numeric.toFixed(2);
        productData.regular_price = fixed;
        // Ensure WooCommerce meta also reflects price
        productData.meta_data.push({ key: '_regular_price', value: fixed });
        productData.meta_data.push({ key: '_price', value: fixed });
      }
    }

    // Add featured image from WP featured media if available
    if ((tutorCourse as any).featured_media) {
      try {
        const mediaResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/media/${(tutorCourse as any).featured_media}`);
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

    let wooCommerceProduct;
    let action_taken;
    let productCreationSuccess = false;
    let productRetryCount = 0;
    const maxProductRetries = 3;

    console.log(`[${webhookId}] Creating/updating WooCommerce product...`);

    while (productRetryCount < maxProductRetries && !productCreationSuccess) {
      try {
        console.log(`[${webhookId}] Product attempt ${productRetryCount + 1}/${maxProductRetries}...`);
        
        if (existingProduct) {
          // Update existing product
          wooCommerceProduct = await wooCommerceService.updateProduct(existingProduct.id, productData);
          action_taken = 'updated';
        } else {
          // Create new product
          wooCommerceProduct = await wooCommerceService.createProduct(productData);
          action_taken = 'created';
        }
        
        if (wooCommerceProduct && wooCommerceProduct.id) {
          productCreationSuccess = true;
          console.log(`[${webhookId}] Product ${action_taken} successfully:`, { 
            id: wooCommerceProduct.id, 
            name: wooCommerceProduct.name 
          });
        } else {
          throw new Error('Product creation returned invalid data');
        }
        
      } catch (error) {
        console.warn(`[${webhookId}] Product ${action_taken} failed on attempt ${productRetryCount + 1}:`, error instanceof Error ? error.message : 'Unknown error');
        productRetryCount++;
        
        if (productRetryCount < maxProductRetries) {
          const delay = productRetryCount * 2000; // 2s, 4s delays
          console.log(`[${webhookId}] Waiting ${delay}ms before product retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!productCreationSuccess) {
      console.error(`[${webhookId}] Failed to create/update product after ${maxProductRetries} attempts`);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create/update WooCommerce product after retries',
          message: 'Échec de la création/mise à jour du produit WooCommerce après plusieurs tentatives'
        },
        { status: 500 }
      );
    }

    // Validate that the course-product link was created successfully
    console.log(`[${webhookId}] Validating course-product link...`);
    let linkValidationSuccess = false;
    let validationRetryCount = 0;
    const maxValidationRetries = 3;

    while (validationRetryCount < maxValidationRetries && !linkValidationSuccess) {
      try {
        console.log(`[${webhookId}] Link validation attempt ${validationRetryCount + 1}/${maxValidationRetries}...`);
        
        // Wait a bit for the product to be fully saved
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the created/updated product to verify the link
        const verifyResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products/${wooCommerceProduct.id}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (verifyResponse.ok) {
          const verifyProduct = await verifyResponse.json();
          const courseIdMeta = verifyProduct.meta_data?.find((meta: any) => meta.key === '_tutor_course_id');
          
          if (courseIdMeta && courseIdMeta.value === course_id.toString()) {
            linkValidationSuccess = true;
            console.log(`[${webhookId}] ✅ Course-product link validated successfully!`);
          } else {
            console.warn(`[${webhookId}] Course link not found, retrying...`);
            console.log(`[${webhookId}] Expected course_id: ${course_id}, Found: ${courseIdMeta?.value || 'MISSING'}`);
          }
        } else {
          console.warn(`[${webhookId}] Product verification failed with status ${verifyResponse.status}`);
        }
        
      } catch (error) {
        console.warn(`[${webhookId}] Link validation error on attempt ${validationRetryCount + 1}:`, error instanceof Error ? error.message : 'Unknown error');
      }
      
      if (!linkValidationSuccess && validationRetryCount < maxValidationRetries - 1) {
        validationRetryCount++;
        const delay = validationRetryCount * 1500; // 1.5s, 3s delays
        console.log(`[${webhookId}] Waiting ${delay}ms before validation retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        validationRetryCount++;
      }
    }

    if (!linkValidationSuccess) {
      console.error(`[${webhookId}] ⚠️  WARNING: Course-product link validation failed after ${maxValidationRetries} attempts`);
      console.error(`[${webhookId}] Product ${wooCommerceProduct.id} may not be properly linked to course ${course_id}`);
    }

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

    const executionTime = Date.now() - startTime;
    console.log(`[${webhookId}] Webhook completed successfully in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        webhook_id: webhookId,
        tutor_course_id: course_id,
        woo_commerce_product_id: wooCommerceProduct.id,
        product_name: wooCommerceProduct.name,
        action_taken,
        link_validated: linkValidationSuccess,
        execution_time_ms: executionTime,
        message: `Product ${action_taken} successfully`,
        frontend_revalidated: true
      },
      message: `Produit WooCommerce ${action_taken === 'created' ? 'créé' : 'mis à jour'} avec succès`
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[${webhookId}] Tutor course webhook error after ${executionTime}ms:`, error);
    return NextResponse.json(
      {
        success: false,
        webhook_id: webhookId,
        error: error instanceof Error ? error.message : 'Failed to process course webhook',
        execution_time_ms: executionTime,
        message: 'Erreur lors du traitement du webhook de cours'
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
    action: 'course_created'
  };

  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockBody)
  });

  return POST(mockRequest as NextRequest);
}
