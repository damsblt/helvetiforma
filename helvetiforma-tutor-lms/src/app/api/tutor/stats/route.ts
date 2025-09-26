import { NextRequest, NextResponse } from 'next/server';
import { config, getAuthHeaders, buildUrl } from '@/lib/wordpress';

export async function GET(request: NextRequest) {
  try {
    // Try to get stats from Tutor LMS API
    const endpoints = [
      config.endpoints.tutor.courses,
      config.endpoints.tutor.students,
      config.endpoints.tutor.enrollments,
    ];

    const [coursesRes, studentsRes, enrollmentsRes] = await Promise.allSettled(
      endpoints.map(endpoint => 
        fetch(buildUrl(endpoint), {
          headers: getAuthHeaders(),
        })
      )
    );

    const stats = {
      total_courses: 0,
      total_students: 0,
      total_instructors: 0,
      total_enrollments: 0,
      total_revenue: 0
    };

    // Count courses
    if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
      const courses = await coursesRes.value.json();
      stats.total_courses = Array.isArray(courses) ? courses.length : 0;
    } else {
      // Fallback: use WordPress posts API
      const wpCoursesRes = await fetch(buildUrl(config.endpoints.wpTutor.courses), {
        headers: getAuthHeaders(),
      });
      if (wpCoursesRes.ok) {
        const courses = await wpCoursesRes.json();
        stats.total_courses = Array.isArray(courses) ? courses.length : 0;
      }
    }

    // Count students
    if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
      const students = await studentsRes.value.json();
      stats.total_students = Array.isArray(students) ? students.length : 0;
    } else {
      // Fallback: count users with subscriber role
      const usersRes = await fetch(buildUrl(`${config.endpoints.wp.users}?roles=subscriber`), {
        headers: getAuthHeaders(),
      });
      if (usersRes.ok) {
        const users = await usersRes.json();
        stats.total_students = Array.isArray(users) ? users.length : 0;
      }
    }

    // Count enrollments
    if (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value.ok) {
      const enrollments = await enrollmentsRes.value.json();
      stats.total_enrollments = Array.isArray(enrollments) ? enrollments.length : 0;
    }

    // Count instructors
    const instructorsRes = await fetch(buildUrl(`${config.endpoints.wp.users}?roles=tutor_instructor`), {
      headers: getAuthHeaders(),
    });
    if (instructorsRes.ok) {
      const instructors = await instructorsRes.json();
      stats.total_instructors = Array.isArray(instructors) ? instructors.length : 0;
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors du chargement des statistiques',
        data: {
          total_courses: 0,
          total_students: 0,
          total_instructors: 0,
          total_enrollments: 0,
          total_revenue: 0
        }
      },
      { status: 500 }
    );
  }
}
