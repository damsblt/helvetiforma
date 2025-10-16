import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    
    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching lesson details for ID:', lessonId);

    const TUTOR_API_KEY = process.env.TUTOR_API_KEY || 'key_85e31422f63c5f73e4781f49727cd58c';
    const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || 'secret_cb2c112e7a880b5ecc185ff136d858b0b9161a0fb05c8e1eb2a73eed3d09e073';
    const TUTOR_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

    // Use official TutorLMS Pro API to fetch lesson with authentication
    const authHeader = 'Basic ' + Buffer.from(`${TUTOR_API_KEY}:${TUTOR_SECRET_KEY}`).toString('base64');
    
    const lessonResponse = await fetch(
      `${TUTOR_API_URL}/wp-json/tutor/v1/lessons/${lessonId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    );

    if (!lessonResponse.ok) {
      console.error('❌ TutorLMS API error:', lessonResponse.status, lessonResponse.statusText);
      return NextResponse.json(
        { error: `Failed to fetch lesson from TutorLMS API: ${lessonResponse.statusText}` },
        { status: lessonResponse.status }
      );
    }

    const lessonData = await lessonResponse.json();
    console.log('✅ Lesson data retrieved from TutorLMS API');

    // Extract video URL - TutorLMS API returns video as an array
    let videoUrl: string | null = null;
    if (lessonData.video && Array.isArray(lessonData.video) && lessonData.video.length > 0) {
      videoUrl = lessonData.video[0];
    } else if (lessonData.video && typeof lessonData.video === 'string') {
      videoUrl = lessonData.video;
    }

    // Format attachments - TutorLMS API returns attachments as URLs
    let attachments: Array<{
      id: number;
      title: string;
      url: string;
      mime_type: string;
      file_size: number;
      description?: string;
      alt_text?: string;
    }> = [];

    if (lessonData.attachments && Array.isArray(lessonData.attachments)) {
      attachments = lessonData.attachments.map((attachment: any, index: number) => {
        if (typeof attachment === 'string') {
          // If it's just a URL string
          const filename = attachment.split('/').pop() || `Document ${index + 1}`;
          return {
            id: index + 1,
            title: filename.replace(/&#8211;/g, '–').replace(/&#8217;/g, "'"),
            url: attachment,
            mime_type: attachment.includes('.pdf') ? 'application/pdf' : 
                       attachment.includes('.doc') ? 'application/msword' : 
                       attachment.includes('.mp4') ? 'video/mp4' :
                       'application/octet-stream',
            file_size: 0,
            description: '',
            alt_text: '',
          };
        } else if (typeof attachment === 'object') {
          // If it's an object with properties
          return {
            id: attachment.id || index + 1,
            title: attachment.title || attachment.name || attachment.filename || `Document ${index + 1}`,
            url: attachment.url || attachment.source_url || '',
            mime_type: attachment.mime_type || attachment.type || 'application/octet-stream',
            file_size: attachment.file_size || attachment.size || 0,
            description: attachment.description || attachment.caption || '',
            alt_text: attachment.alt_text || '',
          };
        }
        return {
          id: index + 1,
          title: `Document ${index + 1}`,
          url: '',
          mime_type: 'application/octet-stream',
          file_size: 0,
        };
      });
    }

    console.log('✅ Found', attachments.length, 'attachments and video:', videoUrl ? 'yes' : 'no');

    // Format the response
    const formattedLesson = {
      id: lessonData.ID || lessonData.id,
      title: lessonData.post_title || lessonData.title || 'Sans titre',
      slug: lessonData.post_name || lessonData.slug || '',
      content: lessonData.post_content || lessonData.content || '',
      excerpt: lessonData.post_excerpt || lessonData.excerpt || '',
      date: lessonData.post_date || lessonData.date || '',
      modified: lessonData.post_modified || lessonData.modified || '',
      status: lessonData.post_status || lessonData.status || 'publish',
      lesson_type: lessonData.lesson_type || 'text',
      duration: lessonData.duration || '',
      is_preview: lessonData.is_preview || false,
      order: lessonData.menu_order || lessonData.order || 0,
      video_url: videoUrl,
      attachments: attachments,
    };

    return NextResponse.json(formattedLesson);

  } catch (error) {
    console.error('❌ Error fetching lesson details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson details', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
