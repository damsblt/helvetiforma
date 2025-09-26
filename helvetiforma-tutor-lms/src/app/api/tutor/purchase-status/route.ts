import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const courseId = searchParams.get('course_id');
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, message: 'user_id et course_id sont requis' },
        { status: 400 }
      );
    }

    // Check multiple sources for purchase status
    const checks = [];

    // 1. Check Tutor LMS orders API
    try {
      const ordersResponse = await fetch(buildUrl(`/wp-json/tutor/v1/orders?user_id=${userId}&course_id=${courseId}`), {
        headers: getAuthHeaders(),
      });

      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        const completedOrder = Array.isArray(orders) ? 
          orders.find((order: any) => order.status === 'completed' || order.status === 'processing') : null;
        
        checks.push({
          method: 'tutor_orders',
          success: true,
          purchased: !!completedOrder,
          order: completedOrder
        });
      } else {
        checks.push({
          method: 'tutor_orders',
          success: false,
          error: `${ordersResponse.status} ${ordersResponse.statusText}`
        });
      }
    } catch (error) {
      checks.push({
        method: 'tutor_orders',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. Check user meta for course purchase
    try {
      const userResponse = await fetch(buildUrl(`/wp-json/wp/v2/users/${userId}?context=edit`), {
        headers: getAuthHeaders(),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const purchaseKey = `_tutor_course_purchased_${courseId}`;
        const hasPurchased = userData.meta?.[purchaseKey] === 'yes' || userData.meta?.[purchaseKey] === '1';
        
        checks.push({
          method: 'user_meta',
          success: true,
          purchased: hasPurchased,
          meta_key: purchaseKey,
          meta_value: userData.meta?.[purchaseKey]
        });
      } else {
        checks.push({
          method: 'user_meta',
          success: false,
          error: `${userResponse.status} ${userResponse.statusText}`
        });
      }
    } catch (error) {
      checks.push({
        method: 'user_meta',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 3. Check local enrollment data (fallback for free courses)
    try {
      const enrollmentResponse = await fetch(`${request.nextUrl.origin}/api/tutor/enrollments?user_id=${userId}`);
      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        const hasEnrollment = enrollmentData.data?.find((e: any) => e.course_id === parseInt(courseId));
        
        checks.push({
          method: 'local_enrollment',
          success: true,
          enrolled: !!hasEnrollment,
          enrollment: hasEnrollment
        });
      }
    } catch (error) {
      checks.push({
        method: 'local_enrollment',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Determine overall purchase status
    const hasPurchased = checks.some(check => check.purchased === true);
    const hasEnrollment = checks.some(check => check.enrolled === true);
    
    // For free courses, enrollment is sufficient
    // For paid courses, need actual purchase
    const hasAccess = hasPurchased || hasEnrollment;

    return NextResponse.json({
      success: true,
      user_id: parseInt(userId),
      course_id: parseInt(courseId),
      has_purchased: hasPurchased,
      has_enrollment: hasEnrollment,
      has_access: hasAccess,
      checks: checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Purchase status API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la vérification du statut d\'achat',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
