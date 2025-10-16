// Simple enrollment tracking system
// This stores enrollments in a JSON file for development/testing

import fs from 'fs';
import path from 'path';

const ENROLLMENTS_FILE = path.join(process.cwd(), 'data', 'enrollments.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export interface EnrollmentRecord {
  id: string;
  user_id: string | number;
  course_id: string | number;
  enrolled_at: string;
  status: string;
  payment_status: string;
}

// Load enrollments from file
export function loadEnrollments(): EnrollmentRecord[] {
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
export function saveEnrollments(enrollments: EnrollmentRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2));
  } catch (error) {
    console.error('Error saving enrollments:', error);
  }
}

// Add a new enrollment
export function addEnrollment(enrollment: Omit<EnrollmentRecord, 'id'>): void {
  const enrollments = loadEnrollments();
  const newEnrollment: EnrollmentRecord = {
    ...enrollment,
    id: Date.now().toString()
  };
  enrollments.push(newEnrollment);
  saveEnrollments(enrollments);
}

// Get enrollments for a user
export function getUserEnrollments(userId: string | number): EnrollmentRecord[] {
  const enrollments = loadEnrollments();
  return enrollments.filter(
    enrollment => enrollment.user_id.toString() === userId.toString()
  );
}

// Check if user is enrolled in a course
export function isUserEnrolled(userId: string | number, courseId: string | number): boolean {
  const enrollments = getUserEnrollments(userId);
  return enrollments.some(
    enrollment => enrollment.course_id.toString() === courseId.toString()
  );
}
