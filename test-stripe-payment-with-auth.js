const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'https://helvetiforma.ch';
const TEST_ARTICLE_ID = 'f17c6e80-8969-42df-ad67-dbb61b856f41';
const TEST_EMAIL = 'damien.balet@me.com';
const TEST_PASSWORD = 'miende';

// Test card details (Stripe test card)
const TEST_CARD = {
  number: '4242424242424242',
  exp_month: '04',
  exp_year: '2025',
  cvc: '424',
  postal_code: '42424'
};

console.log('🧪 Starting Stripe Payment Test with Authentication...\n');

// Helper function to make HTTP requests with cookies
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': options.headers?.['Content-Type'] || 'application/json',
        'User-Agent': 'Stripe-Payment-Test/1.0',
        ...options.headers
      }
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data,
            cookies: res.headers['set-cookie'] || []
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            raw: data,
            cookies: res.headers['set-cookie'] || []
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Get CSRF token
async function getCSRFToken() {
  console.log('1️⃣ Getting CSRF token...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    console.log(`   Status: ${response.status}`);
    if (response.data.csrfToken) {
      console.log(`   ✅ CSRF Token: ${response.data.csrfToken.substring(0, 20)}...`);
      return response.data.csrfToken;
    } else {
      console.log('   ❌ No CSRF token received');
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Test 2: Attempt login
async function attemptLogin(csrfToken) {
  console.log('\n2️⃣ Attempting login...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `email=${encodeURIComponent(TEST_EMAIL)}&password=${encodeURIComponent(TEST_PASSWORD)}&redirect=false&csrfToken=${csrfToken}`
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    console.log(`   Cookies: ${response.cookies.length} received`);
    
    if (response.status === 200 || response.status === 302) {
      console.log('   ✅ Login attempt completed');
      return response.cookies;
    } else {
      console.log('   ❌ Login failed');
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Test 3: Check session after login
async function checkSessionAfterLogin(cookies) {
  console.log('\n3️⃣ Checking session after login...');
  try {
    const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    const response = await makeRequest(`${BASE_URL}/api/debug-session`, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Has Session: ${response.data.hasSession}`);
    console.log(`   User: ${response.data.user ? 'Connected' : 'Not connected'}`);
    
    if (response.data.user) {
      console.log(`   User ID: ${response.data.user.id}`);
      console.log(`   User Email: ${response.data.user.email}`);
    }
    
    return response.data.hasSession;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 4: Create payment intent with session
async function createPaymentIntentWithSession(cookies) {
  console.log('\n4️⃣ Creating payment intent with session...');
  try {
    const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    const response = await makeRequest(`${BASE_URL}/api/payment/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        postId: TEST_ARTICLE_ID
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 200 && response.data.clientSecret) {
      console.log('   ✅ Payment intent created successfully!');
      console.log(`   Client Secret: ${response.data.clientSecret.substring(0, 20)}...`);
      return response.data.clientSecret;
    } else {
      console.log('   ❌ Payment intent creation failed');
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Test 5: Test article details
async function getArticleDetails(cookies) {
  console.log('\n5️⃣ Getting article details...');
  try {
    const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    const response = await makeRequest(`${BASE_URL}/api/posts/${TEST_ARTICLE_ID}`, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log(`   Article Title: ${response.data.title || 'N/A'}`);
      console.log(`   Article Price: ${response.data.price || 'N/A'} CHF`);
      console.log(`   Access Level: ${response.data.accessLevel || 'N/A'}`);
      return response.data;
    } else {
      console.log('   ❌ Could not fetch article details');
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Main test function
async function runPaymentTestWithAuth() {
  console.log('🚀 Starting comprehensive Stripe payment test with authentication...\n');
  
  // Test 1: Get CSRF token
  const csrfToken = await getCSRFToken();
  if (!csrfToken) {
    console.log('❌ Cannot proceed without CSRF token');
    return;
  }
  
  // Test 2: Attempt login
  const cookies = await attemptLogin(csrfToken);
  if (!cookies || cookies.length === 0) {
    console.log('❌ Cannot proceed without login cookies');
    return;
  }
  
  // Test 3: Check session
  const hasSession = await checkSessionAfterLogin(cookies);
  if (!hasSession) {
    console.log('❌ User is not properly authenticated');
    return;
  }
  
  // Test 4: Get article details
  const articleDetails = await getArticleDetails(cookies);
  
  // Test 5: Create payment intent
  const clientSecret = await createPaymentIntentWithSession(cookies);
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   CSRF Token: ${csrfToken ? '✅' : '❌'}`);
  console.log(`   Login Cookies: ${cookies.length > 0 ? '✅' : '❌'}`);
  console.log(`   User Session: ${hasSession ? '✅' : '❌'}`);
  console.log(`   Article Details: ${articleDetails ? '✅' : '❌'}`);
  console.log(`   Payment Intent: ${clientSecret ? '✅' : '❌'}`);
  
  if (hasSession && clientSecret) {
    console.log('\n🎉 Payment test completed successfully!');
    console.log('   The payment flow is working correctly.');
    console.log('\n💳 Test Card Details:');
    console.log(`   Number: ${TEST_CARD.number}`);
    console.log(`   Expiry: ${TEST_CARD.exp_month}/${TEST_CARD.exp_year}`);
    console.log(`   CVC: ${TEST_CARD.cvc}`);
    console.log(`   Postal Code: ${TEST_CARD.postal_code}`);
    console.log('\n🔗 Next Steps:');
    console.log('   1. Use these test card details in the payment form');
    console.log('   2. The payment should be processed successfully');
    console.log('   3. Check Stripe dashboard for the test transaction');
  } else {
    console.log('\n⚠️  Payment test completed with issues:');
    console.log('   Please check the authentication flow');
  }
}

// Run the test
runPaymentTestWithAuth().catch(console.error);
