import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch').trim();
const WOOCOMMERCE_CONSUMER_KEY = (process.env.WOOCOMMERCE_CONSUMER_KEY || '').trim();
const WOOCOMMERCE_CONSUMER_SECRET = (process.env.WOOCOMMERCE_CONSUMER_SECRET || '').trim();
const wooAuth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, cart, user_id } = await request.json();
    if (!email || !cart?.items || !cart?.total) {
      return NextResponse.json({ success: false, error: 'Missing email or cart' }, { status: 400 });
    }

    // Find-or-create Woo customer by email, optionally link to wp user
    let customerId: number | undefined;
    const lookup = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Basic ${wooAuth}` }
    });
    if (lookup.ok) {
      const arr = await lookup.json();
      if (Array.isArray(arr) && arr.length > 0) {
        customerId = arr[0].id;
      }
    }
    if (!customerId) {
      const create = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${wooAuth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName, user_id })
      });
      if (!create.ok) {
        const e = await create.json().catch(() => ({}));
        // If email exists, re-lookup and reuse instead of failing
        if (e?.code === 'registration-error-email-exists') {
          const relook = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`, {
            headers: { 'Authorization': `Basic ${wooAuth}` }
          });
          if (relook.ok) {
            const arr = await relook.json();
            if (Array.isArray(arr) && arr.length > 0) {
              customerId = arr[0].id;
            }
          }
        }
        if (!customerId) {
          return NextResponse.json({ success: false, error: 'Woo customer create failed', details: e }, { status: create.status });
        }
      } else {
        const c = await create.json();
        customerId = c.id;
      }
    }

    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: customerId,
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

    return NextResponse.json({ success: true, order: orderBody, customer_id: customerId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Woo endpoint error', details: String(error) }, { status: 500 });
  }
}


