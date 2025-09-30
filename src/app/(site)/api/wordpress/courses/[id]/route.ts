import { NextRequest, NextResponse } from 'next/server'
import { getTutorCourse } from '@/lib/wordpress'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const courseId = parseInt(resolvedParams.id)
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID must be a number'
        },
        { status: 400 }
      )
    }

    const course = await getTutorCourse(courseId)
    
    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
          message: `Course with ID ${courseId} does not exist`
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error(`API Error - WordPress course ${resolvedParams.id}:`, error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    // Cette route pourrait être utilisée pour mettre à jour un cours
    // En production, elle nécessiterait une authentification admin
    
    return NextResponse.json(
      {
        success: false,
        error: 'Course update not implemented',
        message: 'Use WordPress admin to update courses'
      },
      { status: 501 }
    )
  } catch (error) {
    console.error(`API Error - Update course ${resolvedParams.id}:`, error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    // Cette route pourrait être utilisée pour supprimer un cours
    // En production, elle nécessiterait une authentification admin
    
    return NextResponse.json(
      {
        success: false,
        error: 'Course deletion not implemented',
        message: 'Use WordPress admin to delete courses'
      },
      { status: 501 }
    )
  } catch (error) {
    console.error(`API Error - Delete course ${resolvedParams.id}:`, error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
