import { NextRequest, NextResponse } from 'next/server'
import { getUserTutorCourses } from '@/lib/user-content'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      )
    }

    // Récupérer les cours de l'utilisateur
    const courses = await getUserTutorCourses(userId)

    return NextResponse.json({
      success: true,
      courses,
      count: courses.length
    })

  } catch (error) {
    console.error('Erreur récupération cours utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cours' },
      { status: 500 }
    )
  }
}
