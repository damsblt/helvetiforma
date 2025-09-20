import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const tag = searchParams.get('tag');

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
      console.log(`Test revalidation - Path: ${path}`);
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      console.log(`Test revalidation - Tag: ${tag}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Test revalidation successful',
      revalidated: {
        path: path || null,
        tag: tag || null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test revalidation failed',
        message: 'Erreur lors de la revalidation de test'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Test revalidation endpoint is working',
    usage: 'POST /api/test-revalidate?path=/courses or ?tag=courses'
  });
}
