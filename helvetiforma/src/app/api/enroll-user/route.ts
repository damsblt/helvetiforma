import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id } = await request.json();

    // Validate input
    if (!user_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'user_id et course_id sont requis' },
        { status: 400 }
      );
    }

    console.log('Enrolling user in course:', { user_id, course_id });

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY 
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;

    const enrollmentData = {
      user_id: parseInt(user_id),
      course_id: parseInt(course_id)
    };

    const enrollmentResponse = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
      body: JSON.stringify(enrollmentData),
    });

    if (!enrollmentResponse.ok) {
      const errorData = await enrollmentResponse.json();
      console.error('Course enrollment failed:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de l'inscription au cours: ${errorData.message || 'Erreur inconnue'}`,
          details: errorData
        },
        { status: enrollmentResponse.status }
      );
    }

    const enrollment = await enrollmentResponse.json();
    console.log('User enrolled in course:', enrollment);

    return NextResponse.json({
      success: true,
      enrollment_id: enrollment.data?.enrollment_id || enrollment.id,
      user_id: enrollmentData.user_id,
      course_id: enrollmentData.course_id,
      message: 'Inscription au cours réussie'
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
