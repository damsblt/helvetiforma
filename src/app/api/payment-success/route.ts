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

    // Step 2: Skip WooCommerce order creation (Tutor LMS conflict)
    // Create a simple order record for tracking purposes
    console.log('📦 Skipping WooCommerce order creation due to Tutor LMS conflict...');
    const mockOrder = {
      id: `order_${Date.now()}`,
      status: 'completed',
      total: cartData.total,
      payment_method: 'stripe',
      billing: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email
      }
    };
    console.log('✅ Mock order created for tracking:', mockOrder.id);

    // Step 3: Create WordPress user with subscriber role
    console.log('👤 Creating WordPress user...');
    const username = userData.email.split('@')[0] + '_' + Date.now();
    const password = generatePassword();
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;

    let wpUser;
    try {
      const wpUserResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users`, {
        method: 'POST',
        headers: { 'Authorization': wpAuth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: userData.email,
          password,
          name: `${userData.firstName} ${userData.lastName}`,
          role: 'subscriber'
        })
      });

      if (wpUserResponse.ok) {
        wpUser = await wpUserResponse.json();
        console.log('✅ WP user created via REST:', wpUser.id);
      } else {
        throw new Error('WP user creation failed');
      }
    } catch (error) {
      console.warn('⚠️ WP user creation failed, falling back to WooCommerce customer...');
      
      // Fallback: Create WooCommerce customer
      const customerData = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        username,
        password
      };

      const customerResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${wooAuth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (!customerResponse.ok) {
        throw new Error('Both WP user and WooCommerce customer creation failed');
      }

      wpUser = await customerResponse.json();
      console.log('✅ WooCommerce customer created:', wpUser.id);
    }

    // Step 4: Enroll user in courses with resilient strategy
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

    // Step 5: Send welcome email
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
        order_id: mockOrder.id,
        user_id: wpUser.id,
        username: wpUser.username || username,
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
        body: JSON.stringify({ user_id: userId, course_id: courseId })
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
        body: JSON.stringify({ user_id: userId, course_id: courseId })
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
