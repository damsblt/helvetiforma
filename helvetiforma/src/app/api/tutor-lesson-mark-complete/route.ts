import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'your-app-password';

export async function POST(request: NextRequest) {
  try {
    const { lesson_id, user_id, course_id } = await request.json();

    if (!lesson_id || !user_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'lesson_id, user_id, and course_id are required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/lesson-mark-complete`;
    console.log('Marking lesson as complete:', { lesson_id, user_id, course_id });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
      body: JSON.stringify({
        lesson_id: parseInt(lesson_id),
        student_id: parseInt(user_id),
        course_id: parseInt(course_id)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor lesson mark complete API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors du marquage de la leçon comme terminée',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Lesson marked as complete successfully');

    return NextResponse.json({
      success: true,
      data: {
        lesson_id: parseInt(lesson_id),
        user_id: parseInt(user_id),
        completed: true,
        message: 'Leçon marquée comme terminée avec succès'
      }
    });

  } catch (error) {
    console.error('Tutor lesson mark complete API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
