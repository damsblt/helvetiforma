// LMS Service for WordPress LMS Integration
// Supports LearnDash, TutorLMS, and Sensei LMS

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  categories: number[];
  meta: {
    course_duration?: string;
    course_level?: string;
    course_price?: string;
    course_currency?: string;
    course_instructor?: string;
    course_capacity?: number;
    course_enrolled?: number;
    course_start_date?: string;
    course_end_date?: string;
    course_location?: string;
    course_type?: string;
  };
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  course_id: number;
  order: number;
  duration?: string;
  video_url?: string;
  attachments?: string[];
}

interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'enrolled' | 'completed' | 'in_progress';
  enrollment_date: string;
  completion_date?: string;
  progress: number;
}

class LMSService {
  private baseUrl: string;
  private apiPrefix: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:3000';
    this.apiPrefix = '/wp-json/wp/v2';
  }

  // Generic WordPress API call
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}${this.apiPrefix}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LMS API Error:', error);
      throw error;
    }
  }

  // Get all courses
  async getCourses(): Promise<Course[]> {
    try {
      const courses = await this.apiCall('/courses?per_page=100&_embed');
      return courses.map(this.formatCourse);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Get single course
  async getCourse(courseId: number): Promise<Course | null> {
    try {
      const course = await this.apiCall(`/courses/${courseId}?_embed`);
      return this.formatCourse(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  // Get course lessons
  async getCourseLessons(courseId: number): Promise<Lesson[]> {
    try {
      // This endpoint varies by LMS plugin
      const lessons = await this.apiCall(`/lessons?course=${courseId}&per_page=100&orderby=menu_order&order=asc`);
      return lessons.map(this.formatLesson);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  }

  // Get user enrollments
  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    try {
      // This endpoint varies by LMS plugin
      const enrollments = await this.apiCall(`/enrollments?user=${userId}&per_page=100`);
      return enrollments.map(this.formatEnrollment);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  }

  // Enroll user in course
  async enrollUser(userId: number, courseId: number): Promise<boolean> {
    try {
      // This endpoint varies by LMS plugin
      const response = await this.apiCall('/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          status: 'enrolled'
        }),
      });
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      return false;
    }
  }

  // Update enrollment progress
  async updateProgress(enrollmentId: number, progress: number): Promise<boolean> {
    try {
      // This endpoint varies by LMS plugin
      const response = await this.apiCall(`/enrollments/${enrollmentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          progress: progress
        }),
      });
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  // Search courses
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const courses = await this.apiCall(`/courses?search=${encodeURIComponent(query)}&per_page=100&_embed`);
      return courses.map(this.formatCourse);
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  // Get courses by category
  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    try {
      const courses = await this.apiCall(`/courses?categories=${categoryId}&per_page=100&_embed`);
      return courses.map(this.formatCourse);
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      return [];
    }
  }

  // Get course statistics
  async getCourseStats(courseId: number) {
    try {
      const course = await this.getCourse(courseId);
      if (!course) return null;

      return {
        total_enrolled: course.meta.course_enrolled || 0,
        capacity: course.meta.course_capacity || 0,
        availability: (course.meta.course_capacity || 0) - (course.meta.course_enrolled || 0),
        is_full: (course.meta.course_enrolled || 0) >= (course.meta.course_capacity || 0)
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return null;
    }
  }

  // Format course data consistently across different LMS plugins
  private formatCourse(course: any): Course {
    return {
      id: course.id,
      title: course.title?.rendered || course.title || '',
      content: course.content?.rendered || course.content || '',
      excerpt: course.excerpt?.rendered || course.excerpt || '',
      slug: course.slug,
      featured_image: course._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      categories: course.categories || [],
      meta: {
        course_duration: course.meta?.course_duration || course.meta?.duration,
        course_level: course.meta?.course_level || course.meta?.level,
        course_price: course.meta?.course_price || course.meta?.price,
        course_currency: course.meta?.course_currency || course.meta?.currency || 'CHF',
        course_instructor: course.meta?.course_instructor || course.meta?.instructor,
        course_capacity: course.meta?.course_capacity || course.meta?.capacity,
        course_enrolled: course.meta?.course_enrolled || course.meta?.enrolled || 0,
        course_start_date: course.meta?.course_start_date || course.meta?.start_date,
        course_end_date: course.meta?.course_end_date || course.meta?.end_date,
        course_location: course.meta?.course_location || course.meta?.location,
        course_type: course.meta?.course_type || course.meta?.type || 'présentiel'
      }
    };
  }

  // Format lesson data
  private formatLesson(lesson: any): Lesson {
    return {
      id: lesson.id,
      title: lesson.title?.rendered || lesson.title || '',
      content: lesson.content?.rendered || lesson.content || '',
      course_id: lesson.course_id || lesson.course || 0,
      order: lesson.menu_order || lesson.order || 0,
      duration: lesson.meta?.duration,
      video_url: lesson.meta?.video_url,
      attachments: lesson.meta?.attachments || []
    };
  }

  // Format enrollment data
  private formatEnrollment(enrollment: any): Enrollment {
    return {
      id: enrollment.id,
      user_id: enrollment.user_id || enrollment.user,
      course_id: enrollment.course_id || enrollment.course,
      status: enrollment.status || 'enrolled',
      enrollment_date: enrollment.enrollment_date || enrollment.date_created,
      completion_date: enrollment.completion_date,
      progress: enrollment.progress || 0
    };
  }

  // Check if user is enrolled in course
  async isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      return enrollments.some(enrollment => 
        enrollment.course_id === courseId && 
        enrollment.status === 'enrolled'
      );
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  // Get user progress in course
  async getUserProgress(userId: number, courseId: number): Promise<number> {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      const enrollment = enrollments.find(e => e.course_id === courseId);
      return enrollment?.progress || 0;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return 0;
    }
  }
}

// Create singleton instance
const lmsService = new LMSService();
export default lmsService;
