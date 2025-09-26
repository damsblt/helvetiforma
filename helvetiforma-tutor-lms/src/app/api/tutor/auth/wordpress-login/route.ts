import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { user_id, email, username, from } = await request.json();

    if (!user_id || !email || !username) {
      return NextResponse.json(
        { success: false, message: 'Données utilisateur requises' },
        { status: 400 }
      );
    }

    // Verify user exists in WordPress using admin credentials
    try {
      const userResponse = await fetch(buildUrl(`/wp-json/wp/v2/users/${user_id}?context=edit`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!userResponse.ok) {
        return NextResponse.json(
          { success: false, message: 'Utilisateur non trouvé dans WordPress' },
          { status: 404 }
        );
      }

      const userData = await userResponse.json();
      
      // Verify user data matches
      if (userData.email !== email || userData.username !== username) {
        return NextResponse.json(
          { success: false, message: 'Données utilisateur non concordantes' },
          { status: 400 }
        );
      }

      // Create user session for Next.js app
      const user = {
        id: userData.id,
        email: userData.email,
        username: userData.username || userData.slug,
        firstName: userData.first_name || userData.name?.split(' ')[0] || '',
        lastName: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
        roles: userData.roles || ['subscriber'],
        isAdmin: userData.roles?.includes('administrator') || false,
        isInstructor: userData.roles?.includes('tutor_instructor') || false,
        isStudent: userData.roles?.includes('subscriber') || userData.roles?.includes('student') || false,
      };

      // Create session token for auto-login
      const sessionToken = Buffer.from(JSON.stringify({
        userId: userData.id,
        email: userData.email,
        loginTime: new Date().toISOString(),
        loginMethod: 'wordpress_auto',
        from: from || 'wordpress'
      })).toString('base64');

      return NextResponse.json({
        success: true,
        user: user,
        token: sessionToken,
        authType: 'wordpress_auto',
        message: 'Auto-connexion WordPress réussie'
      });

    } catch (error) {
      console.error('WordPress user verification error:', error);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la vérification utilisateur' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('WordPress auto-login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
