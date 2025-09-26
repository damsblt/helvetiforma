import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';
import { tutorLmsService } from '@/services/tutorLmsService';
import { authService } from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const order = await request.json();
    
    console.log('WooCommerce order completed webhook received:', {
      orderId: order.id,
      status: order.status,
      customerEmail: order.billing?.email,
      lineItems: order.line_items?.length
    });

    // Verify webhook signature (in production, verify WooCommerce webhook signature)
    // const signature = request.headers.get('x-wc-webhook-signature');
    // if (!verifyWebhookSignature(signature, order)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Only process completed orders
    if (order.status !== 'completed' && order.status !== 'processing') {
      console.log('Order not completed, skipping enrollment:', order.status);
      return NextResponse.json({ message: 'Order not completed' });
    }

    // Check if order contains course products
    const courseItems = [];
    for (const item of order.line_items || []) {
      try {
        const product = await wooCommerceService.getProduct(item.product_id);
        const courseId = product.meta_data?.find((meta: any) => 
          meta.key === '_tutor_course_id'
        )?.value;

        if (courseId) {
          courseItems.push({
            productId: item.product_id,
            courseId: parseInt(courseId),
            quantity: item.quantity,
            productName: product.name
          });
        }
      } catch (error) {
        console.error('Error fetching product:', item.product_id, error);
      }
    }

    if (courseItems.length === 0) {
      console.log('No course products found in order');
      return NextResponse.json({ message: 'No course products found' });
    }

    console.log('Course items found:', courseItems);

    // Create or find WordPress user
    let wpUser;
    try {
      // First, try to find existing user by email
      const existingUsers = await wooCommerceService.getCustomers({
        email: order.billing.email
      });

      if (existingUsers.length > 0) {
        wpUser = existingUsers[0];
        console.log('Found existing WordPress user:', wpUser.id);
      } else {
        // Create new WordPress user
        const userData = {
          email: order.billing.email,
          first_name: order.billing.first_name,
          last_name: order.billing.last_name,
          username: order.billing.email.split('@')[0],
          password: generateRandomPassword(),
          meta_data: [
            { key: 'phone', value: order.billing.phone || '' },
            { key: 'company', value: order.billing.company || '' },
            { key: 'billing_address', value: order.billing.address_1 || '' },
            { key: 'billing_city', value: order.billing.city || '' },
            { key: 'billing_postcode', value: order.billing.postcode || '' },
            { key: 'billing_country', value: order.billing.country || 'CH' }
          ]
        };

        wpUser = await wooCommerceService.createCustomer(userData);
        console.log('Created new WordPress user:', wpUser.id);
      }
    } catch (error) {
      console.error('Error creating/finding WordPress user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Enroll user in courses
    const enrollmentResults = [];
    for (const courseItem of courseItems) {
      try {
        // Enroll user in TutorLMS course
        const enrollmentSuccess = await tutorLmsService.enrollStudent(
          wpUser.id, 
          courseItem.courseId
        );

        if (enrollmentSuccess) {
          enrollmentResults.push({
            courseId: courseItem.courseId,
            productName: courseItem.productName,
            success: true
          });
          console.log(`Successfully enrolled user ${wpUser.id} in course ${courseItem.courseId}`);
        } else {
          enrollmentResults.push({
            courseId: courseItem.courseId,
            productName: courseItem.productName,
            success: false,
            error: 'Enrollment failed'
          });
          console.error(`Failed to enroll user ${wpUser.id} in course ${courseItem.courseId}`);
        }
      } catch (error) {
        console.error(`Error enrolling in course ${courseItem.courseId}:`, error);
        enrollmentResults.push({
          courseId: courseItem.courseId,
          productName: courseItem.productName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Send confirmation email (implement email service)
    try {
      await sendEnrollmentConfirmationEmail({
        userEmail: order.billing.email,
        userName: `${order.billing.first_name} ${order.billing.last_name}`,
        orderId: order.id,
        courses: enrollmentResults.filter(r => r.success),
        totalAmount: order.total
      });
      console.log('Enrollment confirmation email sent');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    // Log enrollment summary
    const successfulEnrollments = enrollmentResults.filter(r => r.success).length;
    console.log(`Enrollment completed: ${successfulEnrollments}/${enrollmentResults.length} courses enrolled`);

    // Trigger frontend revalidation for student dashboard
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?path=/student-dashboard&secret=${process.env.REVALIDATE_SECRET || 'your-secret-key'}`, {
        method: 'POST'
      });
      
      console.log('Frontend revalidation triggered for student dashboard');
    } catch (revalidationError) {
      console.error('Error triggering frontend revalidation:', revalidationError);
      // Don't fail the webhook if revalidation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order processed successfully',
      enrollments: enrollmentResults,
      userId: wpUser.id,
      frontend_revalidated: true
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to send enrollment confirmation email
async function sendEnrollmentConfirmationEmail(data: {
  userEmail: string;
  userName: string;
  orderId: number;
  courses: Array<{ courseId: number; productName: string; success: boolean }>;
  totalAmount: string;
}) {
  // This would integrate with your email service (EmailJS, SendGrid, etc.)
  console.log('Sending enrollment confirmation email:', data);
  
  // Example implementation with EmailJS or your preferred email service
  // await emailService.send({
  //   to: data.userEmail,
  //   subject: 'Confirmation d\'inscription - Helvetiforma',
  //   template: 'enrollment-confirmation',
  //   data: data
  // });
}

// Helper function to verify webhook signature (implement for production)
function verifyWebhookSignature(signature: string | null, payload: any): boolean {
  // Implement WooCommerce webhook signature verification
  // This is crucial for security in production
  return true; // Placeholder - implement proper verification
}
