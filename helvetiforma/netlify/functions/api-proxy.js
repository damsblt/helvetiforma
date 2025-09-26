const { createProxyMiddleware } = require('http-proxy-middleware');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
      },
      body: '',
    };
  }

  // Extract the API path from the event
  const path = event.path.replace('/api/', '');
  
  // Proxy to your Next.js API routes
  const target = process.env.NEXT_PUBLIC_API_URL || 'https://api.informaniak.com';
  
  try {
    const response = await fetch(`${target}/api/${path}`, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': event.headers.authorization || '',
        ...event.headers,
      },
      body: event.httpMethod !== 'GET' ? event.body : undefined,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: data,
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
