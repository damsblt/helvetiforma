import { NextRequest, NextResponse } from 'next/server';
import { addEnrollment } from '@/lib/enrollment-tracker';
import { getTutorUserEnrollments } from '@/lib/tutor-lms'
import { checkForExistingCourseOrder, logOrderCreationAttempt } from '@/lib/woocommerce-duplicate-prevention'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID'
        },
        { status: 400 }
      )
    }

    const enrollments = await getTutorUserEnrollments(userId)

    // If courseId is provided, check specific course enrollment
    if (courseId) {
      const isEnrolled = enrollments.some(
        enrollment => enrollment.course_id.toString() === courseId.toString()
      )
      
      return NextResponse.json({
        success: true,
        data: { isEnrolled, enrollments: enrollments.filter(e => e.course_id.toString() === courseId.toString()) }
      })
    }

    return NextResponse.json({
      success: true,
      data: enrollments
    })
  } catch (error) {
    console.error('API Error - Tutor LMS enrollments:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enrollments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, userId, amount, paymentMethod, paymentIntentId } = body

    console.log('🎓 Course Enrollment - Request:', { courseId, userId, amount, paymentMethod, paymentIntentId })

    if (!courseId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course ID and User ID are required',
          message: 'Please provide valid course and user IDs'
        },
        { status: 400 }
      )
    }

    // Convert email to WordPress user ID if needed
    let actualUserId = userId
    if (typeof userId === 'string' && userId.includes('@')) {
      try {
        // For now, map the email to the existing user ID 1 (damien)
        // In production, you would have a proper user management system
        if (userId === 'damien_balet@outlook.com') {
          actualUserId = 1
          console.log('✅ Mapped email to existing user ID:', userId, '->', actualUserId)
        } else {
          // Try to search for user by email
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(userId)}`)
          const users = await userResponse.json()
          
          if (users && users.length > 0) {
            actualUserId = users[0].id
            console.log('✅ Converted email to user ID:', userId, '->', actualUserId)
          } else {
            // If user doesn't exist, create a new user
            console.log('⚠️ User not found, creating new user for:', userId)
            const newUserResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`).toString('base64')}`
              },
              body: JSON.stringify({
                username: userId.split('@')[0],
                email: userId,
                password: 'temp_password_123',
                first_name: userId.split('@')[0],
                last_name: ''
              })
            })
            
            if (newUserResponse.ok) {
              const newUser = await newUserResponse.json()
              actualUserId = newUser.id
              console.log('✅ Created new user with ID:', actualUserId)
            } else {
              console.error('❌ Failed to create user:', await newUserResponse.text())
              return NextResponse.json(
                {
                  success: false,
                  error: 'User not found and could not be created',
                  message: 'Please ensure the user exists in WordPress'
                },
                { status: 400 }
              )
            }
          }
        }
      } catch (error) {
        console.error('❌ Error converting email to user ID:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to resolve user ID',
            message: 'Could not find or create user'
          },
          { status: 500 }
        )
      }
    }

    // For paid courses, verify payment first
    if (amount && amount > 0 && paymentIntentId) {
      try {
        // Skip payment verification for test payments
        if (paymentIntentId.startsWith('test_') || paymentIntentId === 'test_payment_123') {
          console.log('🔍 Skipping payment verification for test payment');
        } else {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!)
          
          // Check if it's a checkout session ID or payment intent ID
          let paymentStatus = 'succeeded'
          if (paymentIntentId.startsWith('cs_')) {
            // It's a checkout session ID
            const session = await stripe.checkout.sessions.retrieve(paymentIntentId)
            paymentStatus = session.payment_status
            console.log('🔍 Checkout session status:', paymentStatus)
          } else {
            // It's a payment intent ID
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
            paymentStatus = paymentIntent.status
            console.log('🔍 Payment intent status:', paymentStatus)
          }
          
          if (paymentStatus !== 'succeeded' && paymentStatus !== 'paid') {
            return NextResponse.json(
              {
                success: false,
                error: 'Payment not completed',
                message: 'Payment must be completed before enrollment'
              },
              { status: 400 }
            )
          }
        }
      } catch (error) {
        console.error('Payment verification failed:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Payment verification failed',
            message: 'Could not verify payment status'
          },
          { status: 500 }
        )
      }
    }

    // ALWAYS create WooCommerce order for proper tracking and to trigger enrollment hooks
    // This is required per TutorLMS best practices
    try {
          console.log('📦 Creating WooCommerce order with course product...');
          
          // Get course title to search for the matching WooCommerce product
          const courseResponse = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/courses/${courseId}`,
            {
              headers: {
                'Authorization': `Basic ${Buffer.from(
                  `${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`
                ).toString('base64')}`
              }
            }
          );
          
          let productId = null;
          let courseTitle = 'Course';
          
          if (courseResponse.ok) {
            const course = await courseResponse.json();
            courseTitle = course.title?.rendered || course.title || 'Course';
            console.log('🔍 Course title:', courseTitle);
            
            // Clean the course title for better matching
            const cleanTitle = courseTitle
              .replace(/&#8211;/g, '–')
              .replace(/&#8217;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'");
            console.log('🔍 Cleaned course title:', cleanTitle);
            
            // Search for WooCommerce product by course title
            const productsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products?search=${encodeURIComponent(cleanTitle)}&per_page=1`,
              {
                headers: {
                  'Authorization': `Basic ${Buffer.from(
                    `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
                  ).toString('base64')}`
                }
              }
            );
            
            if (productsResponse.ok) {
              const products = await productsResponse.json();
              console.log('🔍 Found products:', products.length);
              
              if (products && products.length > 0) {
                productId = products[0].id;
                console.log('✅ Found product ID by title search:', productId, products[0].name);
                
                // Ensure the product is marked as virtual (required for TutorLMS auto-enrollment)
                if (!products[0].virtual) {
                  console.log('⚠️ Product is not virtual, updating to virtual...');
                  try {
                    await fetch(
                      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/${productId}`,
                      {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Basic ${Buffer.from(
                            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
                          ).toString('base64')}`
                        },
                        body: JSON.stringify({ virtual: true })
                      }
                    );
                    console.log('✅ Product updated to virtual');
                  } catch (updateError) {
                    console.error('❌ Failed to update product to virtual:', updateError);
                  }
                }
              }
            } else {
              console.error('❌ Failed to search products:', productsResponse.status);
            }
          }
          
          if (!productId) {
            console.log('🔍 No product found via title search, checking course meta...');
          }
          
          if (!productId) {
            console.warn('⚠️ No WooCommerce product linked to this course');
            // Continue with enrollment anyway
          } else {
            // Check for existing order to prevent duplicates
            const existingOrder = await checkForExistingCourseOrder(
              parseInt(actualUserId),
              courseId.toString(),
              parseInt(productId),
              paymentIntentId
            );
            
            logOrderCreationAttempt('course', {
              customerId: parseInt(actualUserId),
              productId: parseInt(productId),
              courseId: courseId.toString(),
              paymentIntentId
            }, existingOrder);
            
            if (existingOrder) {
              console.log(`⚠️  Skipping order creation - duplicate order ${existingOrder.id} already exists`);
            } else {
              // Create WooCommerce order with the course product as a line item
            const orderData = {
              customer_id: parseInt(actualUserId),
              payment_method: paymentMethod || 'stripe',
              payment_method_title: 'Stripe',
              set_paid: true,
              status: 'completed',
              billing: {
                first_name: 'Course',
                last_name: 'Purchase',
                email: typeof userId === 'string' && userId.includes('@') ? userId : 'user@example.com',
                country: 'CH'
              },
              line_items: [
                {
                  product_id: parseInt(productId),
                  quantity: 1
                }
              ],
              meta_data: [
                { key: '_course_id', value: courseId.toString() },
                { key: '_payment_intent_id', value: paymentIntentId || '' },
                { key: '_course_purchase', value: 'true' }
              ]
            };

            console.log('📦 Creating order with data:', JSON.stringify(orderData, null, 2));

            const orderResponse = await fetch(
              `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${Buffer.from(
                    `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
                  ).toString('base64')}`
                },
                body: JSON.stringify(orderData)
              }
            );
            
            if (orderResponse.ok) {
              const order = await orderResponse.json();
              console.log('✅ WooCommerce order created:', order.id, 'Total:', order.total);
              console.log('📊 Order details:', JSON.stringify(order, null, 2));
              
              // The WordPress hooks should now automatically enroll the user
              // Wait a moment for the hooks to process
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              const errorText = await orderResponse.text();
              console.error('❌ WooCommerce order creation failed:', orderResponse.status, errorText);
              console.error('📦 Order data that failed:', JSON.stringify(orderData, null, 2));
            }
            }
          }
    } catch (error) {
      console.error('❌ Error creating WooCommerce order:', error);
      // Don't fail enrollment if WooCommerce recording fails
    }

    // Now create the TutorLMS enrollment using the official Pro API
    let enrollmentSuccess = false;
    let enrollmentId = null;
    
    try {
      console.log('🎓 Creating TutorLMS enrollment via official API...');
      
      // Step 1: Create enrollment
      const TUTOR_AUTH = Buffer.from(
        `${process.env.TUTOR_API_KEY}:${process.env.TUTOR_SECRET_KEY}`
      ).toString('base64');
      
      const enrollResponse = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/tutor/v1/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${TUTOR_AUTH}`
          },
          body: JSON.stringify({
            user_id: parseInt(actualUserId),
            course_id: parseInt(courseId)
          })
        }
      );
      
      if (enrollResponse.ok) {
        const enrollData = await enrollResponse.json();
        console.log('✅ TutorLMS enrollment created:', JSON.stringify(enrollData, null, 2));
        
        // Extract enrollment ID from response
        // According to TutorLMS Pro API docs, the response structure is:
        // { "code": "tutor_create_enrollment", "message": "...", "data": { "enrollment_id": 123 } }
        if (enrollData.data && enrollData.data.enrollment_id) {
          enrollmentId = enrollData.data.enrollment_id;
        } else if (enrollData.enrollment_id) {
          enrollmentId = enrollData.enrollment_id;
        } else if (enrollData.id) {
          enrollmentId = enrollData.id;
        } else if (enrollData.data && enrollData.data.id) {
          enrollmentId = enrollData.data.id;
        }
        
        console.log('📋 Extracted enrollment ID:', enrollmentId);
        
        // Step 2: Mark enrollment as completed (auto-approve)
        if (enrollmentId) {
          console.log('🎯 Marking enrollment as completed:', enrollmentId);
          
          const completeResponse = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/tutor/v1/enrollments/completed`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${TUTOR_AUTH}`
              },
              body: JSON.stringify({
                enrollment_id: enrollmentId,
                status: 'completed'
              })
            }
          );
          
          console.log('📡 Complete enrollment response status:', completeResponse.status);
          
          if (completeResponse.ok) {
            const completeData = await completeResponse.json();
            console.log('✅ Enrollment marked as completed:', JSON.stringify(completeData, null, 2));
            enrollmentSuccess = true;
          } else {
            const errorText = await completeResponse.text();
            console.error('❌ Failed to mark enrollment as completed:', completeResponse.status, errorText);
            // Still consider it success if enrollment was created
            enrollmentSuccess = true;
          }
        } else {
          console.warn('⚠️ No enrollment ID found in response. Full response:', JSON.stringify(enrollData, null, 2));
          enrollmentSuccess = true;
        }
      } else {
        const errorText = await enrollResponse.text();
        console.error('❌ TutorLMS enrollment failed:', enrollResponse.status, errorText);
        
        // Fallback: Store local enrollment
        addEnrollment({
          user_id: actualUserId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          status: 'enrolled',
          payment_status: amount && amount > 0 ? 'paid' : 'free'
        });
        console.log('✅ Local enrollment stored as fallback');
      }
    } catch (error) {
      console.error('❌ Error creating TutorLMS enrollment:', error);
      
      // Fallback: Store local enrollment
      addEnrollment({
        user_id: actualUserId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        status: 'enrolled',
        payment_status: amount && amount > 0 ? 'paid' : 'free'
      });
      console.log('✅ Local enrollment stored as fallback');
    }
    
    const success = enrollmentSuccess;

    if (success) {
      console.log('✅ Course enrollment successful:', { courseId, actualUserId })
      
      return NextResponse.json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { 
          courseId, 
          userId: actualUserId, 
          enrolledAt: new Date().toISOString(),
          paymentIntentId: paymentIntentId || null
        }
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Enrollment failed',
          message: 'Could not enroll user in course'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Course Enrollment Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enroll in course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
