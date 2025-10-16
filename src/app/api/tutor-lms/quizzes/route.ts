import { NextRequest, NextResponse } from 'next/server';
import { getTutorCourseQuizzes } from '@/lib/tutor-lms';

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

    console.log('🔍 API: Fetching quizzes for course:', course || courseId);

    // Get quizzes for the course
    const quizzes = await getTutorCourseQuizzes(course || courseId || '');

    console.log('✅ API: Found quizzes:', quizzes.length);

    return NextResponse.json(quizzes);

  } catch (error) {
    console.error('❌ API: Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

