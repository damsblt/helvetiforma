import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders, handleApiResponse } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, username, password } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Generate username from email if not provided
    let finalUsername = username || email.split('@')[0];
    
    // Ensure username is valid (lowercase, no special characters)
    finalUsername = finalUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Prepare user data for WordPress
    const userData = {
      username: finalUsername,
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
      roles: ['subscriber'], // Default role for new users
      meta: {
        // Add any custom meta fields needed for Tutor LMS
        tutor_profile_completed: false,
      }
    };

    try {
      // Create user via WordPress REST API using admin credentials
      const response = await fetch(buildUrl(config.endpoints.wp.users), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(), // Uses admin credentials from env
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await handleApiResponse<any>(response);
        
        const user = {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username || newUser.slug,
          firstName: newUser.first_name || firstName,
          lastName: newUser.last_name || lastName,
          roles: newUser.roles || ['subscriber'],
          isAdmin: false,
          isInstructor: false,
          isStudent: true,
        };

        return NextResponse.json({
          success: true,
          message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
          user: user
        });
      }

      // Handle WordPress API errors
      const errorText = await response.text();
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.code === 'existing_user_login') {
            errorMessage = 'Ce nom d\'utilisateur est déjà utilisé';
          } else if (errorData.code === 'existing_user_email') {
            errorMessage = 'Cette adresse email est déjà utilisée';
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error('Error parsing WordPress error response:', e);
        }
      }

      return NextResponse.json({
        success: false,
        message: errorMessage
      }, { status: response.status });

    } catch (fetchError) {
      console.error('WordPress API registration error:', fetchError);
      
      // Fallback: Try custom registration endpoint if it exists
      try {
        const fallbackResponse = await fetch(buildUrl(config.endpoints.helvetiforma.register), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            username: username,
            password: password,
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackData = await handleApiResponse<any>(fallbackResponse);
          return NextResponse.json({
            success: true,
            message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
            user: fallbackData.user
          });
        }
      } catch (fallbackError) {
        console.error('Fallback registration error:', fallbackError);
      }

      return NextResponse.json({
        success: false,
        message: 'Erreur de connexion au serveur. Veuillez réessayer plus tard.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}