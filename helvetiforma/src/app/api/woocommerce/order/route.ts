import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').trim();
const WOOCOMMERCE_CONSUMER_KEY = (process.env.WOOCOMMERCE_CONSUMER_KEY || '').trim();
const WOOCOMMERCE_CONSUMER_SECRET = (process.env.WOOCOMMERCE_CONSUMER_SECRET || '').trim();
const wooAuth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, cart } = await request.json();
    if (!email || !cart?.items || !cart?.total) {
      return NextResponse.json({ success: false, error: 'Missing email or cart' }, { status: 400 });
    }

    // Create a guest order (no customer_id linkage)
    const orderData: any = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      total: String(cart.total),
      currency: cart.currency || 'CHF',
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
      line_items: cart.items.map((item: any) => ({
        product_id: item.course_id || item.product_id,
        quantity: item.quantity || 1,
        name: item.name || `Formation ${item.course_id || item.product_id}`,
        price: String(item.price || item.total || 0),
        total: String((item.price || item.total || 0) * (item.quantity || 1))
      })),
    };

    const orderRes = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${wooAuth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const orderBody = await orderRes.json().catch(() => undefined);
    if (!orderRes.ok) {
      return NextResponse.json({ success: false, error: 'Woo order create failed', details: orderBody }, { status: orderRes.status });
    }

    return NextResponse.json({ success: true, order: orderBody });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Woo endpoint error', details: String(error) }, { status: 500 });
  }
}


