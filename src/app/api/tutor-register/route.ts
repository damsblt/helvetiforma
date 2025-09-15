import { NextRequest, NextResponse } from 'next/server';

// Tutor LMS Pro API configuration
const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_LICENSE_KEY = process.env.TUTOR_LICENSE_KEY || 'EC00F-9DF58-E44EC-E68BC-1757919356';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email } = await request.json();

    // Validate input
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    console.log('Creating student with Tutor LMS Pro API...');

    // Step 1: Create WordPress user
    const userData = {
      username: email.split('@')[0] + '_' + Date.now(),
      email: email,
      first_name: first_name,
      last_name: last_name,
      password: generatePassword(),
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
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du compte utilisateur' },
        { status: userResponse.status }
      );
    }

    const user = await userResponse.json();
    console.log('WordPress user created:', user.id);

    // Step 2: Enroll user in course using native Tutor LMS Pro API
    const enrollmentData = {
      user_id: user.id,
      course_id: process.env.DEFAULT_COURSE_ID || 24 // Gestion des Salaires
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

    if (!enrollmentResponse.ok) {
      const errorData = await enrollmentResponse.json();
      console.error('Course enrollment failed:', errorData);
      // User was created but not enrolled - still return success but with warning
      return NextResponse.json({
        success: true,
        message: 'Compte créé avec succès ! Vérifiez votre email pour le mot de passe.',
        user_id: user.id,
        username: userData.username,
        warning: 'Compte créé mais inscription au cours en attente'
      });
    }

    const enrollment = await enrollmentResponse.json();
    console.log('User enrolled in course:', enrollment);

    // Step 3: Send welcome email (optional)
    await sendWelcomeEmail(email, userData.username, userData.password, first_name);

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès ! Vous êtes maintenant inscrit à nos formations.',
      user_id: user.id,
      username: userData.username,
      enrollment_id: enrollment.id,
      course_id: enrollmentData.course_id
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
