import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';

export async function POST(request: NextRequest) {
  try {
    const { 
      username, 
      email, 
      password, 
      first_name, 
      last_name, 
      display_name,
      role = 'subscriber'
    } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'username, email, and password are required' },
        { status: 400 }
      );
    }

    // Use WordPress Application Password for authentication
    const auth = `Basic ${Buffer.from(`gibivawa:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

    const apiUrl = `${WORDPRESS_URL}/wp-json/wp/v2/users`;
    console.log('Creating WordPress user:', { username, email, role });

    const userData = {
      username,
      email,
      password,
      first_name: first_name || '',
      last_name: last_name || '',
      display_name: display_name || `${first_name || ''} ${last_name || ''}`.trim() || username,
      roles: [role]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WordPress user creation error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la création de l\'utilisateur WordPress',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('WordPress user created successfully:', responseData.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: responseData.id,
          username: responseData.username,
          email: responseData.email,
          first_name: responseData.first_name,
          last_name: responseData.last_name,
          display_name: responseData.display_name,
          roles: responseData.roles,
          registered_date: responseData.registered_date,
          capabilities: responseData.capabilities,
          avatar_url: responseData.avatar_urls?.['96'] || ''
        },
        message: 'Utilisateur WordPress créé avec succès'
      }
    });

  } catch (error) {
    console.error('WordPress user creation error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

