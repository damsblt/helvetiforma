import { NextRequest, NextResponse } from 'next/server';
import tutorLmsService from '@/services/tutorLmsService';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Tutor LMS Dashboard API...');

    // Test getting courses
    const courses = await tutorLmsService.getCourses();
    console.log('Courses fetched:', courses.length);

    // Test getting students
    const students = await tutorLmsService.getStudents();
    console.log('Students fetched:', students.length);

    // Test getting enrollments
    const enrollments = await tutorLmsService.getEnrollments();
    console.log('Enrollments fetched:', enrollments.length);

    // Test getting stats
    const stats = await tutorLmsService.getStats();
    console.log('Stats fetched:', stats);

    return NextResponse.json({
      success: true,
      message: 'Tutor LMS Dashboard API test successful',
      data: {
        courses_count: courses.length,
        students_count: students.length,
        enrollments_count: enrollments.length,
        stats: stats,
        sample_course: courses[0] || null,
        sample_student: students[0] || null,
        sample_enrollment: enrollments[0] || null
      }
    });

  } catch (error) {
    console.error('Tutor LMS Dashboard API test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
