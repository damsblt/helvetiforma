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

// Configuration (trim to avoid stray newlines from env)
const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').trim();
const TUTOR_API_URL = (process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch').trim();
const TUTOR_CLIENT_ID = (process.env.TUTOR_CLIENT_ID || '').trim();
const TUTOR_SECRET_KEY = (process.env.TUTOR_SECRET_KEY || '').trim();
const WORDPRESS_APP_USER = (process.env.WORDPRESS_APP_USER || 'gibivawa').trim();
const WOOCOMMERCE_CONSUMER_KEY = (process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b').trim();
const WOOCOMMERCE_CONSUMER_SECRET = (process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076').trim();

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

    // Step 2: Ensure WordPress subscriber exists (find-or-create)
    console.log('👤 Ensuring WordPress subscriber exists...');
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;

    const email = String(userData.email).trim();
    const firstName = String(userData.firstName || '').trim();
    const lastName = String(userData.lastName || '').trim();

    let wpUser: any = null;
    try {
      const findRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}&context=edit`, {
        headers: { 'Authorization': wpAuth }
      });
      if (findRes.ok) {
        const list = await findRes.json();
        wpUser = Array.isArray(list) ? list.find((u: any) => u.email === email) : null;
      }
    } catch (e) {
      console.warn('⚠️ WP find by email failed:', e);
    }

    if (!wpUser) {
      console.log('➡️ Creating WP user (subscriber)...');
      const username = `${email.split('@')[0]}_${Date.now()}`;
      const tempPassword = generatePassword();
      const createRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users`, {
        method: 'POST',
        headers: { 'Authorization': wpAuth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password: tempPassword,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`.trim(),
          roles: ['subscriber'],
          send_user_notification: false
        })
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        console.error('❌ WP user creation failed:', err);
        return NextResponse.json({ success: false, error: 'WordPress subscriber creation failed', details: err }, { status: 500 });
      }
      wpUser = await createRes.json();
      console.log('✅ WP user created:', wpUser.id);
    } else {
      console.log('✅ WP user found:', wpUser.id);
    }

    // Guard: ensure subscriber role
    await ensureSubscriberRole(wpUser.id);

    // Step 3: Create WooCommerce order tied to this WP user
    console.log('📦 Creating WooCommerce order (customer_id = WP user)...');
    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: wpUser.id,
      total: String(cartData.total),
      currency: cartData.currency || 'CHF',
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
      line_items: cartData.items.map((item: any) => ({
        product_id: item.course_id || item.product_id,
        quantity: item.quantity || 1,
        name: item.name || `Formation ${item.course_id || item.product_id}`,
        price: String(item.price || item.total || 0),
        total: String((item.price || item.total || 0) * (item.quantity || 1))
      })),
      meta_data: [
        { key: '_stripe_payment_intent_id', value: paymentIntentId },
        { key: '_helvetiforma_payment', value: 'yes' }
      ]
    };

    let wooOrder: any = null;
    try {
      const orderRes = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${wooAuth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const body = await orderRes.json().catch(() => undefined);
      if (!orderRes.ok) {
        console.error('❌ Woo order creation failed:', body);
        return NextResponse.json({ success: false, error: 'WooCommerce order creation failed', details: body }, { status: 500 });
      }
      wooOrder = body;
      console.log('✅ Woo order created:', wooOrder?.id);
    } catch (e) {
      console.error('❌ Error creating Woo order:', e);
      return NextResponse.json({ success: false, error: 'WooCommerce order creation error' }, { status: 500 });
    }

    // Step 4: Enroll user into each course in cart (completed)
    console.log('🎓 Enrolling in Tutor LMS...');
    const courseItems = (cartData.items || [])
      .map((it: any) => it.course_id || it.product_id)
      .filter((id: any) => !!id)
      .map((id: any) => parseInt(String(id)));

    const enrollmentResults: Array<{ course_id: number; success: boolean; enrollment_id?: number|string; error?: string }> = [];
    for (const courseId of courseItems) {
      const res = await resilientEnroll(Number(wpUser.id), Number(courseId));
      enrollmentResults.push({ course_id: Number(courseId), success: res.success, enrollment_id: res.enrollmentId, error: res.error });
      if (courseItems.length > 1) await new Promise(r => setTimeout(r, 300));
    }

    const successfulEnrollments = enrollmentResults.filter(r => r.success).length;
    const totalEnrollments = enrollmentResults.length;

    return NextResponse.json({
      success: true,
      message: `Paiement réussi. Commande Woo #${wooOrder?.id}. Inscriptions ${successfulEnrollments}/${totalEnrollments}.`,
      data: {
        user_id: wpUser.id,
        email,
        woo_order_id: wooOrder?.id,
        payment_intent_id: paymentIntentId,
        enrollments: enrollmentResults
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

// Ensure WordPress user has subscriber role
async function ensureSubscriberRole(userId: number): Promise<void> {
  try {
    console.log(`🔧 Ensuring WordPress user ${userId} has role 'subscriber'...`);
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;

    // First fetch current roles
    const getRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}?context=edit`, {
      method: 'GET',
      headers: { 'Authorization': wpAuth }
    });
    const current = await getRes.json().catch(() => ({} as any));
    console.log('Current WP user roles:', current?.roles);

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roles: ['subscriber']
      })
    });

    if (response.ok) {
      console.log('✅ User role set to subscriber');
    } else {
      const body = await response.json().catch(() => ({} as any));
      console.warn('⚠️ Failed to set user role to subscriber', body);
    }
  } catch (error) {
    console.error('❌ Error ensuring subscriber role:', error);
  }
}

// Ensure WordPress user has both subscriber and customer roles (after Woo link)
async function ensureSubscriberRoleWithCustomer(userId: number): Promise<void> {
  try {
    console.log(`🔧 Ensuring WordPress user ${userId} has roles ['subscriber', 'customer']...`);
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roles: ['subscriber', 'customer']
      })
    });

    if (response.ok) {
      console.log('✅ User roles set to [subscriber, customer]');
    } else {
      const body = await response.json().catch(() => ({} as any));
      console.warn('⚠️ Failed to set user roles to [subscriber, customer]', body);
    }
  } catch (error) {
    console.error('❌ Error ensuring subscriber+customer roles:', error);
  }
}

// Final check before enrollment - ensure subscriber role is present
async function ensureSubscriberRoleBeforeEnrollment(userId: number): Promise<void> {
  try {
    console.log(`🔧 Final check: ensuring WordPress user ${userId} has subscriber role before enrollment...`);
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;

    // Fetch current roles
    const getRes = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}?context=edit`, {
      method: 'GET',
      headers: { 'Authorization': wpAuth }
    });
    const current = await getRes.json().catch(() => ({} as any));
    const currentRoles = current?.roles || [];
    console.log('Final check - Current WP user roles:', currentRoles);

    // If subscriber is missing, add it back
    if (!currentRoles.includes('subscriber')) {
      console.log('⚠️ Subscriber role missing, adding it back...');
      const newRoles = [...currentRoles, 'subscriber'];
      const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': wpAuth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roles: newRoles
        })
      });

      if (response.ok) {
        console.log('✅ Subscriber role restored:', newRoles);
      } else {
        const body = await response.json().catch(() => ({} as any));
        console.warn('⚠️ Failed to restore subscriber role', body);
      }
    } else {
      console.log('✅ Subscriber role confirmed present');
    }
  } catch (error) {
    console.error('❌ Error in final subscriber role check:', error);
  }
}

// Function to link WooCommerce customer to WordPress user
async function linkWooCommerceCustomerToWordPressUser(customerId: number, wpUserId: number, wooAuth: string): Promise<void> {
  try {
    console.log(`🔗 Linking WooCommerce customer ${customerId} to WordPress user ${wpUserId}...`);
    
    const updateData = {
      user_id: wpUserId
    };

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${wooAuth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      console.log('✅ WooCommerce customer linked to WordPress user');
    } else {
      console.log('⚠️ Could not link WooCommerce customer to WordPress user, but continuing...');
    }
  } catch (error) {
    console.error('❌ Error linking WooCommerce customer to WordPress user:', error);
  }
}

// Function to generate password reset link
async function generatePasswordResetLink(email: string, wpAuth: string): Promise<string> {
  try {
    console.log(`🔑 Generating password reset link for ${email}...`);
    
    // Use WordPress REST API to trigger password reset
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/lost-password`, {
      method: 'POST',
      headers: {
        'Authorization': wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_login: email
      })
    });

    if (response.ok) {
      console.log('✅ Password reset link generated');
      // Return the standard WordPress password reset URL
      return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/wp-login.php?action=lostpassword`;
    } else {
      console.log('⚠️ Could not generate password reset link, using fallback URL');
      return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/wp-login.php?action=lostpassword`;
    }
  } catch (error) {
    console.error('❌ Error generating password reset link:', error);
    // Return fallback URL
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/wp-login.php?action=lostpassword`;
  }
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
    
    // Preferred endpoint per Tutor LMS docs: mark enrollment completed
    const completeData = { enrollment_id: enrollmentId } as any;

    // Try with Tutor API first: PUT /wp-json/tutor/v1/enrollments/completed
    if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
      try {
        const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
        const response = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments/completed`, {
          method: 'PUT',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify(completeData)
        });

        if (response.ok) {
          console.log(`✅ Enrollment ${enrollmentId} marked completed via Tutor API /completed`);
          return;
        }
      } catch (error) {
        console.log(`⚠️ Tutor API /completed endpoint failed:`, error);
      }
    }

    // Fallback 1: Try with WordPress App Password on /completed
    if (process.env.WORDPRESS_APP_PASSWORD) {
      try {
        const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
        const response = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments/completed`, {
          method: 'PUT',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify(completeData)
        });

        if (response.ok) {
          console.log(`✅ Enrollment ${enrollmentId} marked completed via WP App Password /completed`);
          return;
        }
      } catch (error) {
        console.log(`⚠️ WP App Password /completed endpoint failed:`, error);
      }
    }

    // Fallback 2: Legacy endpoint updating status directly (if /completed is unavailable)
    const legacyUpdate = {
      status: 'completed',
      enrolled_date: new Date().toISOString()
    };

    // Try with Tutor API legacy endpoint
    if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
      try {
        const auth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
        const response = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments/${enrollmentId}`, {
          method: 'PUT',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify(legacyUpdate)
        });

        if (response.ok) {
          console.log(`✅ Enrollment ${enrollmentId} approved via Tutor API legacy endpoint`);
          return;
        }
      } catch (error) {
        console.log(`⚠️ Tutor API legacy approval failed:`, error);
      }
    }

    // Fallback 3: Legacy endpoint via WP App Password
    if (process.env.WORDPRESS_APP_PASSWORD) {
      try {
        const auth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
        const response = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/enrollments/${enrollmentId}`, {
          method: 'PUT',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify(legacyUpdate)
        });

        if (response.ok) {
          console.log(`✅ Enrollment ${enrollmentId} approved via WP App Password legacy endpoint`);
          return;
        }
      } catch (error) {
        console.log(`⚠️ WP App Password legacy approval failed:`, error);
      }
    }

    console.log(`⚠️ Could not approve enrollment ${enrollmentId} via API, but enrollment was created successfully`);
  } catch (error) {
    console.error(`❌ Error approving enrollment ${enrollmentId}:`, error);
  }
}
