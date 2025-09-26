import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl, handleApiResponse } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get real enrollments from Tutor LMS WordPress
    try {
      // Method 1: Try to get enrollments from Tutor LMS API
      const tutorResponse = await fetch(buildUrl(`${config.endpoints.tutor.enrollments}?user_id=${user_id}`), {
        headers: getAuthHeaders(),
      });

      if (tutorResponse.ok) {
        const tutorEnrollments = await tutorResponse.json();
        
        return NextResponse.json({
          success: true,
          data: tutorEnrollments.map((enrollment: any) => ({
            id: enrollment.id || `wp_enrollment_${user_id}_${enrollment.course_id}_${Date.now()}`,
            user_id: parseInt(user_id),
            course_id: enrollment.course_id,
            status: enrollment.status || 'enrolled',
            enrolled_at: enrollment.enrolled_at || new Date().toISOString(),
            progress: enrollment.progress || 0,
            source: 'tutor_lms'
          })),
          source: 'tutor_lms_api'
        });
      }

      // Method 2: Query WordPress posts table for enrollments
      const wpResponse = await fetch(buildUrl('/wp-json/wp/v2/posts'), {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (wpResponse.ok) {
        // Try to get user's enrolled courses from WordPress user meta
        const userResponse = await fetch(buildUrl(`/wp-json/wp/v2/users/${user_id}?context=edit`), {
          headers: getAuthHeaders(),
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const enrolledCourses = userData.meta?.tutor_enrolled_courses || [];
          
          return NextResponse.json({
            success: true,
            data: enrolledCourses.map((courseId: number, index: number) => ({
              id: `wp_meta_enrollment_${user_id}_${courseId}_${Date.now()}_${index}`,
              user_id: parseInt(user_id),
              course_id: courseId,
              status: 'enrolled',
              enrolled_at: new Date().toISOString(),
              progress: 0,
              source: 'wp_user_meta'
            })),
            source: 'wordpress_user_meta'
          });
        }
      }

      // Method 3: Direct database query simulation (we'll query specific enrollment posts)
      // In Tutor LMS, enrollments are stored as custom post types
      const enrollmentPostsResponse = await fetch(buildUrl('/wp-json/wp/v2/tutor_enrolled'), {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (enrollmentPostsResponse.ok) {
        const enrollmentPosts = await enrollmentPostsResponse.json();
        const userEnrollments = enrollmentPosts.filter((post: any) => 
          post.meta?.user_id == user_id || post.author == user_id
        );

        return NextResponse.json({
          success: true,
          data: userEnrollments.map((post: any) => ({
            id: `wp_post_enrollment_${post.id}`,
            user_id: parseInt(user_id),
            course_id: post.meta?.course_id || 0,
            status: post.status === 'publish' ? 'enrolled' : post.status,
            enrolled_at: post.date || new Date().toISOString(),
            progress: post.meta?.progress || 0,
            source: 'wp_enrollment_posts'
          })),
          source: 'wordpress_enrollment_posts'
        });
      }

    } catch (error) {
      console.error('Error syncing with WordPress:', error);
    }

    // Fallback: return empty enrollments
    return NextResponse.json({
      success: true,
      data: [],
      message: 'No enrollments found in WordPress',
      source: 'empty_fallback'
    });

  } catch (error) {
    console.error('Sync enrollments error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error syncing enrollments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
