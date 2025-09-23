#!/usr/bin/env node

/**
 * Test script for enhanced enrollment logic
 * This script tests the payment-success route with enhanced enrollment
 */

const fetch = require('node-fetch');

const TEST_CONFIG = {
  // Use your local development server or production URL
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  // Test data
  testPaymentIntentId: 'pi_test_enhanced_enrollment_' + Date.now(),
  testCartData: {
    items: [
      {
        course_id: 24, // Default course ID from environment
        product_id: 24,
        name: 'Test Formation - Enhanced Enrollment',
        quantity: 1
      }
    ],
    total: '100.00'
  },
  testUserData: {
    firstName: 'Test',
    lastName: 'Enhanced',
    email: `test.enhanced.${Date.now()}@helvetiforma.ch`
  }
};

async function testEnhancedEnrollment() {
  console.log('🧪 Testing Enhanced Enrollment Logic');
  console.log('=====================================');
  
  try {
    console.log('📤 Sending test payment success request...');
    console.log('Test data:', {
      paymentIntentId: TEST_CONFIG.testPaymentIntentId,
      userEmail: TEST_CONFIG.testUserData.email,
      courseId: TEST_CONFIG.testCartData.items[0].course_id
    });

    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/payment-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId: TEST_CONFIG.testPaymentIntentId,
        cartData: TEST_CONFIG.testCartData,
        userData: TEST_CONFIG.testUserData
      })
    });

    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ Enhanced enrollment test PASSED');
      console.log('📊 Enrollment results:');
      
      if (result.data.enrollments) {
        result.data.enrollments.forEach((enrollment, index) => {
          console.log(`  ${index + 1}. Course ${enrollment.course_id} (${enrollment.product_name}): ${enrollment.success ? '✅ SUCCESS' : '❌ FAILED'}`);
          if (enrollment.strategy_used) {
            console.log(`     Strategy used: ${enrollment.strategy_used}`);
          }
          if (enrollment.error) {
            console.log(`     Error: ${enrollment.error}`);
          }
        });
      }
      
      console.log('🎯 Test Summary:');
      console.log(`  - User created: ${result.data.user_id ? '✅' : '❌'}`);
      console.log(`  - Email sent: ${result.data.email ? '✅' : '❌'}`);
      console.log(`  - Frontend revalidated: ${result.data.frontend_revalidated ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ Enhanced enrollment test FAILED');
      console.log('Error:', result.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testEnhancedEnrollment()
    .then(() => {
      console.log('\n🏁 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnhancedEnrollment };
