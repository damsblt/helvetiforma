import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_id } = body;

    console.log('Test webhook revalidation received:', { course_id });

    // Test revalidation by calling our test endpoint
    try {
      // Revalidate by paths
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma-bxjlara9i-damsblts-projects.vercel.app'}/api/test-revalidate?path=/courses`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma-bxjlara9i-damsblts-projects.vercel.app'}/api/test-revalidate?path=/courses/${course_id}`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma-bxjlara9i-damsblts-projects.vercel.app'}/api/test-revalidate?path=/formations`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma-bxjlara9i-damsblts-projects.vercel.app'}/api/test-revalidate?path=/elearning`, {
        method: 'POST'
      });
      
      // Revalidate by tags
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma-bxjlara9i-damsblts-projects.vercel.app'}/api/test-revalidate?tag=courses`, {
        method: 'POST'
      });
      
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma-bxjlara9i-damsblts-projects.vercel.app'}/api/test-revalidate?tag=woocommerce-products`, {
        method: 'POST'
      });
      
      console.log('Test frontend revalidation triggered for course:', course_id);
    } catch (revalidationError) {
      console.error('Error triggering test frontend revalidation:', revalidationError);
      // Don't fail the webhook if revalidation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Test webhook revalidation successful',
      course_id: course_id,
      frontend_revalidated: true
    });

  } catch (error) {
    console.error('Test webhook revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test webhook revalidation failed',
        message: 'Erreur lors du test de revalidation webhook'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('course_id') || '24';

  // Simulate webhook call
  const mockBody = {
    course_id: parseInt(courseId),
    action: 'course_updated'
  };

  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockBody)
  });

  return POST(mockRequest as NextRequest);
}
