import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
    const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';
    
    const baseUrl = `${WORDPRESS_URL}/wp-json/wc/v3`;
    const auth = Buffer.from(
      `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
    
    console.log('Direct test - Environment variables:', {
      WORDPRESS_URL,
      hasConsumerKey: !!WOOCOMMERCE_CONSUMER_KEY,
      hasConsumerSecret: !!WOOCOMMERCE_CONSUMER_SECRET,
      baseUrl,
      authLength: auth.length
    });
    
    const url = `${baseUrl}/products?status=publish&per_page=5`;
    console.log('Direct test - Fetching URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Direct test - Response status:', response.status);
    console.log('Direct test - Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Direct test - Error response:', errorText);
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        url,
        status: response.status
      });
    }
    
    const data = await response.json();
    console.log('Direct test - Data length:', data.length);
    
    return NextResponse.json({
      success: true,
      data: data,
      count: data.length,
      url,
      status: response.status
    });
    
  } catch (error) {
    console.error('Direct test - Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
