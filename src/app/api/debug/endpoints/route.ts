import { NextResponse } from 'next/server';
import { config, buildUrl, getAuthHeaders } from '@/lib/wordpress';

export async function GET() {
  try {
  // Test different endpoints to see what's available
  const endpointsToTest = [
    '/wp-json/wp/v2/',
    '/wp-json/tutor/v1/',
    '/wp-json/wp/v2/courses',
    '/wp-json/tutor/v1/courses',
    '/wp-json/tutor/v1/course-content/3633',  // Test with course ID from error
    '/wp-json/tutor/v1/course-content/2655',  // Test avec un ID de cours réel
    '/wp-json/wp/v2/topics',
    '/wp-json/wp/v2/lesson',
    '/wp-json/wp/v2/tutor_lesson',
    '/wp-json/tutor/v1/lessons',
    '/wp-json/tutor/v1/topics',
  ];

    const results = [];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await fetch(buildUrl(endpoint), {
          headers: getAuthHeaders(),
        });

        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          available: response.ok,
          contentType: response.headers.get('content-type'),
        });

        // If it's a discovery endpoint, try to get the data
        if (response.ok && (endpoint.endsWith('/') || endpoint.includes('courses'))) {
          try {
            const data = await response.json();
            if (endpoint.endsWith('/')) {
              // Discovery endpoint - show available routes
              results[results.length - 1].routes = Object.keys(data.routes || {}).slice(0, 10);
            } else if (Array.isArray(data)) {
              results[results.length - 1].sampleCount = data.length;
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          available: false,
        });
      }
    }

    return NextResponse.json({
      server: config.wordpressUrl,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        available: results.filter(r => r.available).length,
        errors: results.filter(r => !r.available).length,
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test endpoints',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
