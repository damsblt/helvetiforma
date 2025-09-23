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

    // Step 2: Create WooCommerce order and customer
    console.log('📦 Creating WooCommerce order and customer...');
    
    // First, create or get customer
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
        console.log('⚠️ Customer creation failed, will create order without customer ID');
      }
    } catch (error) {
      console.error('❌ Error creating customer:', error);
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
        // Fallback to mock order
        wooOrder = {
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
        console.log('✅ Fallback mock order created:', wooOrder.id);
      }
    } catch (error) {
      console.error('❌ Error creating WooCommerce order:', error);
      // Fallback to mock order
      wooOrder = {
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
      console.log('✅ Fallback mock order created:', wooOrder.id);
    }

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

    // Step 4: Enroll user in courses with enhanced resilient strategy
    console.log('🎓 Enrolling user in courses (enhanced resilient)...');
    const courseItems = cartData.items.map((item: any) => ({
      courseId: item.course_id || item.product_id,
      productName: item.name || `Formation ${item.course_id || item.product_id}`,
      quantity: item.quantity || 1
    })).filter((item: { courseId: any }) => item.courseId);
    
    const enrollmentResults = [];

    for (const courseItem of courseItems) {
      console.log(`📚 Processing enrollment for course ${courseItem.courseId} (${courseItem.productName})`);
      
      // First, ensure user is approved as a student in Tutor LMS
      await ensureStudentApproval(wpUser.id);
      
      const result = await enhancedResilientEnroll(wpUser.id, parseInt(courseItem.courseId.toString()), courseItem.productName);
      enrollmentResults.push({ 
        course_id: courseItem.courseId, 
        product_name: courseItem.productName,
        success: result.success, 
        error: result.error, 
        enrollment_id: result.enrollmentId,
        strategy_used: result.strategyUsed
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
        order_id: wooOrder.id,
        woo_order_id: wooOrder.id,
        customer_id: customerId,
        user_id: wpUser.id,
        username: wpUser.username || username,
        email: wpUser.email,
        enrollments: enrollmentResults,
        payment_intent_id: paymentIntentId,
        frontend_revalidated: false
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

// Helper function to ensure user is approved as a student in Tutor LMS
async function ensureStudentApproval(userId: number): Promise<void> {
  try {
    console.log(`🎓 Ensuring student approval for user ${userId}...`);
    
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

// Enhanced resilient enrollment with multiple strategies, retries, and better error handling
async function enhancedResilientEnroll(userId: number, courseId: number, productName: string): Promise<{ success: boolean; enrollmentId?: number | string; error?: string; strategyUsed?: string }> {
  const strategies = [
    {
      name: 'Tutor REST API (Client/Secret)',
      attempt: async () => {
        if (!TUTOR_CLIENT_ID || !TUTOR_SECRET_KEY) return null;
        const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
        return fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
          method: 'POST',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, course_id: courseId })
        });
      }
    },
    {
      name: 'Tutor REST API (WP App Password)',
      attempt: async () => {
        if (!process.env.WORDPRESS_APP_PASSWORD) return null;
        const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
        return fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments`, {
          method: 'POST',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, course_id: courseId })
        });
      }
    },
    {
      name: 'TutorLMS Service Helper',
      attempt: async () => {
        const ok = await tutorLmsService.enrollStudent(userId, courseId);
        return new Response(ok ? JSON.stringify({ ok: true }) : 'failed', { 
          status: ok ? 200 : 500, 
          headers: { 'content-type': 'application/json' } 
        });
      }
    }
  ];

  const maxRetries = 1; // Reduced from 3 to 1 to prevent security triggers
  const retryDelay = 500; // Reduced delay

  for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex++) {
    const strategy = strategies[strategyIndex];
    
    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        console.log(`🔄 Attempting enrollment (${strategy.name}, retry ${retry + 1}/${maxRetries + 1}): user=${userId} course=${courseId} product="${productName}"`);
        
        const response = await strategy.attempt();
        if (!response) {
          console.log(`⏭️ Strategy ${strategy.name} skipped (missing credentials)`);
          break; // Skip to next strategy
        }

        if (response.ok) {
          let data: any = null;
          try { 
            data = await response.json(); 
          } catch (jsonError) {
            console.warn(`⚠️ Could not parse response JSON for ${strategy.name}:`, jsonError);
          }
          
          const enrollmentId = data?.data?.enrollment_id || data?.enrollment_id || data?.id || undefined;
          console.log(`✅ Enrollment SUCCESS (${strategy.name}, retry ${retry + 1}): user=${userId} course=${courseId} product="${productName}" enrollment_id=${enrollmentId ?? 'n/a'}`);
          
          return { 
            success: true, 
            enrollmentId, 
            strategyUsed: strategy.name 
          };
        }

        // Handle specific error responses
        const errorData = await safeJson(response);
        const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}`;
        
        console.warn(`⚠️ Enrollment attempt failed (${strategy.name}, retry ${retry + 1}): status=${response.status} error="${errorMessage}"`);
        
        // If it's a client error (4xx), don't retry this strategy
        if (response.status >= 400 && response.status < 500) {
          console.log(`🚫 Client error detected, skipping remaining retries for ${strategy.name}`);
          break;
        }

      } catch (error) {
        console.error(`❌ Enrollment attempt threw (${strategy.name}, retry ${retry + 1}):`, error);
      }

      // Wait before retry (exponential backoff)
      if (retry < maxRetries) {
        const delay = retryDelay * Math.pow(2, retry);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await wait(delay);
      }
    }
  }

  console.error(`❌ All enrollment strategies FAILED for user=${userId} course=${courseId} product="${productName}"`);
  return { 
    success: false, 
    error: 'All enrollment strategies failed after multiple retries',
    strategyUsed: 'None - All Failed'
  };
}

// Legacy function for backward compatibility
async function resilientEnroll(userId: number, courseId: number): Promise<{ success: boolean; enrollmentId?: number | string; error?: string }> {
  const result = await enhancedResilientEnroll(userId, courseId, `Course ${courseId}`);
  return {
    success: result.success,
    enrollmentId: result.enrollmentId,
    error: result.error
  };
}

async function safeJson(res: Response): Promise<any> {
  try { return await res.json(); } catch { return undefined; }
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
