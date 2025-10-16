import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🔍 Student Courses API: Request for userId:', userId);

    if (!userId) {
      console.error('❌ Student Courses API: No userId provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const TUTOR_API_KEY = process.env.TUTOR_API_KEY || 'key_85e31422f63c5f73e4781f49727cd58c';
    const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || 'secret_cb2c112e7a880b5ecc185ff136d858b0b9161a0fb05c8e1eb2a73eed3d09e073';
    const TUTOR_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

    console.log('🔍 Student Courses API: Using URL:', `${TUTOR_API_URL}/wp-json/tutor/v1/students/${userId}/courses`);

    // Use official TutorLMS Pro API to fetch student's enrolled courses
    const authHeader = 'Basic ' + Buffer.from(`${TUTOR_API_KEY}:${TUTOR_SECRET_KEY}`).toString('base64');
    
    const response = await fetch(
      `${TUTOR_API_URL}/wp-json/tutor/v1/students/${userId}/courses`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    );

    console.log('🔍 Student Courses API: TutorLMS response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Student Courses API: TutorLMS error:', response.status, response.statusText, errorText);
      
      // If it's a 500 error related to user not found or no enrollments, return empty array
      if (response.status === 500 && errorText.includes('count()')) {
        console.log('⚠️ Student Courses API: User has no enrollments or does not exist, returning empty array');
        return NextResponse.json({ courses: [] });
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch enrolled courses: ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Student Courses API: TutorLMS data:', JSON.stringify(data, null, 2));
    
    // Extract enrolled courses from TutorLMS API response structure
    const enrolledCourses = data.data?.enrolled_courses || data.enrolled_courses || [];
    console.log('🔍 Student Courses API: Found', enrolledCourses.length, 'enrolled courses');
    
    // Format the courses data
    const courses = enrolledCourses.map((course: any) => {
      // Parse progress percentage
      const progressStr = course.course_completed_percentage || '0%';
      const progressNum = parseInt(progressStr.replace('%', '')) || 0;
      
      return {
        id: course.ID || course.id,
        title: course.post_title || course.title?.rendered || course.title || 'Sans titre',
        slug: course.post_name || course.slug || '',
        excerpt: course.post_excerpt || course.excerpt?.rendered || course.excerpt || '',
        featured_image: course.thumbnail_url || course.featured_image || course.image || undefined,
        progress_percentage: progressNum,
        enrolled_at: course.post_date || course.enrolled_at || course.date_enrolled || undefined,
        course_level: course.course_level || course.level || undefined,
      };
    });

    console.log('✅ Student Courses API: Returning', courses.length, 'formatted courses');
    return NextResponse.json({ courses });

  } catch (error) {
    console.error('❌ Student Courses API: Error:', error);
    console.error('❌ Student Courses API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch enrolled courses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

