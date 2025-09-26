import { NextRequest, NextResponse } from 'next/server';
import tutorLmsService, { TutorStats } from '@/services/tutorLmsService';

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API called - fetching all data...');
    
    // Fetch all dashboard data server-side
    const [stats, courses, students, enrollments] = await Promise.all([
      tutorLmsService.getStats(),
      tutorLmsService.getCourses(),
      tutorLmsService.getStudents(),
      tutorLmsService.getEnrollments()
    ]);

    console.log('Dashboard data fetched:', {
      stats,
      coursesCount: courses.length,
      studentsCount: students.length,
      enrollmentsCount: enrollments.length
    });

    return NextResponse.json({
      success: true,
      data: {
        stats,
        courses,
        students,
        enrollments
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors du chargement des données: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
