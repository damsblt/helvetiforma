import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'your-app-password';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topic_id');

    if (!topicId) {
      return NextResponse.json(
        { success: false, error: 'topic_id is required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;

    const apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/lessons?topic_id=${topicId}`;
    console.log('Fetching lessons from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor lessons API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération des leçons',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Lessons fetched successfully:', responseData.data?.length || 'Unknown count');

    // Extract lessons from the response data - Tutor LMS returns lessons directly in data array
    const lessons = responseData.data || [];

    // Sort lessons by ID to maintain proper order
    const sortedLessons = lessons.sort((a: any, b: any) => (a.ID || a.id) - (b.ID || b.id));

    // Transform the data to match Tutor LMS lesson structure
    const transformedLessons = sortedLessons.map((lesson: any, index: number) => {
      // Handle video object structure according to Tutor LMS format
      let videoUrl = null;
      let videoDuration = 'Non spécifié';
      
      if (lesson.video && typeof lesson.video === 'object' && lesson.video.length > 0) {
        videoUrl = lesson.video[0].source || null;
        if (lesson.video[0].runtime) {
          const { hours = "00", minutes = "00", seconds = "00" } = lesson.video[0].runtime;
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
      } else {
        // Check for YouTube embed in content
        const content = lesson.post_content || lesson.lesson_content || '';
        const embedMatch = content.match(/\[embed\](https:\/\/www\.youtube\.com\/watch\?v=[^&\]]+)[^\]]*\[\/embed\]/);
        if (embedMatch) {
          videoUrl = embedMatch[1];
          videoDuration = 'YouTube Video';
        }
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

      return {
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
        content: (lesson.lesson_content || lesson.post_content || lesson.content || '')
          .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
          .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
          .trim(),
        order: lesson.menu_order || lesson.order || index,
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
    });

    return NextResponse.json({
      success: true,
      data: {
        lessons: transformedLessons,
        topic_id: topicId
      }
    });

  } catch (error) {
    console.error('Tutor lessons API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
