import { NextRequest, NextResponse } from 'next/server';
import { tutorService } from '@/services/tutorService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, message: 'ID de cours invalide' },
        { status: 400 }
      );
    }

    const course = await tutorService.getCourse(courseId);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Cours non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Course API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement du cours' },
      { status: 500 }
    );
  }
}
