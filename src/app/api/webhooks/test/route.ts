import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('Webhook test received:', {
      timestamp: new Date().toISOString(),
      headers,
      body
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook test successful',
      received_at: new Date().toISOString(),
      data: {
        headers,
        body
      }
    });

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook test endpoint is active',
    timestamp: new Date().toISOString(),
    endpoints: {
      woocommerce: '/api/webhooks/woocommerce/order-completed',
      tutor: '/api/webhooks/tutor-course-created',
      test: '/api/webhooks/test'
    }
  });
}
