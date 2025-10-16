import { NextRequest, NextResponse } from 'next/server'
import { getTutorUserCourses } from '@/lib/tutor-lms'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID'
        },
        { status: 400 }
      )
    }

    const courses = await getTutorUserCourses(userId)

    return NextResponse.json({
      success: true,
      data: courses
    })
  } catch (error) {
    console.error('API Error - Tutor LMS user courses:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user courses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
