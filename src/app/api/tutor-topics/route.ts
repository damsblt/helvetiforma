import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'your-app-password';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'course_id is required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/topics?course_id=${courseId}`;
    console.log('Fetching topics from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor topics API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération des sujets',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Topics fetched successfully:', responseData.data?.length || 'Unknown count');

    // Extract topics from the response data - Tutor LMS returns topics directly in data array
    const topics = responseData.data || [];

    // Transform the data to match our expected format
    const transformedTopics = topics.map((topic: any) => ({
      id: topic.ID || topic.id,
      title: topic.post_title || topic.title,
      content: topic.post_content || topic.content,
      course_id: topic.course_id || courseId,
      order: topic.menu_order || topic.order || 0,
      duration: topic.duration || 'Non spécifié',
      is_preview: topic.is_preview || false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        topics: transformedTopics,
        course_id: courseId
      }
    });

  } catch (error) {
    console.error('Tutor topics API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
