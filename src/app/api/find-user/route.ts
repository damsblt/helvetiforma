import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      );
    }

    console.log('Finding user by email:', email);

    // Get all users and find by email
    const usersResponse = await fetch(`${TUTOR_API_URL}/wp-json/wp/v2/users`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
    }

    const users = await usersResponse.json();
    const user = users.find((u: any) => u.slug === email || u.email === email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: user.id,
      name: user.name,
      email: user.slug, // WordPress uses slug for email in this context
      message: 'Utilisateur trouvé'
    });

  } catch (error) {
    console.error('Find user error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
