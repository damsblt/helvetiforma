import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasWordPressUrl: !!process.env.NEXT_PUBLIC_WORDPRESS_URL,
    hasConsumerKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
    hasConsumerSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
    wordPressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL,
    consumerKeyLength: process.env.WOOCOMMERCE_CONSUMER_KEY?.length || 0,
    consumerSecretLength: process.env.WOOCOMMERCE_CONSUMER_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV
  });
}
