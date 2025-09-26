// Simple local enrollment management
import { promises as fs } from 'fs';
import path from 'path';

export interface Enrollment {
  id: string;
  user_id: number;
  course_id: number;
  status: 'enrolled' | 'completed' | 'cancelled';
  enrolled_at: string;
  completed_at?: string;
  progress: number;
}

const ENROLLMENTS_FILE = path.join(process.cwd(), 'data', 'enrollments.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(ENROLLMENTS_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
}

// Load enrollments from file
async function loadEnrollments(): Promise<Enrollment[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ENROLLMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Save enrollments to file
async function saveEnrollments(enrollments: Enrollment[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2));
}

// Enroll user in course
export async function enrollUser(userId: number, courseId: number): Promise<Enrollment> {
  const enrollments = await loadEnrollments();
  
  // Check if already enrolled
  const existingEnrollment = enrollments.find(
    e => e.user_id === userId && e.course_id === courseId
  );
  
  if (existingEnrollment) {
    return existingEnrollment;
  }
  
  // Create new enrollment
  const newEnrollment: Enrollment = {
    id: `enrollment_${userId}_${courseId}_${Date.now()}`,
    user_id: userId,
    course_id: courseId,
    status: 'enrolled',
    enrolled_at: new Date().toISOString(),
    progress: 0
  };
  
  enrollments.push(newEnrollment);
  await saveEnrollments(enrollments);
  
  return newEnrollment;
}

// Get user enrollments
export async function getUserEnrollments(userId: number): Promise<Enrollment[]> {
  const enrollments = await loadEnrollments();
  return enrollments.filter(e => e.user_id === userId);
}

// Get all enrollments for a course
export async function getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
  const enrollments = await loadEnrollments();
  return enrollments.filter(e => e.course_id === courseId);
}

// Update enrollment progress
export async function updateEnrollmentProgress(
  userId: number, 
  courseId: number, 
  progress: number
): Promise<Enrollment | null> {
  const enrollments = await loadEnrollments();
  const enrollmentIndex = enrollments.findIndex(
    e => e.user_id === userId && e.course_id === courseId
  );
  
  if (enrollmentIndex === -1) {
    return null;
  }
  
  enrollments[enrollmentIndex].progress = progress;
  
  // Mark as completed if progress is 100%
  if (progress >= 100 && enrollments[enrollmentIndex].status !== 'completed') {
    enrollments[enrollmentIndex].status = 'completed';
    enrollments[enrollmentIndex].completed_at = new Date().toISOString();
  }
  
  await saveEnrollments(enrollments);
  return enrollments[enrollmentIndex];
}

// Cancel enrollment
export async function cancelEnrollment(userId: number, courseId: number): Promise<boolean> {
  const enrollments = await loadEnrollments();
  const enrollmentIndex = enrollments.findIndex(
    e => e.user_id === userId && e.course_id === courseId
  );
  
  if (enrollmentIndex === -1) {
    return false;
  }
  
  enrollments[enrollmentIndex].status = 'cancelled';
  await saveEnrollments(enrollments);
  
  return true;
}
