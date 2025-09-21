import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';
import { tutorLmsService } from '@/services/tutorLmsService';

// Tutor LMS Pro API configuration
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_LICENSE_KEY = process.env.TUTOR_LICENSE_KEY || 'EC00F-9DF58-E44EC-E68BC-1757919356';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

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

    // Step 1: Try to create WordPress user via WooCommerce API (more reliable)
    const userData = {
      email: email,
      first_name: first_name,
      last_name: last_name,
      username: email.split('@')[0] + '_' + Date.now(),
      password: generatePassword()
    };

    // Use WooCommerce API for customer creation (more reliable than WordPress API)
    const wooAuth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b'}:${process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076'}`
    ).toString('base64');

    console.log('🔑 WooCommerce auth configured');
    console.log('📡 Making request to:', `${WORDPRESS_URL}/wp-json/wc/v3/customers`);

    const userResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${wooAuth}`,
      },
      body: JSON.stringify(userData),
    });

    console.log('📊 WooCommerce response status:', userResponse.status);

    if (!userResponse.ok) {
      let errorData;
      try {
        errorData = await userResponse.json();
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { message: 'Unknown error - could not parse response' };
      }
      
      console.error('❌ WooCommerce customer creation failed:', errorData);
      
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création du compte utilisateur: ${errorData.message || 'Erreur inconnue'}` },
        { status: userResponse.status }
      );
    }

    const userResponseData = await userResponse.json();
    console.log('✅ WooCommerce customer created:', userResponseData.id);

    // Step 2: Enroll user in courses using TutorLMS service
    const coursesToEnroll = course_ids && course_ids.length > 0 
      ? course_ids 
      : [process.env.DEFAULT_COURSE_ID || 24]; // Default course if none specified

    console.log('🎓 Enrolling user in courses:', coursesToEnroll);

    // Enroll user in all courses using the working tutorLmsService
    const enrollments = [];
    const enrollmentErrors = [];

    for (const courseId of coursesToEnroll) {
      try {
        console.log(`📚 Enrolling user ${userResponseData.id} in course ${courseId}...`);
        
        const enrollmentSuccess = await tutorLmsService.enrollStudent(
          userResponseData.id, 
          parseInt(courseId.toString())
        );

        if (enrollmentSuccess) {
          enrollments.push({ course_id: courseId, success: true });
          console.log(`✅ User successfully enrolled in course ${courseId}`);
        } else {
          enrollmentErrors.push({ course_id: courseId, error: 'Enrollment failed' });
          console.error(`❌ Course ${courseId} enrollment failed`);
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

