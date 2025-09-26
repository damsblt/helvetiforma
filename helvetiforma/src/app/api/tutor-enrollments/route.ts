import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    const studentId = searchParams.get('student_id');

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`;

    let apiUrl = `${TUTOR_API_URL}/wp-json/tutor/v1/enrollments`;
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId);
    if (studentId) params.append('student_id', studentId);
    
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    console.log('Fetching enrollments from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tutorAuth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tutor enrollments API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération des inscriptions',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Enrollments fetched successfully:', responseData.data?.length || 'Unknown count');

    // Extract enrollments from the response data
    const enrollments = responseData.data || [];

    // Transform the data to match our expected format
    const transformedEnrollments = enrollments.map((enrollment: any) => ({
      id: enrollment.ID || enrollment.id,
      course_id: enrollment.course_id || enrollment.course_ID,
      student_id: enrollment.student_id || enrollment.student_ID,
      enrollment_date: enrollment.enrollment_date || enrollment.date,
      status: enrollment.status || 'enrolled',
      progress: enrollment.progress || 0,
      completed_lessons: enrollment.completed_lessons || 0,
      total_lessons: enrollment.total_lessons || 0,
      last_activity: enrollment.last_activity || enrollment.last_accessed,
      // Course information
      course_title: enrollment.course_title || enrollment.course_name,
      course_thumbnail: enrollment.course_thumbnail || enrollment.thumbnail,
      // Student information
      student_name: enrollment.student_name || enrollment.student_display_name,
      student_email: enrollment.student_email || enrollment.student_user_email,
      student_avatar: enrollment.student_avatar || enrollment.avatar_url
    }));

    return NextResponse.json({
      success: true,
      data: {
        enrollments: transformedEnrollments,
        total: transformedEnrollments.length
      }
    });

  } catch (error) {
    console.error('Tutor enrollments API error:', error);
    return NextResponse.json(
      { success: false, error: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

