import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { course_id, user_id } = await request.json();

    if (!course_id || !user_id) {
      return NextResponse.json(
        { success: false, message: 'course_id et user_id sont requis' },
        { status: 400 }
      );
    }

    // Get course details to check if it's free
    const courseResponse = await fetch(buildUrl(`${config.endpoints.wpTutor.courses}/${course_id}`), {
      headers: getAuthHeaders(),
    });

    if (!courseResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'Cours non trouvé' },
        { status: 404 }
      );
    }

    const course = await courseResponse.json();
    const coursePrice = course.course_price || 0;

    // If course is free, directly enroll the user
    if (coursePrice === 0) {
      const enrollResponse = await fetch('/api/tutor/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          course_id
        }),
      });

      if (enrollResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Inscription gratuite réussie',
          enrolled: true
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Échec de l\'inscription gratuite' },
          { status: 500 }
        );
      }
    }

    // For paid courses, create order using Tutor LMS native eCommerce
    try {
      const orderResponse = await fetch(buildUrl(config.endpoints.tutor.orders), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id,
          course_id,
          total: coursePrice,
          status: 'pending',
          payment_method: 'tutor_native'
        }),
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        
        return NextResponse.json({
          success: true,
          order_id: orderData.id,
          redirect_url: `/panier?order_id=${orderData.id}`,
          message: 'Commande créée avec succès'
        });
      }
    } catch (error) {
      console.warn('Native Tutor order creation failed, using fallback');
    }

    // Fallback: redirect to Tutor LMS checkout page
    const checkoutUrl = `${config.wordpressUrl}/validation-de-la-commande?course_id=${course_id}`;
    
    return NextResponse.json({
      success: true,
      redirect_url: checkoutUrl,
      message: 'Redirection vers le checkout'
    });

  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'achat' },
      { status: 500 }
    );
  }
}
