import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({
        success: false,
        message: 'Credentials required'
      }, { status: 400 });
    }

    // Step 1: Verify user credentials with WordPress native login
    const formData = new FormData();
    formData.append('log', identifier);
    formData.append('pwd', password);
    formData.append('wp-submit', 'Log In');
    formData.append('redirect_to', buildUrl('/wp-admin/'));

    const loginResponse = await fetch(buildUrl('/wp-login.php'), {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    });

    // If login successful (302 redirect to wp-admin)
    if (loginResponse.status === 302) {
      const redirectLocation = loginResponse.headers.get('location');
      
      if (redirectLocation && redirectLocation.includes('/wp-admin/')) {
        // Login successful - now try to create Application Password using admin credentials
        
        // First, get user ID by searching for the user
        const searchResponse = await fetch(buildUrl(`/wp-json/wp/v2/users?search=${encodeURIComponent(identifier)}`), {
          headers: getAuthHeaders(), // Use admin app password
        });

        if (searchResponse.ok) {
          const users = await searchResponse.json();
          const user = users.find((u: any) => u.email === identifier || u.username === identifier);
          
          if (user) {
            // Try to create Application Password for this user
            const appPasswordData = {
              name: `Auto-generated for ${identifier}`,
              user_id: user.id
            };

            // Note: WordPress doesn't have a built-in REST endpoint for creating app passwords
            // We'll return success with instructions for manual setup
            
            return NextResponse.json({
              success: true,
              message: 'Login credentials verified',
              user: {
                id: user.id,
                email: user.email,
                username: user.username || user.slug,
                name: user.name,
                roles: user.roles || []
              },
              instructions: {
                step1: 'Login credentials are correct',
                step2: 'You need to create an Application Password manually',
                step3: 'Go to WordPress Admin → Users → Profile → Application Passwords',
                step4: 'Create password named "HelvetiForma Login"',
                step5: 'Update your account settings with the generated password'
              }
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Login successful but user details not accessible',
          loginVerified: true,
          instructions: {
            message: 'Your WordPress login works, but you need an Application Password for API access',
            action: 'Create an Application Password in WordPress Admin → Users → Profile'
          }
        });
      }
    }

    // Login failed
    return NextResponse.json({
      success: false,
      message: 'Invalid credentials - login failed',
      loginStatus: loginResponse.status,
      redirectLocation: loginResponse.headers.get('location')
    }, { status: 401 });

  } catch (error) {
    console.error('Create app password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verifying credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
