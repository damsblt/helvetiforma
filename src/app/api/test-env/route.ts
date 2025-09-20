import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const revalidateSecret = process.env.REVALIDATE_SECRET;
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      data: {
        revalidateSecret: revalidateSecret ? 'Set (length: ' + revalidateSecret.length + ')' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
        wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
