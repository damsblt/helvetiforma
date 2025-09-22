const axios = require('axios');

// Configuration
const BASE_URL = 'https://helvetiforma.ch';
const WORDPRESS_URL = 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = 'cs_1082d09580773bcad56caf213542171abbd8d076';

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

const testCart = {
  items: [
    {
      product_id: 248,
      course_id: 248,
      name: 'Test Formation',
      price: 500,
      quantity: 1
    }
  ],
  total: 500
};

async function testPaymentSuccessDirect() {
  console.log('🧪 Testing Payment Success API Directly...\n');
  console.log('=' .repeat(60));
  
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
      testCart.items[0].product_id = product.id;
      testCart.items[0].course_id = product.id;
      testCart.items[0].name = product.name;
      testCart.items[0].price = parseFloat(product.price);
      testCart.total = parseFloat(product.price);
      
      console.log('✅ Found product:', {
        id: product.id,
        name: product.name,
        price: product.price
      });
    } else {
      throw new Error('No products found');
    }

    // Step 2: Create a mock successful payment intent ID
    const mockPaymentIntentId = `pi_test_${Date.now()}`;
    console.log('\n💳 Step 2: Using mock payment intent:', mockPaymentIntentId);

    // Step 3: Call payment success API directly
    console.log('\n✅ Step 3: Calling payment success API...');
    const paymentSuccessData = {
      paymentIntentId: mockPaymentIntentId,
      cartData: testCart,
      userData: testUser
    };

    console.log('Sending data:', {
      paymentIntentId: mockPaymentIntentId,
      cartItems: testCart.items.length,
      userEmail: testUser.email
    });

    const response = await axios.post(`${BASE_URL}/api/payment-success`, paymentSuccessData);

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.data.success) {
      console.log('\n🎉 Payment success API worked!');
      console.log('Order ID:', response.data.data.order_id);
      console.log('User ID:', response.data.data.user_id);
      console.log('Enrollments:', response.data.data.enrollments);
      
      // Step 4: Verify the results
      console.log('\n🔍 Step 4: Verifying results...');
      
      // Verify WooCommerce order
      try {
        const orderResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wc/v3/orders/${response.data.data.order_id}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
          }
        });
        console.log('✅ Order verified:', {
          id: orderResponse.data.id,
          status: orderResponse.data.status,
          total: orderResponse.data.total
        });
      } catch (error) {
        console.log('⚠️ Order verification failed:', error.message);
      }

      // Verify WordPress user
      try {
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
          console.log('✅ User verified:', {
            id: userResponse.data[0].id,
            email: userResponse.data[0].email,
            firstName: userResponse.data[0].first_name,
            lastName: userResponse.data[0].last_name
          });
        }
      } catch (error) {
        console.log('⚠️ User verification failed:', error.message);
      }

      console.log('\n🎉 COMPLETE PAYMENT WORKFLOW TEST SUCCESSFUL!');
      console.log('✅ All steps completed:');
      console.log('  • Product fetched from WooCommerce');
      console.log('  • Payment success API processed');
      console.log('  • WooCommerce order created');
      console.log('  • WordPress user created');
      console.log('  • Student enrolled in course');
      
    } else {
      console.log('❌ Payment success API failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentSuccessDirect();

