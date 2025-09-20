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

    console.log(`Fetching order history for student ${studentId}...`);
    
    const orderHistory = await tutorLmsService.getStudentOrderHistory(studentId);

    return NextResponse.json({
      success: true,
      data: orderHistory
    });

  } catch (error) {
    console.error('Student order history API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors du chargement de l'historique des commandes: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
