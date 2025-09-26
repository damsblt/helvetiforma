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

// GET /api/tutor-courses - Get all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order = searchParams.get('order') || 'desc';
    const orderby = searchParams.get('orderby') || 'date';
    const paged = searchParams.get('paged') || '1';
    const tags = searchParams.get('tags');
    const categories = searchParams.get('categories');

    let endpoint = `/courses?order=${order}&orderby=${orderby}&paged=${paged}`;
    
    if (tags) endpoint += `&tags=${tags}`;
    if (categories) endpoint += `&categories=${categories}`;

    const response = await makeWordPressRequest(endpoint);
    
    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch courses from WordPress' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the Tutor LMS data structure to match frontend expectations
    const courses = data.data?.posts || [];
    const transformedCourses = courses.map((course: any) => ({
      id: course.ID,
      title: course.post_title,
      content: course.post_content,
      excerpt: course.post_excerpt || '',
      status: course.post_status,
      date_created: course.post_date,
      date_modified: course.post_modified,
      author: {
        id: course.post_author?.ID || 1,
        name: course.post_author?.display_name || 'Unknown'
      },
      featured_image: course.thumbnail_url || null,
      categories: course.course_category || [],
      tags: course.course_tag || [],
      meta: {
        course_duration: course.additional_info?.course_duration?.[0] ? 
          `${course.additional_info.course_duration[0].hours}h ${course.additional_info.course_duration[0].minutes}m` : 
          'Non définie',
        course_level: course.additional_info?.course_level?.[0] || 'beginner',
        course_price: course.price || '0',
        course_students: 0 // This would need to be calculated from enrollments
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedCourses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tutor-courses - Create new course
export async function POST(request: NextRequest) {
  try {
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

    const response = await makeWordPressRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return NextResponse.json(
        { error: 'Failed to create course in WordPress' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}