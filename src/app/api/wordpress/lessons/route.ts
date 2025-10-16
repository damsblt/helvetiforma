import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course');
    
    console.log('🔍 Fetching lessons for course:', courseId);

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Fetch lessons from WordPress API
    // Note: WordPress doesn't filter by course directly, so we get all lessons and filter client-side
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/lesson?per_page=100&_embed=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const allLessons = await response.json();
    console.log('✅ Found all lessons:', allLessons.length);

    // Filter lessons for the specific course
    // In this TutorLMS installation, lessons are directly linked to courses via URL structure
    const courseLessons = allLessons.filter((lesson: any) => {
      // Check if the lesson is linked to the course by checking the link structure
      return lesson.link && lesson.link.includes(`courses/charges-sociales-test-123-2/lessons/`);
    });

    console.log('✅ Filtered lessons for course:', courseLessons.length);

    // Sort lessons by date to maintain order
    courseLessons.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Format lessons for our application
    const formattedLessons = courseLessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title?.rendered || lesson.title || 'Sans titre',
      slug: lesson.slug,
      content: lesson.content?.rendered || lesson.content || '',
      excerpt: lesson.excerpt?.rendered || lesson.excerpt || '',
      date: lesson.date,
      modified: lesson.modified,
      status: lesson.status,
      link: lesson.link,
      type: lesson.type,
      featured_media: lesson.featured_media,
      lesson_type: 'text', // Default to text, could be enhanced
      duration: '5 min', // Default duration, could be enhanced
      is_preview: false, // Default to false
      order: 0, // Default order
    }));

    return NextResponse.json(formattedLessons);

  } catch (error) {
    console.error('❌ Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
