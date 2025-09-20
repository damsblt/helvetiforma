import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';

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

    console.log('Creating WordPress user...');

    // Create WordPress user
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
        { 
          success: false, 
          error: `Erreur lors de la création du compte utilisateur: ${errorData.message || 'Erreur inconnue'}`,
          details: errorData
        },
        { status: userResponse.status }
      );
    }

    const user = await userResponse.json();
    console.log('WordPress user created:', user.id);

    return NextResponse.json({
      success: true,
      user_id: user.id,
      username: userData.username,
      message: 'Utilisateur créé avec succès'
    });

  } catch (error) {
    console.error('Create user error:', error);
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
