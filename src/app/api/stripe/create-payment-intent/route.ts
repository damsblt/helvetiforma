import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripe: Stripe;

try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });
  console.log('Stripe initialized successfully');
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  throw error;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'chf' } = await request.json();

    if (!amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing amount' 
      }, { status: 400 });
    }

    // Convert amount to cents (Stripe expects amount in the smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      // Use automatic_payment_methods for better UX - Stripe will show available methods
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Prefer embedded payment methods
      },
      metadata: {
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
