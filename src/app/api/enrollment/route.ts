import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENROLLMENTS_FILE = path.join(process.cwd(), 'data', 'enrollments.json');

interface EnrollmentRecord {
  id: string;
  user_id: string | number;
  course_id: string | number;
  enrolled_at: string;
  status: string;
  payment_status: string;
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load enrollments from file
function loadEnrollments(): EnrollmentRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ENROLLMENTS_FILE)) {
      const data = fs.readFileSync(ENROLLMENTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading enrollments:', error);
  }
  return [];
}

// Save enrollments to file
function saveEnrollments(enrollments: EnrollmentRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2));
  } catch (error) {
    console.error('Error saving enrollments:', error);
  }
}

// Add a new enrollment
function addEnrollment(enrollment: Omit<EnrollmentRecord, 'id'>): void {
  const enrollments = loadEnrollments();
  const newEnrollment: EnrollmentRecord = {
    ...enrollment,
    id: Date.now().toString()
  };
  enrollments.push(newEnrollment);
  saveEnrollments(enrollments);
}

// Get enrollments for a user
function getUserEnrollments(userId: string | number): EnrollmentRecord[] {
  const enrollments = loadEnrollments();
  return enrollments.filter(
    enrollment => enrollment.user_id.toString() === userId.toString()
  );
}

// Check if user is enrolled in a course
function isUserEnrolled(userId: string | number, courseId: string | number): boolean {
  const enrollments = getUserEnrollments(userId);
  return enrollments.some(
    enrollment => enrollment.course_id.toString() === courseId.toString()
  );
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id, status = 'enrolled', payment_status = 'paid' } = await request.json();
    
    if (!user_id || !course_id) {
      return NextResponse.json(
        { error: 'User ID and Course ID are required' },
        { status: 400 }
      );
    }
    
    addEnrollment({
      user_id,
      course_id,
      enrolled_at: new Date().toISOString(),
      status,
      payment_status
    });
    
    return NextResponse.json({
      success: true,
      message: 'Enrollment added successfully'
    });
    
  } catch (error) {
    console.error('Error adding enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to add enrollment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const courseId = searchParams.get('course_id');
    
    if (userId && courseId) {
      // Check specific enrollment
      const isEnrolled = isUserEnrolled(userId, courseId);
      return NextResponse.json({
        is_enrolled: isEnrolled,
        user_id: userId,
        course_id: courseId
      });
    } else if (userId) {
      // Get all enrollments for user
      const enrollments = getUserEnrollments(userId);
      return NextResponse.json({
        enrollments,
        count: enrollments.length
      });
    } else {
      // Get all enrollments
      const enrollments = loadEnrollments();
      return NextResponse.json({
        enrollments,
        count: enrollments.length
      });
    }
    
  } catch (error) {
    console.error('Error getting enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to get enrollments' },
      { status: 500 }
    );
  }
}



