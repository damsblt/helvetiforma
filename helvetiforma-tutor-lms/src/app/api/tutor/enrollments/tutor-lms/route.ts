import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl } from '@/lib/wordpress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userEmail = searchParams.get('user_email');
    
    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, message: 'user_id or user_email parameter required' },
        { status: 400 }
      );
    }

    console.log('Fetching Tutor LMS enrollments for:', { userId, userEmail });

    // Tutor LMS stores enrollments in custom database tables
    // We'll use the REST API endpoints that Tutor LMS provides
    
    try {
      // Method 1: Use Tutor LMS REST API endpoints
      const tutorEnrollmentsUrl = buildUrl('/wp-json/tutor/v1/enrollments');
      
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (userEmail) params.append('user_email', userEmail);
      params.append('per_page', '100');
      
      const enrollmentsUrl = `${tutorEnrollmentsUrl}?${params.toString()}`;
      console.log('Querying Tutor LMS API:', enrollmentsUrl);

      const tutorResponse = await fetch(enrollmentsUrl, {
        headers: getAuthHeaders(),
      });

      console.log('Tutor API response status:', tutorResponse.status);

      if (tutorResponse.ok) {
        const tutorData = await tutorResponse.json();
        console.log('Tutor API raw data:', tutorData);
        
        // Map Tutor LMS data to our format
        const enrollments = Array.isArray(tutorData) ? tutorData : (tutorData.data || []);
        
        const mappedEnrollments = enrollments.map((enrollment: any) => ({
          id: enrollment.id || enrollment.enrollment_id,
          user_id: enrollment.user_id || parseInt(userId || '0'),
          course_id: enrollment.course_id,
          status: mapTutorStatus(enrollment.status),
          enrolled_at: enrollment.enrollment_date || enrollment.enrolled_at || new Date().toISOString(),
          completed_at: enrollment.completion_date || enrollment.completed_at,
          progress: enrollment.progress || 0,
          source: 'tutor_lms_api'
        }));

        return NextResponse.json({
          success: true,
          data: mappedEnrollments,
          source: 'tutor_lms_rest_api',
          debug: {
            url: enrollmentsUrl,
            raw_response: tutorData,
            mapped_count: mappedEnrollments.length
          }
        });
      }

      // Method 2: Query WordPress database directly for Tutor LMS tables
      // Tutor LMS typically uses wp_tutor_enrollments table
      const directQueryUrl = buildUrl('/wp-json/wp/v2/posts') + '?' + new URLSearchParams({
        post_type: 'tutor_enrolled',
        author: userId || '',
        meta_key: 'course_id',
        per_page: '100',
        status: 'any'
      });

      console.log('Trying direct query:', directQueryUrl);

      const directResponse = await fetch(directQueryUrl, {
        headers: getAuthHeaders(),
      });

      if (directResponse.ok) {
        const posts = await directResponse.json();
        console.log('Direct query posts:', posts);

        const enrollments = posts.map((post: any) => ({
          id: post.id,
          user_id: post.author || parseInt(userId || '0'),
          course_id: post.meta?.course_id || 0,
          status: mapWordPressStatus(post.status),
          enrolled_at: post.date,
          progress: post.meta?.progress || 0,
          source: 'wp_posts_tutor_enrolled'
        }));

        return NextResponse.json({
          success: true,
          data: enrollments,
          source: 'wordpress_posts_direct',
          debug: {
            query_url: directQueryUrl,
            posts_found: posts.length
          }
        });
      }

      // Method 3: Query user meta for enrolled courses
      if (userId) {
        const userMetaUrl = buildUrl(`/wp-json/wp/v2/users/${userId}`) + '?context=edit';
        console.log('Trying user meta query:', userMetaUrl);

        const userResponse = await fetch(userMetaUrl, {
          headers: getAuthHeaders(),
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User meta data:', userData.meta);

          // Check various meta fields that Tutor LMS might use
          const metaFields = [
            '_tutor_enrolled_courses',
            'tutor_enrolled_courses',
            '_enrolled_courses',
            'enrolled_courses'
          ];

          let enrollments: any[] = [];

          for (const field of metaFields) {
            const metaValue = userData.meta?.[field];
            if (metaValue) {
              console.log(`Found meta field ${field}:`, metaValue);
              
              const courses = Array.isArray(metaValue) ? metaValue : [metaValue];
              
              courses.forEach((courseData: any, index: number) => {
                let courseId = courseData;
                let status = 'enrolled';
                let enrolledAt = new Date().toISOString();
                
                // Handle different meta data structures
                if (typeof courseData === 'object') {
                  courseId = courseData.course_id || courseData.id;
                  status = mapTutorStatus(courseData.status) || 'enrolled';
                  enrolledAt = courseData.enrolled_at || courseData.date || enrolledAt;
                }
                
                if (courseId) {
                  enrollments.push({
                    id: `meta_${field}_${userId}_${courseId}_${index}`,
                    user_id: parseInt(userId),
                    course_id: parseInt(courseId),
                    status,
                    enrolled_at: enrolledAt,
                    progress: courseData.progress || 0,
                    source: `user_meta_${field}`
                  });
                }
              });
            }
          }

          if (enrollments.length > 0) {
            return NextResponse.json({
              success: true,
              data: enrollments,
              source: 'user_meta_fields',
              debug: {
                user_id: userId,
                meta_fields_found: metaFields.filter(field => userData.meta?.[field]),
                total_enrollments: enrollments.length
              }
            });
          }
        }
      }

      // Method 4: Search by email if provided
      if (userEmail) {
        const userByEmailUrl = buildUrl('/wp-json/wp/v2/users') + '?' + new URLSearchParams({
          search: userEmail,
          per_page: '1'
        });

        console.log('Searching user by email:', userByEmailUrl);

        const emailResponse = await fetch(userByEmailUrl, {
          headers: getAuthHeaders(),
        });

        if (emailResponse.ok) {
          const users = await emailResponse.json();
          if (users.length > 0) {
            const foundUser = users[0];
            console.log('Found user by email:', foundUser);
            
            // Recursive call with found user ID
            return await fetch(request.url.replace(/user_email=[^&]*/, `user_id=${foundUser.id}`), {
              method: 'GET',
              headers: request.headers
            }).then(res => res.json()).then(data => NextResponse.json(data));
          }
        }
      }

    } catch (error) {
      console.error('Error fetching Tutor LMS enrollments:', error);
    }

    // No enrollments found
    return NextResponse.json({
      success: true,
      data: [],
      message: 'No enrollments found in Tutor LMS',
      source: 'empty_result',
      debug: {
        user_id: userId,
        user_email: userEmail,
        attempted_methods: [
          'tutor_rest_api',
          'wp_posts_direct',
          'user_meta_fields',
          'user_email_search'
        ]
      }
    });

  } catch (error) {
    console.error('Tutor LMS enrollments API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching Tutor LMS enrollments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to map Tutor LMS status to our format
function mapTutorStatus(status: string): 'enrolled' | 'completed' | 'cancelled' {
  if (!status) return 'enrolled';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('complet') || statusLower.includes('finish') || statusLower === 'completed') {
    return 'completed';
  }
  
  if (statusLower.includes('cancel') || statusLower.includes('inactive')) {
    return 'cancelled';
  }
  
  return 'enrolled';
}

// Helper function to map WordPress post status to enrollment status
function mapWordPressStatus(status: string): 'enrolled' | 'completed' | 'cancelled' {
  switch (status) {
    case 'publish':
      return 'enrolled';
    case 'completed':
      return 'completed';
    case 'trash':
    case 'draft':
      return 'cancelled';
    default:
      return 'enrolled';
  }
}
