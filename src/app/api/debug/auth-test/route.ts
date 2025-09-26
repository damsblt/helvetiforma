import { NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function GET() {
  try {
    // Test authentication with WordPress
    const testEndpoints = [
      '/wp-json/wp/v2/users/me', // Should work with auth
      '/wp-json/tutor/v1/', // Tutor API discovery
      '/wp-json/tutor/v1/courses', // Tutor courses
      '/wp-json/tutor/v1/course-content/3633' // The failing endpoint
    ];

    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(buildUrl(endpoint), {
          headers: getAuthHeaders(),
        });

        const result = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          success: response.ok
        };

        // Try to get response data for successful calls
        if (response.ok) {
          try {
            const data = await response.json();
            if (endpoint.includes('users/me')) {
              result.user = {
                id: data.id,
                name: data.name,
                roles: data.roles
              };
            } else if (endpoint.endsWith('/')) {
              result.routes = Object.keys(data.routes || {}).slice(0, 5);
            } else if (Array.isArray(data)) {
              result.count = data.length;
            } else if (data.course_id || data.topics) {
              result.hasCourseContent = true;
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        } else {
          // Get error details
          try {
            const errorData = await response.json();
            result.error = errorData;
          } catch (e) {
            result.error = 'Could not parse error response';
          }
        }

        results.push(result);

      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Network error',
          success: false
        });
      }
    }

    return NextResponse.json({
      server: config.wordpressUrl,
      authUser: config.appUser,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
