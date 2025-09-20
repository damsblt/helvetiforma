'use client';

import { useState } from 'react';

export default function WebhookManagementPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testWebhook = async (webhookType: string) => {
    setIsLoading(true);
    setTestResults(null);

    try {
      let testData;
      let endpoint;

      if (webhookType === 'woocommerce') {
        endpoint = '/api/webhooks/woocommerce/order-completed';
        testData = {
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
        };
      } else if (webhookType === 'tutor') {
        endpoint = '/api/webhooks/tutor-course-created';
        testData = {
          course_id: 24,
          action: 'created'
        };
      } else {
        endpoint = '/api/webhooks/test';
        testData = {
          test: true,
          message: 'Webhook test data'
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      setTestResults({
        webhookType,
        status: response.status,
        success: response.ok,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      setTestResults({
        webhookType,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAllWebhooks = async () => {
    setIsLoading(true);
    setTestResults(null);

    const results = [];
    
    // Test all webhooks
    const webhooks = ['test', 'woocommerce', 'tutor'];
    
    for (const webhook of webhooks) {
      try {
        await testWebhook(webhook);
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error testing ${webhook}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Webhook Management</h1>
          <p className="mt-2 text-gray-600">Test and manage webhooks between WooCommerce and TutorLMS</p>
        </div>

        {/* Webhook Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Webhook Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">WooCommerce</h3>
              <p className="text-sm text-gray-600">Order completion webhook</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Needs Configuration
                </span>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">TutorLMS</h3>
              <p className="text-sm text-gray-600">Course creation webhook</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">Test Endpoint</h3>
              <p className="text-sm text-gray-600">General webhook testing</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Webhooks</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => testWebhook('test')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test General Webhook
            </button>
            <button
              onClick={() => testWebhook('woocommerce')}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test WooCommerce Webhook
            </button>
            <button
              onClick={() => testWebhook('tutor')}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test TutorLMS Webhook
            </button>
            <button
              onClick={testAllWebhooks}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Test All Webhooks
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Testing webhooks...</span>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${
              testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  testResults.success ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  testResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResults.webhookType} Webhook - {testResults.success ? 'Success' : 'Failed'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {testResults.timestamp}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Response Details</h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Setup Instructions</h2>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium">1. WooCommerce Webhook Setup</h3>
              <p>Go to WordPress Admin → WooCommerce → Settings → Advanced → Webhooks</p>
              <p>Create webhook with URL: <code className="bg-blue-100 px-1 rounded">https://your-domain.com/api/webhooks/woocommerce/order-completed</code></p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Local Development</h3>
              <p>Use ngrok to expose your local server:</p>
              <p><code className="bg-blue-100 px-1 rounded">ngrok http 3002</code></p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Test the Integration</h3>
              <p>Use the test buttons above to verify webhook functionality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
