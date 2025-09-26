import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables (don't expose the actual password)
    const envCheck = {
      WORDPRESS_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'Not set',
      WORDPRESS_APP_USER: process.env.WORDPRESS_APP_USER || 'Not set',
      WORDPRESS_APP_PASSWORD: process.env.WORDPRESS_APP_PASSWORD ? 'Set (****)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      hasEnvLocal: process.env.NODE_ENV ? 'Environment loaded' : 'Check .env.local'
    };

    return NextResponse.json({
      environment: envCheck,
      message: envCheck.WORDPRESS_APP_PASSWORD === 'Not set' 
        ? 'WORDPRESS_APP_PASSWORD is missing from .env.local' 
        : 'Environment variables are configured'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
