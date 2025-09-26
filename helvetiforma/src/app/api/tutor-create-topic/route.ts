import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'your-app-password';

export async function POST(request: NextRequest) {
  try {
    const { course_id, topic_title, topic_summary } = await request.json();

    if (!course_id || !topic_title) {
      return NextResponse.json(
        { success: false, error: 'course_id and topic_title are required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/topics`;
    console.log('Creating topic:', { course_id, topic_title, topic_summary });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
      body: JSON.stringify({
        topic_course_id: parseInt(course_id),
        topic_title: topic_title,
        topic_summary: topic_summary || '',
        topic_author: 1 // Demo author ID
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor topic creation API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la création du topic',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Topic created successfully:', responseData);

    return NextResponse.json({
      success: true,
      data: {
        topic: responseData.data || responseData,
        message: 'Topic créé avec succès'
      }
    });

  } catch (error) {
    console.error('Tutor topic creation API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
