import { NextRequest, NextResponse } from 'next/server';
import tutorLmsService from '@/services/tutorLmsService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const studentId = parseInt(resolvedParams.id);
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    console.log(`Fetching calendar for student ${studentId}...`);
    
    const calendarData = await tutorLmsService.getStudentCalendar(studentId);

    return NextResponse.json({
      success: true,
      data: calendarData
    });

  } catch (error) {
    console.error('Student calendar API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors du chargement du calendrier: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
