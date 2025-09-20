import { NextRequest, NextResponse } from 'next/server';
import { productSyncService } from '@/services/productSyncService';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'sync-all':
        console.log('Starting full product synchronization...');
        const syncResult = await productSyncService.syncAllCoursesToProducts();
        
        return NextResponse.json({
          success: true,
          message: 'Product synchronization completed',
          results: syncResult
        });

      case 'validate':
        console.log('Validating product synchronization...');
        const validationResult = await productSyncService.validateSync();
        
        return NextResponse.json({
          success: true,
          message: 'Validation completed',
          results: validationResult
        });

      case 'sync-course':
        const { courseId } = await request.json();
        if (!courseId) {
          return NextResponse.json({
            success: false,
            error: 'Course ID is required'
          }, { status: 400 });
        }

        console.log(`Syncing course ${courseId} to product...`);
        const course = await productSyncService.syncCourseToProduct({ id: courseId });
        
        return NextResponse.json({
          success: true,
          message: 'Course synced successfully',
          product: course
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: sync-all, validate, or sync-course'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Product sync API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'validate') {
      const validationResult = await productSyncService.validateSync();
      
      return NextResponse.json({
        success: true,
        message: 'Validation completed',
        results: validationResult
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: ?action=validate'
    }, { status: 400 });

  } catch (error) {
    console.error('Product sync validation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
