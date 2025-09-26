import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl } from '@/lib/wordpress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'user_id parameter required' },
        { status: 400 }
      );
    }

    console.log('Fetching WordPress enrollments for user:', userId);

    // Get real enrollments from WordPress database via REST API
    // In Tutor LMS, enrollments are typically stored in wp_posts with post_type 'tutor_enrolled'
    
    try {
      // Method 1: Query enrollment posts directly
      const enrollmentQuery = buildUrl('/wp-json/wp/v2/tutor_enrolled') + '?' + new URLSearchParams({
        author: userId,
        status: 'any',
        per_page: '100',
        _fields: 'id,date,status,meta,title'
      });

      console.log('Querying enrollments:', enrollmentQuery);

      const enrollmentResponse = await fetch(enrollmentQuery, {
        headers: getAuthHeaders(),
      });

      if (enrollmentResponse.ok) {
        const enrollments = await enrollmentResponse.json();
        console.log('Found enrollments:', enrollments);
        
        const mappedEnrollments = enrollments.map((enrollment: any) => ({
          id: enrollment.id,
          user_id: parseInt(userId),
          course_id: enrollment.meta?.course_id || 0,
          status: enrollment.status === 'publish' ? 'enrolled' : enrollment.status,
          enrolled_at: enrollment.date,
          progress: enrollment.meta?.progress || 0,
          source: 'wordpress_posts'
        }));

        return NextResponse.json({
          success: true,
          data: mappedEnrollments,
          source: 'wordpress_tutor_enrolled_posts',
          debug: {
            query: enrollmentQuery,
            raw_count: enrollments.length
          }
        });
      }

      // Method 2: Try alternative approach - get user meta
      const userQuery = buildUrl(`/wp-json/wp/v2/users/${userId}`) + '?context=edit';
      console.log('Querying user meta:', userQuery);

      const userResponse = await fetch(userQuery, {
        headers: getAuthHeaders(),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data received:', userData);

        // Look for enrollment-related meta fields
        const enrollmentMeta = [];
        
        if (userData.meta) {
          // Common Tutor LMS meta fields for enrollments
          const possibleEnrollmentFields = [
            'tutor_enrolled_courses',
            '_tutor_enrolled_courses',
            'enrolled_courses',
            '_enrolled_courses'
          ];

          for (const field of possibleEnrollmentFields) {
            if (userData.meta[field]) {
              console.log(`Found enrollment meta field ${field}:`, userData.meta[field]);
              
              const courses = Array.isArray(userData.meta[field]) ? userData.meta[field] : [userData.meta[field]];
              
              courses.forEach((courseId: any, index: number) => {
                if (courseId) {
                  enrollmentMeta.push({
                    id: `meta_enrollment_${userId}_${courseId}_${index}`,
                    user_id: parseInt(userId),
                    course_id: parseInt(courseId),
                    status: 'enrolled',
                    enrolled_at: new Date().toISOString(),
                    progress: 0,
                    source: `user_meta_${field}`
                  });
                }
              });
            }
          }
        }

        if (enrollmentMeta.length > 0) {
          return NextResponse.json({
            success: true,
            data: enrollmentMeta,
            source: 'wordpress_user_meta',
            debug: {
              user_id: userId,
              meta_fields_checked: Object.keys(userData.meta || {}),
              enrollments_found: enrollmentMeta.length
            }
          });
        }
      }

      // Method 3: Try direct database query approach (if we have access to custom endpoints)
      const customQuery = buildUrl('/wp-json/tutor/v1/enrollments') + '?' + new URLSearchParams({
        user_id: userId
      });

      console.log('Trying custom Tutor endpoint:', customQuery);

      const customResponse = await fetch(customQuery, {
        headers: getAuthHeaders(),
      });

      if (customResponse.ok) {
        const customEnrollments = await customResponse.json();
        console.log('Custom endpoint data:', customEnrollments);

        return NextResponse.json({
          success: true,
          data: customEnrollments,
          source: 'tutor_custom_endpoint'
        });
      }

    } catch (error) {
      console.error('Error fetching WordPress enrollments:', error);
    }

    // If no enrollments found, return empty array with debug info
    return NextResponse.json({
      success: true,
      data: [],
      message: 'No enrollments found in WordPress',
      source: 'empty_result',
      debug: {
        user_id: userId,
        attempted_methods: [
          'tutor_enrolled_posts',
          'user_meta',
          'custom_tutor_endpoint'
        ]
      }
    });

  } catch (error) {
    console.error('WordPress enrollments API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching WordPress enrollments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
