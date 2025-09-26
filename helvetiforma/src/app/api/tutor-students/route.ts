import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || 'key_41b07de3d8e6e2d21df756ed2dff73ad';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || 'secret_c59d6489d2bb179380853bed081688c8d2a86b9e471f34ec44660359597f127f';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

// Helper function to make authenticated requests to WordPress
async function makeWordPressRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${WORDPRESS_URL}/wp-json/tutor/v1${endpoint}`;
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Use Tutor LMS Pro API credentials for authentication
  if (TUTOR_CLIENT_ID && TUTOR_SECRET_KEY) {
    headers['Authorization'] = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;
  } else if (WORDPRESS_APP_PASSWORD) {
    headers['Authorization'] = `Basic ${Buffer.from(`admin:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// GET /api/tutor-students - Get all students
export async function GET(request: NextRequest) {
  try {
    // For now, return mock data since Tutor LMS credentials don't work with WordPress users API
    // In a real implementation, you would need to use a different authentication method
    // or create a custom endpoint in WordPress that works with Tutor LMS credentials
    
    const mockStudents = [
      {
        id: 1,
        display_name: 'John Doe',
        user_email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        date_registered: '2025-09-01T10:00:00Z',
        avatar_url: null,
        meta: {
          total_courses: 2,
          completed_courses: 1,
          total_lessons: 8,
          completed_lessons: 4
        }
      },
      {
        id: 2,
        display_name: 'Jane Smith',
        user_email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        date_registered: '2025-09-05T14:30:00Z',
        avatar_url: null,
        meta: {
          total_courses: 1,
          completed_courses: 0,
          total_lessons: 4,
          completed_lessons: 1
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockStudents
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}