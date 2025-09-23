import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { emailService } from '@/services/emailService';
import { tutorLmsService } from '@/services/tutorLmsService';

// Initialize Stripe
let stripe: Stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
  });
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

// Configuration
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_USER = process.env.WORDPRESS_APP_USER || 'gibivawa';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';

// Create WooCommerce auth string
const wooAuth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT SUCCESS API CALLED ===');
    
    const { paymentIntentId, cartData, userData } = await request.json();
    console.log('Received data:', { paymentIntentId, cartData, userData });

    // Validate input
    if (!paymentIntentId || !cartData || !userData) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Step 1: Verify payment with Stripe (or allow test mode)
    console.log('🔍 Verifying payment with Stripe...');
    let paymentIntent;
    
    if (paymentIntentId.startsWith('pi_test_')) {
      // Test mode - create a mock successful payment intent
      console.log('🧪 Test mode detected, using mock payment intent');
      paymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        latest_charge: 'ch_test_' + Date.now()
      };
    } else {
      // Production mode - verify with Stripe
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { success: false, error: 'Payment not successful' },
          { status: 400 }
        );
      }
    }
    
    console.log('✅ Payment verified:', paymentIntent.id);

    // Step 2: Create WooCommerce customer and order
    console.log('📦 Creating WooCommerce customer and order...');
    
    // First, create WooCommerce customer
    let customerId;
    try {
      const customerResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${wooAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.email.split('@')[0] + '_' + Date.now()
        })
      });

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        customerId = customerData.id;
        console.log('✅ WooCommerce customer created:', customerId);
      } else {
        const errorData = await customerResponse.json().catch(() => ({}));
        console.error('❌ WooCommerce customer creation failed:', errorData);
        throw new Error('Failed to create WooCommerce customer');
      }
    } catch (error) {
      console.error('❌ Error creating WooCommerce customer:', error);
      throw new Error('WooCommerce customer creation failed');
    }

    // Create WooCommerce order
    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: customerId,
      billing: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        address_1: userData.address || '',
        city: userData.city || '',
        postcode: userData.postalCode || '',
        country: userData.country || 'CH'
      },
      line_items: cartData.items.map((item: any) => ({
        product_id: item.course_id || item.product_id,
        quantity: item.quantity || 1,
        name: item.name || `Formation ${item.course_id || item.product_id}`
      })),
      meta_data: [
        {
          key: '_stripe_payment_intent_id',
          value: paymentIntentId
        },
        {
          key: '_helvetiforma_payment',
          value: 'yes'
        }
      ]
    };

    let wooOrder;
    try {
      const orderResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${wooAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (orderResponse.ok) {
        wooOrder = await orderResponse.json();
        console.log('✅ WooCommerce order created:', wooOrder.id);
      } else {
        const errorData = await orderResponse.json().catch(() => ({}));
        console.error('❌ WooCommerce order creation failed:', errorData);
        throw new Error('Failed to create WooCommerce order');
      }
    } catch (error) {
      console.error('❌ Error creating WooCommerce order:', error);
      throw new Error('WooCommerce order creation failed');
    }

    // Step 3: Use WooCommerce customer as WordPress user and approve as student
    console.log('👤 Using WooCommerce customer as WordPress user...');
    
    // Get the customer details to use as wpUser
    let wpUser;
    try {
      const customerResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}`, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${wooAuth}`, 'Content-Type': 'application/json' }
      });

      if (customerResponse.ok) {
        wpUser = await customerResponse.json();
        console.log('✅ Using WooCommerce customer as WP user:', wpUser.id);
      } else {
        throw new Error('Failed to retrieve customer details');
      }
    } catch (error) {
      console.error('❌ Error retrieving customer details:', error);
      throw new Error('Failed to retrieve customer details for enrollment');
    }

    // Step 4: Approve user as Tutor LMS student
    console.log('🎓 Approving user as Tutor LMS student...');
    await approveStudentInTutorLMS(wpUser.id);

    // Step 5: Enroll user in courses with resilient strategy
    console.log('🎓 Enrolling user in courses (resilient)...');
    const courseItems = cartData.items.map((item: any) => ({
      courseId: item.course_id || item.product_id,
      productName: item.name || `Formation ${item.course_id || item.product_id}`,
      quantity: item.quantity || 1
    })).filter((item: { courseId: any }) => item.courseId);
    
    const enrollmentResults = [];

    for (const courseItem of courseItems) {
      console.log(`📚 Processing enrollment for course ${courseItem.courseId} (${courseItem.productName})`);
      
      const result = await resilientEnroll(wpUser.id, parseInt(courseItem.courseId.toString()));
      enrollmentResults.push({ 
        course_id: courseItem.courseId, 
        product_name: courseItem.productName,
        success: result.success, 
        error: result.error, 
        enrollment_id: result.enrollmentId
      });
      
      // Add delay between course enrollments to prevent security triggers
      if (courseItems.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Step 6: Send welcome email
    console.log('📧 Sending welcome email...');
    const courseNames = cartData.items.map((item: any) => item.name || `Formation ${item.course_id || item.product_id}`);
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/login`;
    const resetPasswordUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/wp-login.php?action=lostpassword`;
    
    try {
      await emailService.sendWordPressAccountCreated({
        email: wpUser.email,
        firstName: wpUser.first_name || userData.firstName,
        lastName: wpUser.last_name || userData.lastName,
        loginUrl,
        resetPasswordUrl,
        courseNames
      });
      console.log('✅ Welcome email sent');
    } catch (error) {
      console.error('❌ Email sending failed:', error);
    }

    // Step 6: Frontend revalidation removed to prevent 2FA security triggers
    console.log('🔄 Skipping frontend revalidation to prevent security issues');

    // Prepare response
    const successfulEnrollments = enrollmentResults.filter(r => r.success).length;
    const totalEnrollments = enrollmentResults.length;

    return NextResponse.json({
      success: true,
      message: `Paiement réussi ! Compte créé et ${successfulEnrollments}/${totalEnrollments} formation(s) suivie(s).`,
      data: {
        order_id: wooOrder.id,
        woo_order_id: wooOrder.id,
        customer_id: customerId,
        user_id: wpUser.id,
        username: wpUser.username || wpUser.email?.split('@')[0] || 'user',
        email: wpUser.email,
        enrollments: enrollmentResults,
        payment_intent_id: paymentIntentId
      }
    });

  } catch (error) {
    console.error('❌ Payment success processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du traitement du paiement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate secure password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Resilient enrollment with multiple strategies and retries
async function resilientEnroll(userId: number, courseId: number): Promise<{ success: boolean; enrollmentId?: number | string; error?: string }> {
  const attempts: Array<() => Promise<Response>> = [];

  // Strategy A: Tutor REST using Tutor client/secret
  if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
    attempts.push(() => {
      const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
      return fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          course_id: courseId,
          status: 'completed' // Ensure enrollment is automatically approved
        })
      });
    });
  }

  // Strategy B: Tutor REST via WP App Password
  if (process.env.WORDPRESS_APP_PASSWORD) {
    attempts.push(() => {
      const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
      return fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          course_id: courseId,
          status: 'completed' // Ensure enrollment is automatically approved
        })
      });
    });
  }

  // Strategy C: Use service helper (same REST under the hood, but centralized)
  attempts.push(async () => {
    const ok = await tutorLmsService.enrollStudent(userId, courseId);
    return new Response(ok ? JSON.stringify({ ok: true }) : 'failed', { status: ok ? 200 : 500, headers: { 'content-type': 'application/json' } });
  });

  // Try each strategy with basic retries
  const maxRetries = 2;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    for (let r = 0; r <= maxRetries; r++) {
      try {
        const res = await attempt();
        if (res.ok) {
          let data: any = null;
          try { data = await res.json(); } catch {}
          const enrollmentId = data?.data?.enrollment_id || data?.enrollment_id || undefined;
          console.log(`✅ Enrollment success (strategy ${i + 1}, retry ${r}): user=${userId} course=${courseId} id=${enrollmentId ?? 'n/a'}`);
          
          // Post-enrollment: Ensure the enrollment is approved
          if (enrollmentId) {
            await approveEnrollment(enrollmentId, userId, courseId);
          }
          
          return { success: true, enrollmentId };
        }
        const errBody = await safeJson(res);
        console.warn(`⚠️ Enrollment attempt failed (strategy ${i + 1}, retry ${r}) status=${res.status} body=`, errBody);
      } catch (e) {
        console.error(`❌ Enrollment attempt threw (strategy ${i + 1}, retry ${r})`, e);
      }
      await wait(500 * (r + 1));
    }
  }
  return { success: false, error: 'All enrollment strategies failed' };
}

async function safeJson(res: Response): Promise<any> {
  try { return await res.json(); } catch { return undefined; }
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to approve user as Tutor LMS student
async function approveStudentInTutorLMS(userId: number): Promise<void> {
  try {
    console.log(`🎓 Approving user ${userId} as Tutor LMS student...`);
    
    // Set user meta to mark as Tutor student
    const metaData = [
      { key: '_is_tutor_student', value: 'yes' },
      { key: 'tutor_student_status', value: 'active' },
      { key: 'tutor_profile_public', value: 'yes' },
      { key: 'tutor_register_time', value: new Date().toISOString() }
    ];

    for (const meta of metaData) {
      try {
        const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            meta: {
              [meta.key]: meta.value
            }
          })
        });

        if (response.ok) {
          console.log(`✅ Set ${meta.key} = ${meta.value}`);
        } else {
          console.log(`⚠️ Failed to set ${meta.key}`);
        }
      } catch (error) {
        console.error(`❌ Error setting ${meta.key}:`, error);
      }
    }

    // Try to trigger Tutor LMS student registration hooks via API
    try {
      const hookResponse = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/student-approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (hookResponse.ok) {
        console.log('✅ Tutor student approval triggered via API');
      } else {
        console.log('⚠️ Tutor student approval API call failed, but continuing...');
      }
    } catch (error) {
      console.log('⚠️ Tutor student approval API error (non-critical):', error);
    }

    console.log('✅ Student approval process completed');
  } catch (error) {
    console.error('❌ Error in student approval process:', error);
  }
}

// Function to approve a specific enrollment
async function approveEnrollment(enrollmentId: number | string, userId: number, courseId: number): Promise<void> {
  try {
    console.log(`🎓 Approving enrollment ${enrollmentId} for user ${userId} in course ${courseId}...`);
    
    // Try to update enrollment status to completed/approved
    const updateData = {
      status: 'completed',
      enrolled_date: new Date().toISOString()
    };

    // Try with Tutor API first
    if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
      try {
        const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
        const response = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments/${enrollmentId}`, {
          method: 'PUT',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          console.log(`✅ Enrollment ${enrollmentId} approved via Tutor API`);
          return;
        }
      } catch (error) {
        console.log(`⚠️ Tutor API enrollment approval failed:`, error);
      }
    }

    // Fallback: Try with WordPress App Password
    if (process.env.WORDPRESS_APP_PASSWORD) {
      try {
        const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
        const response = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments/${enrollmentId}`, {
          method: 'PUT',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          console.log(`✅ Enrollment ${enrollmentId} approved via WP App Password`);
          return;
        }
      } catch (error) {
        console.log(`⚠️ WP App Password enrollment approval failed:`, error);
      }
    }

    console.log(`⚠️ Could not approve enrollment ${enrollmentId} via API, but enrollment was created successfully`);
  } catch (error) {
    console.error(`❌ Error approving enrollment ${enrollmentId}:`, error);
  }
}
