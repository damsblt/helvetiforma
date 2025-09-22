import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { emailService } from '@/services/emailService';

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

    // Step 4: Enroll user in courses via WordPress REST API (Tutor LMS)
    console.log('🎓 Enrolling user in courses via WP REST...');
    const courseIds = cartData.items.map((item: any) => item.course_id || item.product_id).filter(Boolean);
    const enrollmentResults = [];

    for (const courseId of courseIds) {
      try {
        console.log(`📚 Enrolling user ${wpUser.id} in course ${courseId} via WP REST...`);
        
        // Use WP App Password for Tutor enrollment via WP REST
        const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

        const enrollmentResponse = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments`, {
          method: 'POST',
          headers: {
            'Authorization': wpAuth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            user_id: wpUser.id, 
            course_id: parseInt(courseId.toString()) 
          })
        });

        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json().catch(() => ({}));
          enrollmentResults.push({ 
            course_id: courseId, 
            success: true, 
            enrollment_id: enrollmentData?.data?.enrollment_id 
          });
          console.log(`✅ Enrolled in course ${courseId} via WP REST`);
        } else {
          const errorData = await enrollmentResponse.json().catch(() => ({}));
          enrollmentResults.push({ 
            course_id: courseId, 
            success: false, 
            error: errorData?.message || `HTTP ${enrollmentResponse.status}` 
          });
          console.error(`❌ Enrollment failed for course ${courseId}:`, errorData);
        }
      } catch (error) {
        enrollmentResults.push({ 
          course_id: courseId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Course ${courseId} enrollment error:`, error);
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
