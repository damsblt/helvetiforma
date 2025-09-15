import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify Tutor LMS integration
export async function GET() {
  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    
    if (!wordpressUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'WordPress URL not configured' 
      }, { status: 500 });
    }

    // Test WordPress API connectivity
    const testResponse = await fetch(`${wordpressUrl}/wp-json/helvetiforma/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`
      }),
    });

    if (testResponse.ok) {
      const data = await testResponse.json();
      return NextResponse.json({
        success: true,
        message: 'Tutor LMS integration test successful',
        data: {
          wordpress_url: wordpressUrl,
          api_endpoint: `${wordpressUrl}/wp-json/helvetiforma/v1/register`,
          test_user_created: data.success,
          user_id: data.user_id
        }
      });
    } else {
      const errorData = await testResponse.json();
      return NextResponse.json({
        success: false,
        error: 'WordPress API test failed',
        details: errorData
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Tutor LMS integration test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Integration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Test endpoint to check Tutor LMS status
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    
    if (!wordpressUrl) {
      return NextResponse.json({
        success: false,
        error: 'WordPress URL not configured'
      }, { status: 500 });
    }

    // Check user status in WordPress/Tutor LMS
    const userResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/${user_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      return NextResponse.json({
        success: true,
        message: 'User status retrieved successfully',
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          roles: userData.roles,
          registered_date: userData.registered_date
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve user status'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('User status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'User status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

