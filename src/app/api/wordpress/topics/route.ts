import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course');
    
    console.log('🔍 Fetching topics for course:', courseId);

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Fetch topics from WordPress API
    // Note: In TutorLMS, topics are stored as custom post type 'topic'
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/topic?course=${courseId}&per_page=100&_embed=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const allTopics = await response.json();
    console.log('✅ Found all topics:', allTopics.length);

    // Filter topics for the specific course
    const courseTopics = allTopics.filter((topic: any) => {
      // Check if the topic is linked to the course by checking the link structure
      return topic.link && topic.link.includes(`courses/charges-sociales-test-123-2/topics/`);
    });

    console.log('✅ Filtered topics for course:', courseTopics.length);

    // Format topics for our application
    const formattedTopics = courseTopics.map((topic: any) => ({
      id: topic.id,
      title: topic.title?.rendered || topic.title || 'Sans titre',
      slug: topic.slug,
      content: topic.content?.rendered || topic.content || '',
      excerpt: topic.excerpt?.rendered || topic.excerpt || '',
      date: topic.date,
      modified: topic.modified,
      status: topic.status,
      link: topic.link,
      type: topic.type,
      order: topic.menu_order || 0,
      course_id: courseId,
    }));

    return NextResponse.json(formattedTopics);

  } catch (error) {
    console.error('❌ Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

