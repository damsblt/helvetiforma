import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id, payment_method = 'manual' } = await request.json();

    if (!user_id || !course_id) {
      return NextResponse.json(
        { success: false, message: 'user_id et course_id sont requis' },
        { status: 400 }
      );
    }

    // Get course details using our tutorService mapping (includes test pricing)
    const courseResponse = await fetch(`${request.nextUrl.origin}/api/tutor/courses`);
    
    if (!courseResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des cours' },
        { status: 500 }
      );
    }

    const coursesData = await courseResponse.json();
    const course = coursesData.data?.find((c: any) => c.id === parseInt(course_id));
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Cours non trouvé' },
        { status: 404 }
      );
    }
    
    const coursePrice = course.price || 0;
    const isFree = course.is_free;

    // If course is free, just enroll directly
    if (isFree || coursePrice === 0) {
      // Call enrollment API
      const enrollResponse = await fetch(`${request.nextUrl.origin}/api/tutor/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, course_id })
      });

      if (enrollResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Inscription gratuite réussie',
          order_type: 'free_enrollment',
          course_id: parseInt(course_id),
          user_id: parseInt(user_id)
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Échec de l\'inscription gratuite' },
          { status: 500 }
        );
      }
    }

    // For paid courses, try to create order via Tutor LMS API
    try {
      const orderData = {
        user_id: parseInt(user_id),
        course_id: parseInt(course_id),
        order_status: 'pending',
        payment_method: payment_method,
        order_total: parseFloat(coursePrice),
        currency: 'CHF', // Swiss Francs
        order_items: [
          {
            item_id: parseInt(course_id),
            item_name: course.title?.rendered || course.title,
            item_type: 'course',
            quantity: 1,
            price: parseFloat(coursePrice)
          }
        ]
      };

      const createOrderResponse = await fetch(buildUrl('/wp-json/tutor/v1/orders'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (createOrderResponse.ok) {
        const order = await createOrderResponse.json();
        
        return NextResponse.json({
          success: true,
          message: 'Commande créée avec succès',
          order: order,
          payment_required: true,
          amount: coursePrice,
          currency: 'CHF',
          next_step: 'payment'
        });
      } else {
        // Fallback: Create simple order record locally
        const localOrder = {
          id: Date.now(),
          user_id: parseInt(user_id),
          course_id: parseInt(course_id),
          status: 'pending',
          total: parseFloat(coursePrice.toString()),
          currency: 'CHF',
          payment_method: payment_method,
          created_at: new Date().toISOString(),
          items: [
            {
              course_id: parseInt(course_id),
              course_title: course.title,
              price: parseFloat(coursePrice.toString())
            }
          ]
        };

        // In a real implementation, you would save this to a database
        // For now, we'll return it for the frontend to handle
        
        return NextResponse.json({
          success: true,
          message: 'Commande créée (mode local)',
          order: localOrder,
          payment_required: true,
          amount: coursePrice,
          currency: 'CHF',
          next_step: 'payment',
          payment_methods: ['stripe', 'paypal', 'bank_transfer']
        });
      }

    } catch (error) {
      console.error('Order creation error:', error);
      
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la création de la commande',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
