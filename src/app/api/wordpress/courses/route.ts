import { NextRequest, NextResponse } from 'next/server'
import { getTutorCourses } from '@/lib/tutor-lms'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      per_page: parseInt(searchParams.get('per_page') || '10'),
      page: parseInt(searchParams.get('page') || '1'),
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as 'publish' | 'draft' | 'private' || 'publish',
      category: searchParams.get('category') || undefined,
      level: searchParams.get('level') || undefined,
      featured: searchParams.get('featured') === 'true',
    }

    const courses = await getTutorCourses(params)

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        current_page: params.page,
        per_page: params.per_page,
        total_items: courses.length,
        total_pages: Math.ceil(courses.length / params.per_page),
      }
    })
  } catch (error) {
    console.error('API Error - Tutor LMS courses:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch courses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Cette route pourrait être utilisée pour créer de nouveaux cours
    // En production, elle nécessiterait une authentification admin
    
    return NextResponse.json(
      {
        success: false,
        error: 'Course creation not implemented',
        message: 'Use WordPress admin to create courses'
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('API Error - Create course:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
