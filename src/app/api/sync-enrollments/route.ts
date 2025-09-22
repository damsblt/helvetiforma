import { NextRequest, NextResponse } from 'next/server';
import { enrollmentSyncService } from '@/services/enrollmentSyncService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting enrollment sync...');
    
    const result = await enrollmentSyncService.syncAllEnrollments();
    
    if (result.success) {
      console.log('✅ Enrollment sync completed successfully');
      return NextResponse.json({
        success: true,
        message: result.message,
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        errors: result.errors
      });
    } else {
      console.log('❌ Enrollment sync failed');
      return NextResponse.json({
        success: false,
        message: result.message,
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        errors: result.errors
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error in sync-enrollments API:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting sync status...');
    
    const status = await enrollmentSyncService.getSyncStatus();
    
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get sync status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
