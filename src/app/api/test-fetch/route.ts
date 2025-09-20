import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing fetch from Vercel...');
    
    // Test 1: Simple fetch to a public API
    console.log('Test 1: Fetching httpbin.org...');
    const test1 = await fetch('https://httpbin.org/get', {
      signal: AbortSignal.timeout(10000),
    });
    console.log('Test 1 status:', test1.status);
    
    // Test 2: Fetch to your WordPress API without auth
    console.log('Test 2: Fetching WordPress API without auth...');
    const test2 = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?per_page=1', {
      signal: AbortSignal.timeout(10000),
    });
    console.log('Test 2 status:', test2.status);
    
    // Test 3: Fetch to WooCommerce API with auth
    console.log('Test 3: Fetching WooCommerce API with auth...');
    const auth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
    
    const test3 = await fetch('https://api.helvetiforma.ch/wp-json/wc/v3/products?per_page=1', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    console.log('Test 3 status:', test3.status);
    
    if (!test3.ok) {
      const errorText = await test3.text();
      console.log('Test 3 error:', errorText);
    } else {
      const data = await test3.json();
      console.log('Test 3 success, products count:', data.length);
    }
    
    return NextResponse.json({
      success: true,
      test1: test1.status,
      test2: test2.status,
      test3: test3.status,
      message: 'All tests completed'
    });
    
  } catch (error) {
    console.error('Test fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
