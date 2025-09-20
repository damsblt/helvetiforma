import { NextRequest, NextResponse } from 'next/server';

// Tutor LMS Pro API configuration
const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_LICENSE_KEY = process.env.TUTOR_LICENSE_KEY || 'EC00F-9DF58-E44EC-E68BC-1757919356';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, course_ids } = await request.json();

    // Validate input
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    console.log('Creating student with Tutor LMS Pro API...');

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

    const userResponse = await fetch(`${TUTOR_API_URL}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${wooAuth}`,
      },
      body: JSON.stringify(userData),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('WooCommerce customer creation failed:', errorData);
      
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création du compte utilisateur: ${errorData.message || 'Erreur inconnue'}` },
        { status: userResponse.status }
      );
    }

    const userResponseData = await userResponse.json();
    console.log('WooCommerce customer created:', userResponseData.id);

    // Step 2: Enroll user in courses using native Tutor LMS Pro API
    const coursesToEnroll = course_ids && course_ids.length > 0 
      ? course_ids 
      : [process.env.DEFAULT_COURSE_ID || 24]; // Default course if none specified

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY 
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;

    // Enroll user in all courses
    const enrollments = [];
    const enrollmentErrors = [];

    for (const courseId of coursesToEnroll) {
      try {
        const enrollmentData = {
          user_id: userResponseData.id,
          course_id: parseInt(courseId.toString())
        };

        const enrollmentResponse = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': tutorAuth,
          },
          body: JSON.stringify(enrollmentData),
        });

        if (enrollmentResponse.ok) {
          const enrollment = await enrollmentResponse.json();
          enrollments.push({ course_id: courseId, enrollment });
          console.log(`User enrolled in course ${courseId}:`, enrollment);
        } else {
          const errorData = await enrollmentResponse.json();
          enrollmentErrors.push({ course_id: courseId, error: errorData });
          console.error(`Course ${courseId} enrollment failed:`, errorData);
        }
      } catch (error) {
        enrollmentErrors.push({ course_id: courseId, error: error instanceof Error ? error.message : 'Unknown error' });
        console.error(`Course ${courseId} enrollment error:`, error);
      }
    }

    // Step 3: Send welcome email (optional)
    await sendWelcomeEmail(email, userResponseData.username, userResponseData.password, first_name);

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
    console.error('Registration error:', error);
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

// Send welcome email
async function sendWelcomeEmail(email: string, username: string, password: string, firstName: string) {
  const subject = 'Bienvenue sur HelvetiForma - Vos identifiants de connexion';
  const message = `Bonjour ${firstName},

Votre compte HelvetiForma a été créé avec succès !

Voici vos identifiants de connexion :
Nom d'utilisateur : ${username}
Mot de passe : ${password}

Vous pouvez vous connecter sur : ${TUTOR_API_URL}/login

Cordialement,
L'équipe HelvetiForma`;

  // TODO: Implement real email sending (Resend, SendGrid, etc.)
  console.log('Welcome email would be sent:', { email, subject, message });
}
