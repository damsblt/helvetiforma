import { NextRequest, NextResponse } from 'next/server';
import { enrollUser } from '@/lib/enrollments';

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id } = await request.json();

    if (!user_id || !course_id) {
      return NextResponse.json(
        { success: false, message: 'user_id et course_id sont requis' },
        { status: 400 }
      );
    }

    // Use simple local enrollment system
    try {
      const enrollment = await enrollUser(user_id, course_id);
      
      return NextResponse.json({
        success: true,
        message: 'Inscription réussie',
        enrollment: enrollment
      });
      
    } catch (error) {
      console.error('Enrollment error:', error);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de l\'inscription' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Enrollment API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
