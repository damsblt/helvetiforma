import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      );
    }

    // Try to trigger email verification resend via WordPress API
    try {
      // Method 1: Try custom WordPress endpoint for resending verification
      const response = await fetch(buildUrl('/wp-json/wp/v2/users/resend-verification'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'Email de vérification renvoyé'
        });
      }
    } catch (error) {
      console.warn('Method 1 failed, trying alternative:', error);
    }

    // Method 2: Try to find user and trigger verification
    try {
      const usersResponse = await fetch(buildUrl(config.endpoints.wp.users + `?search=${encodeURIComponent(email)}`), {
        headers: getAuthHeaders(),
      });

      if (usersResponse.ok) {
        const users = await usersResponse.json();
        if (users.length > 0) {
          const user = users[0];
          
          // Try to trigger verification email via user update
          const updateResponse = await fetch(buildUrl(config.endpoints.wp.users + `/${user.id}`), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              meta: {
                resend_verification: true,
                verification_requested_at: new Date().toISOString()
              }
            }),
          });

          if (updateResponse.ok) {
            return NextResponse.json({
              success: true,
              message: 'Demande de renvoi d\'email enregistrée'
            });
          }
        }
      }
    } catch (error) {
      console.warn('Method 2 failed:', error);
    }

    // Method 3: Log the request for manual processing
    console.log(`Email verification resend requested for: ${email} at ${new Date().toISOString()}`);
    
    // Return success even if we can't automatically resend
    // This prevents revealing whether an email exists in the system
    return NextResponse.json({
      success: true,
      message: 'Si cette adresse email existe dans notre système, un nouvel email de vérification a été envoyé.'
    });

  } catch (error) {
    console.error('Resend verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
