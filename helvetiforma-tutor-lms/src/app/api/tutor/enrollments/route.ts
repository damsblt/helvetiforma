import { NextRequest, NextResponse } from 'next/server';
import { getUserEnrollments } from '@/lib/enrollments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'user_id parameter required' },
        { status: 400 }
      );
    }

    // Use simple local enrollment system
    try {
      const enrollments = await getUserEnrollments(parseInt(userId));
      
      return NextResponse.json({
        success: true,
        data: enrollments,
        source: 'local_storage'
      });
      
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      
      // Fallback: return empty array
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No enrollments found',
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Enrollments API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching enrollments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
