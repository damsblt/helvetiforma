// Tutor LMS Types based on WordPress REST API and Tutor LMS Pro API

export interface TutorUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isInstructor: boolean;
  isStudent: boolean;
  isAdmin: boolean;
}

export interface TutorCourse {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'publish' | 'draft' | 'private';
  featured_image?: string;
  price?: number;
  sale_price?: number;
  is_free: boolean;
  difficulty_level: string;
  course_duration: string;
  maximum_students: number;
  enrolled_students: number;
  instructor: TutorUser;
  categories: TutorCategory[];
  lessons_count: number;
  quizzes_count: number;
  assignments_count: number;
  created_at: string;
  updated_at: string;
}

export interface TutorLesson {
  id: number;
  title: string;
  content: string;
  course_id: number;
  lesson_type: 'video' | 'text' | 'audio' | 'document';
  video_url?: string;
  duration: string;
  is_preview: boolean;
  order: number;
}

export interface TutorCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface TutorEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'enrolled' | 'completed' | 'cancelled';
  enrolled_at: string;
  completed_at?: string;
  progress: number;
}

export interface TutorQuiz {
  id: number;
  title: string;
  course_id: number;
  lesson_id?: number;
  questions_count: number;
  time_limit?: number;
  attempts_allowed: number;
  passing_grade: number;
}

export interface TutorOrder {
  id: number;
  user_id: number;
  course_id: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  currency: string;
  payment_method: string;
  created_at: string;
}

export interface TutorStats {
  total_courses: number;
  total_students: number;
  total_instructors: number;
  total_enrollments: number;
  total_revenue: number;
}

export interface AuthResponse {
  success: boolean;
  user?: TutorUser;
  token?: string;
  message?: string;
  requiresManualApproval?: boolean;
  registrationId?: string;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  password?: string;
  role: 'subscriber' | 'tutor_instructor';
}
