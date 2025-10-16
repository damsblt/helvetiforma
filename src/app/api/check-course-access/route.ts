import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'Course ID and User ID are required' },
        { status: 400 }
      );
    }

    console.log('🔍 [Access Check] Checking WordPress/TutorLMS enrollment for:', { courseId, userId });

    // Convert email to WordPress user ID if needed
    let actualUserId = userId;
    if (typeof userId === 'string' && userId.includes('@')) {
      try {
        // Try to search for user by email
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(userId)}`);
        const users = await userResponse.json();
        
        if (users && users.length > 0) {
          actualUserId = users[0].id.toString();
          console.log('✅ [Access Check] Converted email to user ID:', userId, '->', actualUserId);
        } else {
          console.log('⚠️ [Access Check] User not found:', userId);
          return NextResponse.json({
            hasAccess: false,
            courseId,
            userId,
            source: 'user_not_found'
          });
        }
      } catch (error) {
        console.error('❌ [Access Check] Error converting email to user ID:', error);
        return NextResponse.json({
          hasAccess: false,
          courseId,
          userId,
          source: 'email_lookup_error'
        });
      }
    }

    // PRIMARY CHECK: Query WordPress TutorLMS enrollment directly
    try {
      // Method 1: Check via TutorLMS Pro API enrollments endpoint
      console.log('🔍 [Access Check] Checking enrollment via /tutor/v1/enrollments...');
      const TUTOR_AUTH = Buffer.from(`${process.env.TUTOR_API_KEY}:${process.env.TUTOR_SECRET_KEY}`).toString('base64');
      
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/tutor/v1/enrollments?user_id=${actualUserId}&course_id=${courseId}`,
        {
          headers: {
            'Authorization': `Basic ${TUTOR_AUTH}`
          }
        }
      );
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log('📊 [Access Check] Enrollment check response:', checkData);
        
        // Check if user has any enrollments for this course
        if (checkData.data && Array.isArray(checkData.data) && checkData.data.length > 0) {
          const enrollment = checkData.data.find((enrollment: any) => 
            enrollment.course_id === courseId && 
            enrollment.student_id === actualUserId &&
            enrollment.status === 'completed'
          );
          
          if (enrollment) {
            console.log('✅ [Access Check] WordPress enrollment confirmed:', enrollment);
            return NextResponse.json({
              hasAccess: true,
              courseId,
              userId: actualUserId,
              source: 'wordpress_enrollment',
              enrollment: enrollment
            });
          }
        }
      } else {
        console.warn('⚠️ [Access Check] Enrollment endpoint returned:', checkResponse.status);
      }
      
      // Method 2: Check user roles as fallback
      console.log('🔍 [Access Check] Checking user roles as fallback...');
      const WP_AUTH = Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64');
      
      const userMetaResponse = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${actualUserId}`,
        {
          headers: {
            'Authorization': `Basic ${WP_AUTH}`
          }
        }
      );
      
      if (userMetaResponse.ok) {
        const userData = await userMetaResponse.json();
        console.log('📊 [Access Check] User roles:', userData.roles);
        
        // Check if user has tutor_student role (indicates some enrollment)
        // Note: This is a broad check and doesn't verify THIS specific course
        const roles = userData.roles || [];
        if (roles.includes('administrator')) {
          console.log('✅ [Access Check] User is administrator - granting access');
          return NextResponse.json({
            hasAccess: true,
            courseId,
            userId: actualUserId,
            source: 'wordpress_admin'
          });
        }
      } else {
        console.error('❌ [Access Check] Failed to fetch WordPress user data:', userMetaResponse.status);
      }
      
    } catch (error) {
      console.error('❌ [Access Check] WordPress enrollment check error:', error);
    }

    // No enrollment found
    console.log('❌ [Access Check] No enrollment found for user', actualUserId, 'in course', courseId);

    return NextResponse.json({
      hasAccess: false,
      courseId,
      userId: actualUserId,
      source: 'no_enrollment'
    });

  } catch (error: any) {
    console.error('❌ [Access Check] Error checking course access:', error);
    return NextResponse.json(
      { error: 'Failed to check course access', details: error.message },
      { status: 500 }
    );
  }
}
