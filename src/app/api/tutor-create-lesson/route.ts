import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'your-app-password';

export async function POST(request: NextRequest) {
  try {
    const { 
      topic_id, 
      lesson_title, 
      lesson_content, 
      thumbnail_id, 
      lesson_author,
      video,
      attachments,
      preview
    } = await request.json();

    if (!topic_id || !lesson_title) {
      return NextResponse.json(
        { success: false, error: 'topic_id and lesson_title are required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/lessons`;
    console.log('Creating lesson:', { topic_id, lesson_title });

    const lessonData: any = {
      topic_id: parseInt(topic_id),
      lesson_title: lesson_title,
      lesson_content: lesson_content || '',
      lesson_author: lesson_author || 1
    };

    if (thumbnail_id) lessonData.thumbnail_id = parseInt(thumbnail_id);
    if (video) lessonData.video = video;
    if (attachments) lessonData.attachments = attachments;
    if (preview !== undefined) lessonData.preview = preview;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor lesson creation API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la création de la leçon',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Lesson created successfully:', responseData);

    return NextResponse.json({
      success: true,
      data: {
        lesson: responseData.data || responseData,
        message: 'Leçon créée avec succès'
      }
    });

  } catch (error) {
    console.error('Tutor lesson creation API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
