import { NextRequest, NextResponse } from 'next/server';
import { getTutorCourseLessons } from '@/lib/tutor-lms';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');
    const courseId = searchParams.get('courseId');

    if (!course && !courseId) {
      return NextResponse.json(
        { error: 'Course slug or ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Fetching lessons for course:', course || courseId);

    // Get lessons for the course
    const lessons = await getTutorCourseLessons(course || courseId || '');

    console.log('✅ API: Found lessons:', lessons.length);

    return NextResponse.json(lessons);

  } catch (error) {
    console.error('❌ API: Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

