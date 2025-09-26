import { NextRequest, NextResponse } from 'next/server';
import { config, buildUrl } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({
        error: 'Missing credentials'
      }, { status: 400 });
    }

    const results = [];

    // Test 1: Basic Auth (requires Application Password)
    try {
      const basicAuth = Buffer.from(`${identifier}:${password}`).toString('base64');
      const response = await fetch(buildUrl('/wp-json/wp/v2/users/me'), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.ok ? await response.json() : await response.json().catch(() => null);
      
      results.push({
        method: 'Basic Auth (Application Password)',
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: response.ok ? { id: data?.id, name: data?.name, roles: data?.roles } : data
      });
    } catch (error) {
      results.push({
        method: 'Basic Auth (Application Password)',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }

    // Test 2: WordPress Native Login Form
    try {
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

      // Check for successful login (redirect or success response)
      const isLoginSuccess = loginResponse.status === 302 || loginResponse.status === 200;
      let cookies = '';
      let userVerification = null;

      if (isLoginSuccess) {
        // Extract cookies
        const setCookieHeaders = loginResponse.headers.get('set-cookie');
        if (setCookieHeaders) {
          const cookieArray = setCookieHeaders.split(',').map(cookie => cookie.trim());
          const authCookies = cookieArray.filter(cookie => 
            cookie.includes('wordpress_logged_in') || 
            cookie.includes('wordpress_sec')
          );
          cookies = authCookies.map(cookie => cookie.split(';')[0]).join('; ');
        }

        // Verify login with cookies
        if (cookies) {
          try {
            const userResponse = await fetch(buildUrl('/wp-json/wp/v2/users/me'), {
              headers: {
                'Cookie': cookies,
                'Content-Type': 'application/json'
              }
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              userVerification = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                roles: userData.roles
              };
            }
          } catch (e) {
            // Ignore verification errors
          }
        }
      }

      results.push({
        method: 'WordPress Native Login',
        status: loginResponse.status,
        statusText: loginResponse.statusText,
        success: isLoginSuccess && !!userVerification,
        hasCookies: !!cookies,
        userVerification,
        redirectLocation: loginResponse.headers.get('location')
      });

    } catch (error) {
      results.push({
        method: 'WordPress Native Login',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }

    // Test 3: Check if user exists (without authentication)
    try {
      // Try to find user by email in public user list (if exposed)
      const usersResponse = await fetch(buildUrl('/wp-json/wp/v2/users?search=' + encodeURIComponent(identifier)));
      const usersData = usersResponse.ok ? await usersResponse.json() : null;
      
      results.push({
        method: 'User Existence Check',
        status: usersResponse.status,
        success: usersResponse.ok,
        userFound: Array.isArray(usersData) && usersData.length > 0,
        userData: Array.isArray(usersData) && usersData.length > 0 ? 
          { id: usersData[0].id, name: usersData[0].name, slug: usersData[0].slug } : null
      });
    } catch (error) {
      results.push({
        method: 'User Existence Check',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }

    return NextResponse.json({
      identifier,
      server: config.wordpressUrl,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        basicAuthWorks: results.find(r => r.method.includes('Basic Auth'))?.success || false,
        nativeLoginWorks: results.find(r => r.method.includes('Native Login'))?.success || false,
        userExists: results.find(r => r.method.includes('Existence'))?.userFound || false
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test login',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
