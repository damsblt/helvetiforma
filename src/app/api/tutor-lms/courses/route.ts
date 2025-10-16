import { NextRequest, NextResponse } from 'next/server';
import { getTutorCourses } from '@/lib/tutor-lms';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const perPage = searchParams.get('per_page') || '10';
    const page = searchParams.get('page') || '1';

    console.log('🔍 API: Fetching courses with params:', { slug, perPage, page });

    // Get courses with filters
    const courses = await getTutorCourses({
      per_page: parseInt(perPage),
      page: parseInt(page)
    });

    console.log('✅ API: Found courses:', courses.length);

    return NextResponse.json(courses);

  } catch (error) {
    console.error('❌ API: Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

