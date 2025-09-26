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
    const { id: courseId } = resolvedParams;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;

    // Fetch course content structure
    const contentUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/course-contents/${courseId}`;
    console.log('Fetching course contents from:', contentUrl);

    const contentResponse = await fetch(contentUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    let lessons: any[] = [];
    let quizzes: any[] = [];

    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      
      // Process the course contents data structure
      const topics = contentData.data || [];
      lessons = [];
      quizzes = [];

      topics.forEach((topic: any) => {
        if (topic.contents && Array.isArray(topic.contents)) {
          topic.contents.forEach((content: any) => {
            if (content.post_type === 'lesson') {
              lessons.push({
                ...content,
                topic_id: topic.id
              });
            } else if (content.post_type === 'tutor_quiz') {
              quizzes.push({
                ...content,
                topic_id: topic.id
              });
            }
          });
        }
      });
    } else {
      console.warn('Course contents API not available, fetching topics and lessons separately');
      
      // Fallback: fetch topics first, then lessons for each topic
      const topicsUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/topics?course_id=${courseId}`;
      const topicsResponse = await fetch(topicsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tutorAuth,
        },
      });

      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        const topics = topicsData.data?.topics || topicsData.topics || [];
        
        // Fetch lessons for each topic
        for (const topic of topics) {
          const lessonsUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/lessons?topic_id=${topic.ID || topic.id}`;
          const lessonsResponse = await fetch(lessonsUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': tutorAuth,
            },
          });

          if (lessonsResponse.ok) {
            const lessonsData = await lessonsResponse.json();
            const topicLessons = lessonsData.data?.lessons || lessonsData.lessons || [];
            lessons.push(...topicLessons);
          }
        }
      }
    }

    // Transform lessons data to match Tutor LMS lesson structure
    const transformedLessons = lessons.map((lesson: any) => {
      // Handle video object structure
      let videoUrl = null;
      let videoDuration = 'Non spécifié';
      
      if (lesson.video && typeof lesson.video === 'object') {
        videoUrl = lesson.video.source || null;
        if (lesson.video.runtime) {
          const { hours = 0, minutes = 0, seconds = 0 } = lesson.video.runtime;
          if (hours > 0 || minutes > 0 || seconds > 0) {
            videoDuration = `${hours}h ${minutes}min ${seconds}s`.replace(/\b0[hms]\s*/g, '').trim();
          }
        }
      } else if (lesson.video_url) {
        videoUrl = lesson.video_url;
      }

      // Handle attachments array
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
        id: lesson.ID || lesson.id,
        title: lesson.lesson_title || lesson.post_title || lesson.title,
        content: lesson.lesson_content || lesson.post_content || lesson.content,
        topic_id: lesson.topic_id || lesson.parent_id,
        order: lesson.menu_order || lesson.order || 0,
        duration: duration,
        video: {
          source_type: lesson.video?.source_type || null,
          source: videoUrl,
          runtime: lesson.video?.runtime || null
        },
        video_url: videoUrl,
        attachments: attachments,
        thumbnail_id: lesson.thumbnail_id || null,
        lesson_author: lesson.lesson_author || lesson.post_author || null,
        is_preview: lesson.preview || lesson.is_preview || false,
        is_completed: false, // This would typically come from user progress data
        // Additional metadata
        post_title: lesson.post_title || lesson.title,
        post_content: lesson.post_content || lesson.content,
        post_author: lesson.post_author || lesson.lesson_author,
        post_date: lesson.post_date || lesson.date,
        post_modified: lesson.post_modified || lesson.modified,
        post_status: lesson.post_status || lesson.status,
        guid: lesson.guid
      };
    });

    // Transform quizzes data
    const transformedQuizzes = quizzes.map((quiz: any) => ({
      id: quiz.ID || quiz.id,
      title: quiz.post_title || quiz.title,
      topic_id: quiz.topic_id || quiz.parent_id,
      questions: quiz.questions || [],
      passing_grade: quiz.passing_grade || 70,
      time_limit: quiz.time_limit || 0,
    }));

    console.log('Course contents fetched successfully:', {
      lessons: transformedLessons.length,
      quizzes: transformedQuizzes.length
    });

    return NextResponse.json({
      success: true,
      data: {
        course_id: courseId,
        lessons: transformedLessons,
        quizzes: transformedQuizzes
      }
    });

  } catch (error) {
    console.error('Tutor course contents API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
