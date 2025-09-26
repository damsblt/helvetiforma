import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders, handleApiResponse } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Identifiants requis' },
        { status: 400 }
      );
    }

    // Strategy 1: Try direct REST API authentication with Basic Auth (Application Password)
    const userCredentials = {
      username: identifier,
      password: password
    };

    try {
      const response = await fetch(buildUrl(config.endpoints.wp.users + '/me'), {
        method: 'GET',
        headers: getAuthHeaders(userCredentials),
      });

      if (response.ok) {
        const userData = await handleApiResponse<any>(response);
        
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

        // Store credentials for future requests (encoded for security)
        const authString = Buffer.from(`${identifier}:${password}`).toString('base64');

        return NextResponse.json({
          success: true,
          user: user,
          token: authString,
          authType: 'application_password'
        });
      }

      // Strategy 2: Try WordPress native login (for regular passwords)
      if (response.status === 401 || response.status === 403) {
        return await tryWordPressLogin(identifier, password);
      }

      return NextResponse.json({
        success: false,
        message: 'Identifiants incorrects'
      }, { status: 401 });

    } catch (error) {
      console.error('Direct API login error:', error);
      // Fallback to WordPress native login
      return await tryWordPressLogin(identifier, password);
    }

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur de connexion' },
      { status: 500 }
    );
  }
}

// Fallback login using WordPress native login
async function tryWordPressLogin(identifier: string, password: string) {
  try {
    // First, verify credentials with WordPress login
    const formData = new FormData();
    formData.append('log', identifier);
    formData.append('pwd', password);
    formData.append('wp-submit', 'Log In');
    formData.append('redirect_to', buildUrl('/wp-admin/'));

    const loginResponse = await fetch(buildUrl(config.endpoints.auth.login), {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    // Check if login was successful (redirect to wp-admin)
    if (loginResponse.status === 302) {
      const redirectLocation = loginResponse.headers.get('location');
      
      if (redirectLocation && (redirectLocation.includes('/wp-admin/') || redirectLocation.includes('/wp-admin'))) {
        // Login successful! Now get user info using admin credentials
        try {
          // Search for user by email using admin app password
          const searchResponse = await fetch(buildUrl(`/wp-json/wp/v2/users?search=${encodeURIComponent(identifier)}`), {
            headers: getAuthHeaders(), // Uses admin app password
          });

          if (searchResponse.ok) {
            const users = await searchResponse.json();
            
            // Since search results don't include email, take the first result if found
            // (search by email should return the correct user)
            let user = users.length > 0 ? users[0] : null;
            
            // If no results from search, try by username
            if (!user) {
              const usernameSearchResponse = await fetch(buildUrl(`/wp-json/wp/v2/users?search=${encodeURIComponent(identifier.split('@')[0])}`), {
                headers: getAuthHeaders(),
              });
              if (usernameSearchResponse.ok) {
                const usernameUsers = await usernameSearchResponse.json();
                user = usernameUsers.length > 0 ? usernameUsers[0] : null;
              }
            }

            if (user) {
              // Get full user details with roles using context=edit
              const userDetailResponse = await fetch(buildUrl(`/wp-json/wp/v2/users/${user.id}?context=edit`), {
                headers: getAuthHeaders(),
              });

              if (userDetailResponse.ok) {
                const userDetail = await userDetailResponse.json();
                
                // Verify this is the correct user by checking email
                if (userDetail.email === identifier || userDetail.username === identifier) {
                  const userData = {
                    id: userDetail.id,
                    email: userDetail.email,
                    username: userDetail.username || userDetail.slug,
                    firstName: userDetail.first_name || userDetail.name?.split(' ')[0] || '',
                    lastName: userDetail.last_name || userDetail.name?.split(' ').slice(1).join(' ') || '',
                    roles: userDetail.roles || ['subscriber'],
                    isAdmin: userDetail.roles?.includes('administrator') || false,
                    isInstructor: userDetail.roles?.includes('tutor_instructor') || false,
                    isStudent: userDetail.roles?.includes('subscriber') || userDetail.roles?.includes('student') || false,
                  };

                  // Create a session token (simple base64 encoding for now)
                  const sessionToken = Buffer.from(JSON.stringify({
                    userId: userDetail.id,
                    email: userDetail.email,
                    loginTime: new Date().toISOString(),
                    loginMethod: 'wordpress_native'
                  })).toString('base64');

                  return NextResponse.json({
                    success: true,
                    user: userData,
                    token: sessionToken,
                    authType: 'wordpress_native',
                    message: 'Connexion réussie avec identifiants WordPress'
                  });
                }
              }
            }
          }
        } catch (searchError) {
          console.error('Error searching for user:', searchError);
        }

        // Fallback: login verified but couldn't get user details
        return NextResponse.json({
          success: true,
          user: {
            id: 0,
            email: identifier,
            username: identifier.split('@')[0],
            firstName: '',
            lastName: '',
            roles: ['subscriber'],
            isAdmin: false,
            isInstructor: false,
            isStudent: true,
          },
          token: Buffer.from(`${identifier}:verified:${Date.now()}`).toString('base64'),
          authType: 'wordpress_native',
          message: 'Connexion vérifiée (détails utilisateur limités)'
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Identifiants incorrects'
    }, { status: 401 });

  } catch (error) {
    console.error('WordPress login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion WordPress'
    }, { status: 500 });
  }
}
