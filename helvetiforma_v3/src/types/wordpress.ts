// Types pour l'intégration WordPress/TutorLMS

export interface TutorCourse {
  id: number
  title: string
  description: string
  content: string
  price: number
  instructor: string
  instructor_id: number
  thumbnail: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  enrollment_url: string
  purchase_url: string
  slug: string
  status: 'publish' | 'draft' | 'private'
  created_at: string
  updated_at: string
  enrolled_count: number
  max_students: number
  prerequisites: string[]
  objectives: string[]
  features: string[]
}

export interface TutorEnrollment {
  id: number
  user_id: number
  course_id: number
  enrolled_at: string
  status: 'enrolled' | 'completed' | 'cancelled'
  progress: number
  completed_at?: string
}

export interface WordPressUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  roles: string[]
  avatar_url: string
}

export interface TutorInstructor {
  id: number
  display_name: string
  email: string
  bio: string
  avatar_url: string
  courses_count: number
  rating: number
  social_links: {
    website?: string
    linkedin?: string
    twitter?: string
  }
}

export interface TutorLesson {
  id: number
  course_id: number
  title: string
  content: string
  video_url?: string
  duration?: string
  order: number
  is_preview: boolean
}

export interface TutorQuiz {
  id: number
  course_id: number
  title: string
  description: string
  questions_count: number
  time_limit?: number
  attempts_allowed: number
  passing_grade: number
}

export interface CourseProgress {
  course_id: number
  user_id: number
  lessons_completed: number
  lessons_total: number
  quizzes_completed: number
  quizzes_total: number
  progress_percentage: number
  last_accessed: string
}

export interface TutorOrder {
  id: number
  user_id: number
  course_id: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  total_amount: number
  currency: string
  payment_method: string
  created_at: string
  updated_at: string
}

export interface WordPressPost {
  id: number
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'publish' | 'draft' | 'private'
  author_id: number
  featured_image?: string
  categories: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface WordPressMedia {
  id: number
  title: string
  alt_text: string
  url: string
  mime_type: string
  file_size: number
  width?: number
  height?: number
  uploaded_at: string
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    per_page: number
    total_items: number
    total_pages: number
  }
}

// Types pour l'authentification
export interface AuthResponse {
  success: boolean
  user?: WordPressUser
  token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

// Types pour les webhooks TutorLMS
export interface TutorWebhookPayload {
  event: 'course.enrolled' | 'course.completed' | 'order.completed' | 'user.registered'
  data: {
    user_id: number
    course_id?: number
    order_id?: number
    timestamp: string
    [key: string]: any
  }
}

// Types pour les statistiques
export interface CourseStats {
  total_courses: number
  total_enrollments: number
  total_completions: number
  total_revenue: number
  popular_courses: TutorCourse[]
  recent_enrollments: TutorEnrollment[]
}

export interface InstructorStats {
  total_courses: number
  total_students: number
  average_rating: number
  total_revenue: number
  monthly_enrollments: Array<{
    month: string
    count: number
  }>
}
