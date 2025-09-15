import { NextRequest, NextResponse } from 'next/server';
import tutorLmsService from '@/services/tutorLmsService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id);
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    console.log(`Fetching dashboard for student ${studentId}...`);
    
    const dashboardData = await tutorLmsService.getStudentDashboard(studentId);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Student dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors du chargement du tableau de bord: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
