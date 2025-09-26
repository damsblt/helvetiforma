import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

// Helper function to generate secure password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, password, course_id } = await request.json();

    // Validate input
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'first_name, last_name et email sont requis' },
        { status: 400 }
      );
    }

    // Generate password if not provided
    const userPassword = password || generatePassword();
    const courseId = course_id || process.env.DEFAULT_COURSE_ID || 24;

    console.log('Creating new student:', { first_name, last_name, email, courseId });

    // Step 1: Create WordPress user
    const userData = {
      username: email.split('@')[0] + '_' + Date.now(),
      email: email,
      first_name: first_name,
      last_name: last_name,
      password: userPassword,
      roles: ['subscriber']
    };

    const userResponse = await fetch(`${TUTOR_API_URL}/wp-json/wp/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`,
      },
      body: JSON.stringify(userData),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('WordPress user creation failed:', errorData);
      
      // Check if it's a permissions error
      if (errorData.code === 'rest_cannot_create_user') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Configuration requise: Les permissions WordPress ne permettent pas la création automatique de comptes.',
            details: {
              issue: 'WordPress Application Password lacks create_users capability',
              solution: 'Admin needs to grant create_users permission to the Application Password',
              alternative: 'Use WordPress registration form or admin panel to create users first'
            }
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création du compte utilisateur: ${errorData.message || 'Erreur inconnue'}` },
        { status: userResponse.status }
      );
    }

    const user = await userResponse.json();
    console.log('WordPress user created:', user.id);

    // Step 2: Enroll user in course using Tutor LMS Pro API
    const enrollmentData = {
      user_id: user.id,
      course_id: parseInt(courseId.toString())
    };

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;

    const enrollmentResponse = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
      body: JSON.stringify(enrollmentData),
    });

    let enrollment = null;
    if (enrollmentResponse.ok) {
      enrollment = await enrollmentResponse.json();
      console.log('User enrolled in course:', enrollment);
    } else {
      const errorData = await enrollmentResponse.json();
      console.error('Course enrollment failed:', errorData);
      // User was created but not enrolled - still return success but with warning
    }

    // Step 3: Send welcome email (optional)
    await sendWelcomeEmail(email, userData.username, userPassword, first_name);

    return NextResponse.json({
      success: true,
      message: 'Étudiant créé avec succès !',
      student: {
        id: user.id,
        username: userData.username,
        email: email,
        first_name: first_name,
        last_name: last_name,
        password: userPassword,
        login_url: `${TUTOR_API_URL}/login`
      },
      enrollment: enrollment ? {
        enrollment_id: enrollment.data?.enrollment_id || enrollment.id,
        course_id: courseId,
        status: 'enrolled'
      } : {
        course_id: courseId,
        status: 'pending_enrollment',
        warning: 'Compte créé mais inscription au cours en attente'
      }
    });

  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
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
