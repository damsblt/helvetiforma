import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    // Validate that the URL is from our WordPress instance
    if (!imageUrl.includes('api.helvetiforma.ch')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }
    
    console.log('🖼️ Proxying image:', imageUrl);
    
    // Try to fetch the image with WordPress authentication
    const auth = Buffer.from(`${process.env.WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64');
    
    let response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'HelvetiForma-Proxy/1.0'
      }
    });
    
    // If authenticated request fails, try without authentication
    if (!response.ok) {
      console.log('⚠️ Authenticated request failed, trying without auth:', response.status);
      response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'HelvetiForma-Proxy/1.0'
        }
      });
    }
    
    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Failed to fetch image', 
        status: response.status,
        statusText: response.statusText,
        url: imageUrl
      }, { status: response.status });
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('✅ Image proxied successfully:', contentType, imageBuffer.byteLength, 'bytes');
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('❌ Error proxying image:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
