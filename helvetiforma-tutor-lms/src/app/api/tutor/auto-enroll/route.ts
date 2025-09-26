import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl } from '@/lib/wordpress';

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id, order_id, payment_status } = await request.json();
    
    if (!user_id || !course_id) {
      return NextResponse.json(
        { success: false, message: 'user_id and course_id are required' },
        { status: 400 }
      );
    }

    console.log('Auto-enrolling user:', { user_id, course_id, order_id, payment_status });

    // Only auto-enroll if payment is successful or course is free
    if (payment_status && payment_status !== 'completed' && payment_status !== 'processing') {
      return NextResponse.json({
        success: false,
        message: 'Payment not completed, enrollment skipped',
        payment_status
      });
    }

    try {
      // Method 1: Use Tutor LMS enrollment API
      const tutorEnrollUrl = buildUrl('/wp-json/tutor/v1/enrollments');
      
      const enrollmentData = {
        user_id: parseInt(user_id),
        course_id: parseInt(course_id),
        enrollment_date: new Date().toISOString(),
        status: 'enrolled'
      };

      console.log('Enrolling via Tutor API:', enrollmentData);

      const tutorResponse = await fetch(tutorEnrollUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData)
      });

      if (tutorResponse.ok) {
        const enrollmentResult = await tutorResponse.json();
        console.log('Tutor enrollment success:', enrollmentResult);

        return NextResponse.json({
          success: true,
          message: 'Auto-enrollment successful via Tutor LMS API',
          enrollment: enrollmentResult,
          method: 'tutor_api'
        });
      }

      console.log('Tutor API failed, status:', tutorResponse.status);

      // Method 2: Create enrollment post directly
      const postData = {
        title: `Enrollment - User ${user_id} - Course ${course_id}`,
        status: 'publish',
        type: 'tutor_enrolled',
        author: parseInt(user_id),
        meta: {
          course_id: parseInt(course_id),
          user_id: parseInt(user_id),
          enrollment_date: new Date().toISOString(),
          status: 'enrolled',
          order_id: order_id || null
        }
      };

      console.log('Creating enrollment post:', postData);

      const postResponse = await fetch(buildUrl('/wp-json/wp/v2/posts'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (postResponse.ok) {
        const postResult = await postResponse.json();
        console.log('Post enrollment success:', postResult);

        return NextResponse.json({
          success: true,
          message: 'Auto-enrollment successful via WordPress posts',
          enrollment: postResult,
          method: 'wp_posts'
        });
      }

      // Method 3: Update user meta with enrolled courses
      const userMetaUrl = buildUrl(`/wp-json/wp/v2/users/${user_id}`);
      
      // First get current user data
      const userResponse = await fetch(userMetaUrl + '?context=edit', {
        headers: getAuthHeaders(),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Get current enrolled courses
        const currentEnrolled = userData.meta?._tutor_enrolled_courses || [];
        const enrolledCourses = Array.isArray(currentEnrolled) ? currentEnrolled : [currentEnrolled].filter(Boolean);
        
        // Add new course if not already enrolled
        if (!enrolledCourses.includes(parseInt(course_id))) {
          enrolledCourses.push(parseInt(course_id));
          
          const updateData = {
            meta: {
              _tutor_enrolled_courses: enrolledCourses,
              [`_enrollment_${course_id}_date`]: new Date().toISOString(),
              [`_enrollment_${course_id}_status`]: 'enrolled'
            }
          };

          console.log('Updating user meta:', updateData);

          const updateResponse = await fetch(userMetaUrl, {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
          });

          if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            console.log('User meta update success:', updateResult);

            return NextResponse.json({
              success: true,
              message: 'Auto-enrollment successful via user meta',
              enrollment: updateResult,
              method: 'user_meta'
            });
          }
        } else {
          return NextResponse.json({
            success: true,
            message: 'User already enrolled in this course',
            already_enrolled: true
          });
        }
      }

      // Method 4: Fallback to local enrollment system
      const localResponse = await fetch('/api/tutor/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(user_id),
          course_id: parseInt(course_id)
        })
      });

      if (localResponse.ok) {
        const localResult = await localResponse.json();
        console.log('Local enrollment success:', localResult);

        return NextResponse.json({
          success: true,
          message: 'Auto-enrollment successful via local system',
          enrollment: localResult,
          method: 'local_system'
        });
      }

    } catch (error) {
      console.error('Auto-enrollment error:', error);
    }

    return NextResponse.json({
      success: false,
      message: 'All auto-enrollment methods failed',
      attempted_methods: ['tutor_api', 'wp_posts', 'user_meta', 'local_system']
    }, { status: 500 });

  } catch (error) {
    console.error('Auto-enrollment API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing auto-enrollment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
