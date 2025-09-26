import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'your-app-password';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: lessonId } = resolvedParams;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/lesson/${lessonId}`;
    console.log('Fetching lesson from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor lesson API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération de la leçon',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Lesson fetched successfully:', responseData.data?.lesson_title || 'Unknown title');

    // Extract lesson from the response data
    const lesson = responseData.data || responseData;

    // Transform the data to match Tutor LMS lesson structure
    let videoUrl = null;
    let videoDuration = 'Non spécifié';
    
    if (lesson.video && typeof lesson.video === 'object') {
      videoUrl = lesson.video.source || null;
      if (lesson.video.runtime) {
        const { hours = "00", minutes = "00", seconds = "00" } = lesson.video.runtime;
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const s = parseInt(seconds) || 0;
        
        if (h > 0 || m > 0 || s > 0) {
          const parts = [];
          if (h > 0) parts.push(`${h}h`);
          if (m > 0) parts.push(`${m}min`);
          if (s > 0) parts.push(`${s}s`);
          videoDuration = parts.join(' ');
        }
      }
    } else if (lesson.video_url) {
      videoUrl = lesson.video_url;
    }

    // Handle attachments array - Tutor LMS uses WordPress Media IDs
    let attachments = [];
    if (lesson.attachments && Array.isArray(lesson.attachments)) {
      attachments = lesson.attachments;
    } else if (lesson.attachment_url) {
      attachments = [lesson.attachment_url];
    }

    // Calculate duration from video runtime or use provided duration
    let duration = videoDuration;
    if (lesson.duration && lesson.duration !== 'Non spécifié') {
      duration = lesson.duration;
    }

    const transformedLesson = {
      // Core Tutor LMS lesson attributes
      topic_id: lesson.topic_id || lesson.parent_id,
      lesson_title: lesson.lesson_title || lesson.post_title || lesson.title,
      lesson_content: lesson.lesson_content || lesson.post_content || lesson.content,
      thumbnail_id: lesson.thumbnail_id || null,
      lesson_author: lesson.lesson_author || lesson.post_author || null,
      video: lesson.video || null,
      attachments: attachments,
      preview: lesson.preview || lesson.is_preview || false,
      
      // Additional fields for our app
      id: lesson.ID || lesson.id,
      title: lesson.lesson_title || lesson.post_title || lesson.title,
      content: lesson.lesson_content || lesson.post_content || lesson.content,
      order: lesson.menu_order || lesson.order || 0,
      duration: duration,
      video_url: videoUrl,
      is_preview: lesson.preview || lesson.is_preview || false,
      is_completed: false, // This would typically come from user progress data
      
      // WordPress metadata
      post_title: lesson.post_title || lesson.title,
      post_content: lesson.post_content || lesson.content,
      post_author: lesson.post_author || lesson.lesson_author,
      post_date: lesson.post_date || lesson.date,
      post_modified: lesson.post_modified || lesson.modified,
      post_status: lesson.post_status || lesson.status,
      guid: lesson.guid
    };

    return NextResponse.json({
      success: true,
      data: {
        lesson: transformedLesson
      }
    });

  } catch (error) {
    console.error('Tutor lesson API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
