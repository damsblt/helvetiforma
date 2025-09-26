import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';
import { tutorLmsService } from '@/services/tutorLmsService';

// Tutor LMS Pro API configuration
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_LICENSE_KEY = process.env.TUTOR_LICENSE_KEY || 'EC00F-9DF58-E44EC-E68BC-1757919356';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_USER = process.env.WORDPRESS_APP_USER || 'gibivawa';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TUTOR REGISTER API CALLED ===');
    
    const { first_name, last_name, email, course_ids } = await request.json();
    console.log('Received data:', { first_name, last_name, email, course_ids });

    // Validate input
    if (!first_name || !last_name || !email) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    console.log('✅ Creating student with Tutor LMS Pro API...');

    // Step 1: Create WordPress user via core WP REST (simplest + ensures subscriber role)
    const username = email.split('@')[0] + '_' + Date.now();
    const password = generatePassword();
    const appPw = process.env.WORDPRESS_APP_PASSWORD || '';
    const wpAuth = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${appPw}`).toString('base64')}`;

    let userResponseData: any | null = null;
    try {
      console.log('📡 Creating WP user via wp/v2/users...');
      const wpCreate = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users`, {
        method: 'POST',
        headers: { 'Authorization': wpAuth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          name: `${first_name} ${last_name}`,
          role: 'subscriber'
        })
      });
      if (wpCreate.ok) {
        userResponseData = await wpCreate.json();
        console.log('✅ WP user created:', userResponseData.id);
      } else {
        const err = await wpCreate.json().catch(() => ({}));
        console.warn('⚠️ WP user create failed, falling back to WooCommerce customer:', err);
      }
    } catch (e) {
      console.warn('⚠️ WP user API error, will fallback to WooCommerce:', e instanceof Error ? e.message : 'Unknown');
    }

    // Fallback: create WooCommerce customer
    if (!userResponseData) {
      const wooAuth = Buffer.from(
        `${process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b'}:${process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076'}`
      ).toString('base64');

      const userData = {
        email,
        first_name,
        last_name,
        username,
        password
      };

      console.log('📡 Creating WooCommerce customer...');
      const wcResp = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${wooAuth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!wcResp.ok) {
        const errorData = await wcResp.json().catch(() => ({}));
        return NextResponse.json(
          { success: false, error: `Erreur lors de la création du compte utilisateur: ${errorData.message || 'Erreur inconnue'}` },
          { status: wcResp.status }
        );
      }
      userResponseData = await wcResp.json();
      console.log('✅ WooCommerce customer created:', userResponseData.id);
    }

    // Step 2: Enroll user in courses directly via TutorLMS REST (simplest)
    const coursesToEnroll = course_ids && course_ids.length > 0 
      ? course_ids 
      : [process.env.DEFAULT_COURSE_ID || 24]; // Default course if none specified

    console.log('🎓 Enrolling user in courses:', coursesToEnroll);

    // Enroll user in all courses via direct REST
    const enrollments = [];
    const enrollmentErrors = [];

    for (const courseId of coursesToEnroll) {
      try {
        console.log(`📚 Enrolling user ${userResponseData.id} in course ${courseId} via Tutor REST...`);
        // Prefer Tutor LMS API credentials when available; fall back to WP App Password auth
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
          headers['Authorization'] = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
        } else if (process.env.WORDPRESS_APP_PASSWORD) {
          headers['Authorization'] = `Basic ${Buffer.from(`${WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
        }

        const resp = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_id: userResponseData.id, course_id: parseInt(courseId.toString()) })
        });

        if (resp.ok) {
          const data = await resp.json().catch(() => ({}));
          enrollments.push({ course_id: courseId, success: true, tutor: data?.data?.enrollment_id });
          console.log(`✅ Tutor enrollment OK for course ${courseId}`);
        } else {
          const err = await resp.json().catch(() => ({}));
          enrollmentErrors.push({ course_id: courseId, error: err?.message || `HTTP ${resp.status}` });
          console.error(`❌ Tutor enrollment failed for ${courseId}:`, err);
        }
      } catch (error) {
        enrollmentErrors.push({ course_id: courseId, error: error instanceof Error ? error.message : 'Unknown error' });
        console.error(`❌ Course ${courseId} enrollment error:`, error);
      }
    }

    // Step 3: Get course names for email
    const courseNames = [];
    for (const courseId of coursesToEnroll) {
      try {
        console.log(`📖 Fetching course name for course ${courseId}...`);
        const course = await tutorLmsService.getCourse(parseInt(courseId.toString()));
        if (course) {
          courseNames.push(course.title || `Formation ${courseId}`);
          console.log(`✅ Course name found: ${course.title}`);
        } else {
          courseNames.push(`Formation ${courseId}`);
          console.log(`⚠️ Course ${courseId} not found, using default name`);
        }
      } catch (error) {
        console.error(`❌ Error fetching course ${courseId}:`, error);
        courseNames.push(`Formation ${courseId}`);
      }
    }

    // Step 4: Send welcome email with course information
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/login`;
    const resetPasswordUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/wp-login.php?action=lostpassword`;
    
    await emailService.sendWordPressAccountCreated({
      email: userResponseData.email,
      firstName: userResponseData.first_name,
      lastName: userResponseData.last_name,
      loginUrl,
      resetPasswordUrl,
      courseNames: courseNames.length > 0 ? courseNames : ['Formation par défaut']
    });

    // Prepare response based on enrollment results
    const successMessage = enrollments.length > 0 
      ? `Compte créé avec succès ! Vous êtes maintenant inscrit à ${enrollments.length} formation(s).`
      : 'Compte créé avec succès ! Vérifiez votre email pour le mot de passe.';

    return NextResponse.json({
      success: true,
      message: successMessage,
      user_id: userResponseData.id,
      username: userResponseData.username,
      email: userResponseData.email,
      first_name: userResponseData.first_name,
      last_name: userResponseData.last_name,
      enrollments: enrollments,
      enrollment_errors: enrollmentErrors.length > 0 ? enrollmentErrors : undefined,
      warning: enrollmentErrors.length > 0 
        ? `Compte créé mais ${enrollmentErrors.length} inscription(s) en attente` 
        : undefined
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
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

// Helper function to create simple enrollment record
async function createSimpleEnrollment(userId: number, courseId: number): Promise<boolean> {
  try {
    console.log(`🔧 Creating simple enrollment for user ${userId} in course ${courseId}...`);
    
    // Create a simple enrollment record using WooCommerce orders
    const wooAuth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b'}:${process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076'}`
    ).toString('base64');

    const enrollmentData = {
      payment_method: 'helvetiforma_enrollment',
      payment_method_title: 'HelvetiForma Enrollment',
      set_paid: true,
      status: 'completed',
      customer_id: userId,
      line_items: [
        {
          product_id: courseId,
          quantity: 1,
          name: `Course Enrollment - ${courseId}`
        }
      ],
      meta_data: [
        {
          key: '_helvetiforma_enrollment',
          value: 'yes'
        },
        {
          key: '_enrollment_course_id',
          value: courseId.toString()
        },
        {
          key: '_enrollment_user_id',
          value: userId.toString()
        },
        {
          key: '_enrollment_date',
          value: new Date().toISOString()
        }
      ]
    };

    const orderResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${wooAuth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrollmentData)
    });

    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log(`✅ Simple enrollment successful! Order created: ${orderData.id}`);
      return true;
    } else {
      const errorData = await orderResponse.json().catch(() => ({}));
      console.error(`❌ Simple enrollment failed:`, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in simple enrollment:', error);
    return false;
  }
}

