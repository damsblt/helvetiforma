import { NextRequest, NextResponse } from 'next/server';

const TUTOR_API_URL = process.env.TUTOR_API_URL || 'https://api.helvetiforma.ch';
const TUTOR_CLIENT_ID = process.env.TUTOR_CLIENT_ID || '';
const TUTOR_SECRET_KEY = process.env.TUTOR_SECRET_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id') || '1'; // Default to demo user

    console.log('Fetching courses for student:', studentId);

    // Use Tutor LMS Pro API credentials for authentication
    const tutorAuth = TUTOR_CLIENT_ID && TUTOR_SECRET_KEY 
      ? `Basic ${Buffer.from(`${TUTOR_CLIENT_ID}:${TUTOR_SECRET_KEY}`).toString('base64')}`
      : `Basic ${Buffer.from(`gibivawa:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;

    const coursesResponse = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/students/${studentId}/courses`, {
      headers: {
        'Authorization': tutorAuth,
        'Content-Type': 'application/json'
      }
    });

    if (!coursesResponse.ok) {
      throw new Error(`Failed to fetch student courses: ${coursesResponse.statusText}`);
    }

    const coursesData = await coursesResponse.json();
    
    if (coursesData.code !== 'tutor_read_student') {
      throw new Error(`API Error: ${coursesData.message}`);
    }

    return NextResponse.json({
      success: true,
      data: coursesData.data
    });

  } catch (error) {
    console.error('Student courses error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch student courses: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
