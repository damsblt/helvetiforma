// Server-side enrollment storage
import fs from 'fs';
import path from 'path';
import { TutorEnrollment } from '@/types/wordpress';

const ENROLLMENTS_FILE = path.join(process.cwd(), 'enrollments.json');

// Load enrollments from file
export function loadEnrollments(): TutorEnrollment[] {
  try {
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
export function saveEnrollments(enrollments: TutorEnrollment[]): void {
  try {
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2));
  } catch (error) {
    console.error('Error saving enrollments:', error);
  }
}

// Add a new enrollment
export function addEnrollment(enrollment: TutorEnrollment): void {
  const enrollments = loadEnrollments();
  enrollments.push(enrollment);
  saveEnrollments(enrollments);
}

// Get enrollments for a user
export function getUserEnrollments(userId: string | number): TutorEnrollment[] {
  const enrollments = loadEnrollments();
  return enrollments.filter(
    enrollment => enrollment.user_id.toString() === userId.toString()
  );
}

