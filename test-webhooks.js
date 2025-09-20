#!/usr/bin/env node

/**
 * Webhook Testing Script
 * Tests all webhook endpoints to verify they're working
 */

const BASE_URL = 'http://localhost:3002';

async function testWebhook(endpoint, data, name) {
  console.log(`\n🧪 Testing ${name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name} - SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
    } else {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(result, null, 2)}`);
    }
    
    return { success: response.ok, status: response.status, data: result };
    
  } catch (error) {
    console.log(`❌ ${name} - ERROR`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Webhook Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const tests = [
    {
      endpoint: '/api/webhooks/test',
      data: { test: true, message: 'Webhook test data' },
      name: 'General Webhook Test'
    },
    {
      endpoint: '/api/webhooks/woocommerce/order-completed',
      data: {
        id: 123,
        status: 'completed',
        billing: {
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          phone: '+41 22 123 45 67'
        },
        line_items: [
          {
            product_id: 1,
            quantity: 1
          }
        ],
        total: '1200.00',
        currency: 'CHF'
      },
      name: 'WooCommerce Order Completed'
    },
    {
      endpoint: '/api/webhooks/tutor-course-created',
      data: {
        course_id: 24,
        action: 'created'
      },
      name: 'TutorLMS Course Created'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testWebhook(test.endpoint, test.data, test.name);
    results.push({ ...test, result });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  const successCount = results.filter(r => r.result.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 All webhooks are working correctly!');
  } else {
    console.log('\n⚠️  Some webhooks need attention. Check the errors above.');
  }
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testWebhook };
