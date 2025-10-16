import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, paymentStatus = 'paid' } = await request.json()
    
    console.log('🎓 TutorLMS Enrollment - Request:', { courseId, userId, paymentStatus })
    
    if (!courseId || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters',
          message: 'Course ID and User ID are required' 
        },
        { status: 400 }
      )
    }

    // Convert email to WordPress user ID if needed
    let wpUserId = userId
    if (typeof userId === 'string' && userId.includes('@')) {
      // Search for user by email
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}`
        }
      })
      
      if (userResponse.ok) {
        const users = await userResponse.json()
        if (users.length > 0) {
          wpUserId = users[0].id
          console.log('🔍 Found WordPress user ID:', wpUserId)
        } else {
          // Create user if not found
          const newUserResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}`
            },
            body: JSON.stringify({
              username: userId.split('@')[0],
              email: userId,
              password: Math.random().toString(36).slice(-8), // Random password
              roles: ['subscriber']
            })
          })
          
          if (newUserResponse.ok) {
            const newUser = await newUserResponse.json()
            wpUserId = newUser.id
            console.log('✅ Created new WordPress user:', wpUserId)
          } else {
            return NextResponse.json(
              { 
                success: false, 
                error: 'User not found and could not be created',
                message: 'Could not find or create WordPress user' 
              },
              { status: 400 }
            )
          }
        }
      }
    }

    // Try to enroll via TutorLMS REST API
    try {
      const enrollmentResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}`
        },
        body: JSON.stringify({
          course_id: parseInt(courseId),
          user_id: parseInt(wpUserId),
          status: paymentStatus === 'paid' ? 'completed' : 'pending'
        })
      })

      if (enrollmentResponse.ok) {
        const enrollment = await enrollmentResponse.json()
        console.log('✅ TutorLMS enrollment successful:', enrollment)
        
        return NextResponse.json({
          success: true,
          message: 'Successfully enrolled in course via TutorLMS',
          data: {
            enrollmentId: enrollment.id,
            courseId: parseInt(courseId),
            userId: parseInt(wpUserId),
            status: enrollment.status
          }
        })
      } else {
        const errorData = await enrollmentResponse.json()
        console.error('❌ TutorLMS enrollment failed:', errorData)
        
        // Fallback: Try to create enrollment via WordPress post
        return await createEnrollmentViaPost(courseId, wpUserId, paymentStatus)
      }
    } catch (error) {
      console.error('❌ TutorLMS API error:', error)
      // Fallback: Try to create enrollment via WordPress post
      return await createEnrollmentViaPost(courseId, wpUserId, paymentStatus)
    }

  } catch (error) {
    console.error('❌ TutorLMS Enrollment Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enroll user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function createEnrollmentViaPost(courseId: string, userId: string, paymentStatus: string) {
  try {
    console.log('🔄 Trying enrollment via WordPress post creation...')
    
    // Create a custom post for enrollment
    const enrollmentResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/tutor_enrolled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify({
        title: `Enrollment: User ${userId} in Course ${courseId}`,
        status: 'publish',
        meta: {
          course_id: parseInt(courseId),
          user_id: parseInt(userId),
          enrollment_date: new Date().toISOString(),
          payment_status: paymentStatus,
          enrollment_status: paymentStatus === 'paid' ? 'completed' : 'pending'
        }
      })
    })

    if (enrollmentResponse.ok) {
      const enrollment = await enrollmentResponse.json()
      console.log('✅ Enrollment created via WordPress post:', enrollment.id)
      
      // Also update user meta
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}`
        },
        body: JSON.stringify({
          meta: {
            [`tutor_enrolled_course_${courseId}`]: {
              enrolled: true,
              enrollment_date: new Date().toISOString(),
              payment_status: paymentStatus
            }
          }
        })
      })
      
      return NextResponse.json({
        success: true,
        message: 'Successfully enrolled via WordPress post',
        data: {
          enrollmentId: enrollment.id,
          courseId: parseInt(courseId),
          userId: parseInt(userId),
          status: paymentStatus === 'paid' ? 'completed' : 'pending'
        }
      })
    } else {
      const errorData = await enrollmentResponse.json()
      console.error('❌ WordPress post enrollment failed:', errorData)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Enrollment failed',
          message: 'Could not create enrollment via any method'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ WordPress post enrollment error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Enrollment failed',
        message: 'Could not create enrollment via WordPress post'
      },
      { status: 500 }
    )
  }
}

