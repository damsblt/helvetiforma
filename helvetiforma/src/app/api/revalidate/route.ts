import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const secret = searchParams.get('secret');
    const tag = searchParams.get('tag');

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid secret',
          message: 'Secret invalide'
        },
        { status: 401 }
      );
    }

    if (!path && !tag) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Path or tag is required',
          message: 'Chemin ou tag requis'
        },
        { status: 400 }
      );
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation successful',
      revalidated: {
        path: path || null,
        tag: tag || null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Revalidation failed',
        message: 'Erreur lors de la revalidation'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing revalidation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const secret = searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid secret',
        message: 'Secret invalide'
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Revalidation endpoint is working',
    available_paths: [
      '/courses',
      '/courses/[id]',
      '/formations',
      '/formations/[id]',
      '/elearning',
      '/student-dashboard'
    ],
    usage: 'POST /api/revalidate?path=/courses&secret=your-secret'
  });
}
