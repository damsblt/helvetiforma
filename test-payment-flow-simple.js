const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'Payment',
  email: `test.payment.${Date.now()}@example.com`,
  phone: '+41791234567',
  company: 'Test Company SA',
  address: 'Teststrasse 123',
  city: 'Zürich',
  postalCode: '8001',
  country: 'CH'
};

async function testCompletePaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow (Simplified)...\n');
  console.log('=' .repeat(60));
  
  let testResults = {
    productFetch: false,
    paymentIntent: false,
    accountCreation: false,
    userExists: false
  };
  
  let productId, courseId, paymentIntentId, userId;

  try {
    // Step 1: Get available products
    console.log('📦 Step 1: Fetching available products...');
    const productsResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wc/v3/products`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      params: {
        per_page: 1,
        status: 'publish'
      }
    });

    if (productsResponse.data && productsResponse.data.length > 0) {
      const product = productsResponse.data[0];
      productId = product.id;
      courseId = product.meta_data?.find(meta => meta.key === 'course_id')?.value || product.id;
      
      console.log('✅ Found product:', {
        id: productId,
        name: product.name,
        price: product.price,
        courseId: courseId
      });
      testResults.productFetch = true;
    } else {
      throw new Error('No products found');
    }

    // Step 2: Create payment intent
    console.log('\n💳 Step 2: Creating payment intent...');
    const totalWithVAT = parseFloat(productsResponse.data[0].price) * 1.08;
    
    const paymentResponse = await axios.post(`${BASE_URL}/api/stripe/create-payment-intent`, {
      amount: totalWithVAT,
      currency: 'chf'
    });

    if (paymentResponse.data.success) {
      paymentIntentId = paymentResponse.data.paymentIntentId;
      console.log('✅ Payment intent created:', {
        paymentIntentId: paymentIntentId,
        amount: totalWithVAT,
        currency: 'chf'
      });
      testResults.paymentIntent = true;
    } else {
      throw new Error('Failed to create payment intent: ' + paymentResponse.data.error);
    }

    // Step 3: Simulate payment success and account creation
    console.log('\n✅ Step 3: Simulating payment success and account creation...');
    const enrollmentResponse = await axios.post(`${BASE_URL}/api/tutor-register`, {
      first_name: testUser.firstName,
      last_name: testUser.lastName,
      email: testUser.email,
      course_ids: [courseId]
    });

    if (enrollmentResponse.data.success) {
      userId = enrollmentResponse.data.user_id;
      console.log('✅ Account created and enrolled successfully:', {
        userId: userId,
        email: testUser.email,
        courseIds: [courseId]
      });
      testResults.accountCreation = true;
    } else {
      throw new Error('Account creation failed: ' + enrollmentResponse.data.error);
    }

    // Step 4: Verify user exists in WordPress
    console.log('\n👤 Step 4: Verifying user exists in WordPress...');
    const userResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      params: {
        email: testUser.email
      }
    });

    if (userResponse.data && userResponse.data.length > 0) {
      const user = userResponse.data[0];
      console.log('✅ User verified in WordPress:', {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      });
      testResults.userExists = true;
    } else {
      throw new Error('User not found in WordPress');
    }

    // Generate test report
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(60));
    
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    console.log('\n📋 Detailed Results:');
    console.log(`  ${testResults.productFetch ? '✅' : '❌'} Product Fetching`);
    console.log(`  ${testResults.paymentIntent ? '✅' : '❌'} Payment Intent Creation`);
    console.log(`  ${testResults.accountCreation ? '✅' : '❌'} Account Creation & Enrollment`);
    console.log(`  ${testResults.userExists ? '✅' : '❌'} User Verification`);
    
    console.log('\n📝 Test Data Used:');
    console.log(`  User: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
    console.log(`  Product ID: ${productId}`);
    console.log(`  Course ID: ${courseId}`);
    console.log(`  Payment Intent: ${paymentIntentId}`);
    console.log(`  WordPress User ID: ${userId}`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! The complete payment flow is working correctly.');
      console.log('\n✅ Summary of what works:');
      console.log('  • Products can be fetched from WooCommerce');
      console.log('  • Payment intents can be created with Stripe');
      console.log('  • User accounts are created in WordPress');
      console.log('  • Students are enrolled in courses via TutorLMS');
      console.log('  • Users can be verified in the system');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the error messages above.');
    }
    
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testCompletePaymentFlow();
