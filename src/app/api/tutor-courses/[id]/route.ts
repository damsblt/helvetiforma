import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

// Helper function to make authenticated requests to WordPress
async function makeWordPressRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${WORDPRESS_URL}/wp-json/tutor/v1${endpoint}`;
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (WORDPRESS_APP_PASSWORD) {
    headers['Authorization'] = `Basic ${Buffer.from(`admin:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// GET /api/tutor-courses/[id] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const response = await makeWordPressRequest(`/courses/${courseId}`);
    
    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tutor-courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body = await request.json();
    
    const courseData = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      status: body.status || 'publish',
      meta: {
        course_duration: body.meta?.course_duration || '',
        course_level: body.meta?.course_level || 'beginner',
        course_price: body.meta?.course_price || '0'
      }
    };

    const response = await makeWordPressRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return NextResponse.json(
        { error: 'Failed to update course in WordPress' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tutor-courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const response = await makeWordPressRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to delete course from WordPress' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}