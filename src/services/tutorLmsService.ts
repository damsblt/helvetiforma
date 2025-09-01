// TutorLMS + WooCommerce Integration Service
// Optimized for Swiss training business needs
// Updated to work with current API setup

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  categories: number[];
  tags: number[];
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
    course_lessons_count?: number;
    course_topics_count?: number;
    course_quiz_count?: number;
    course_assignments_count?: number;
    course_certificate?: boolean;
    course_access_duration?: string;
  };
  woocommerce?: {
    product_id?: number;
    price?: string;
    sale_price?: string;
    regular_price?: string;
    currency?: string;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    stock_quantity?: number;
    categories?: string[];
    tags?: string[];
    attributes?: {
      name: string;
      value: string;
    }[];
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
  is_preview?: boolean;
  lesson_type?: 'video' | 'text' | 'assignment' | 'quiz';
}

interface Topic {
  id: number;
  title: string;
  content: string;
  lesson_id: number;
  course_id: number;
  order: number;
  duration?: string;
  is_preview?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  lesson_id?: number;
  time_limit?: number;
  total_marks?: number;
  passing_grade?: number;
  attempts_allowed?: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  course_id: number;
  lesson_id?: number;
  due_date?: string;
  total_marks?: number;
  passing_grade?: number;
}

interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'enrolled' | 'completed' | 'in_progress' | 'cancelled';
  enrollment_date: string;
  completion_date?: string;
  progress: number;
  certificate_issued?: boolean;
  certificate_url?: string;
  woocommerce_order_id?: number;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
}

interface WooCommerceOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  payment_method: string;
  payment_method_title: string;
  date_created: string;
  date_paid?: string;
  billing: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  line_items: {
    product_id: number;
    name: string;
    quantity: number;
    total: string;
    meta_data?: {
      key: string;
      value: string;
    }[];
  }[];
}

class TutorLmsService {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private woocommerceUrl: string;

  constructor() {
    this.baseUrl = 'https://api.helvetiforma.ch';
    this.apiKey = 'key_41b07de3d8e6e2d21df756ed2dff73ad';
    this.apiSecret = 'secret_c59d6489d2bb179380853bed081688c8d2a86b9e471f34ec44660359597f127f';
    this.woocommerceUrl = `${this.baseUrl}/wp-json/wc/v3`;
  }

  // Generic WordPress API call
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}/wp-json/wp/v2${endpoint}`;
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
      console.error('TutorLMS API Error:', error);
      throw error;
    }
  }

  private async tutorLmsCall(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1${endpoint}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling TutorLMS API ${endpoint}:`, error);
      throw error;
    }
  }

  // WooCommerce API call
  private async wooCommerceCall(endpoint: string, options: RequestInit = {}) {
    try {
      const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY;
      const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET;
      
      if (!consumerKey || !consumerSecret) {
        throw new Error('WooCommerce credentials not configured');
      }

      const url = `${this.woocommerceUrl}${endpoint}`;
      const auth = btoa(`${consumerKey}:${consumerSecret}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      throw error;
    }
  }

  // Get all courses with basic info
  async getCourses(): Promise<Course[]> {
    try {
      const courses = await this.apiCall('/courses?per_page=100&_embed');
      return courses.map(this.formatCourse);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Get single course with full details
  async getCourse(courseId: number): Promise<Course | null> {
    try {
      const course = await this.apiCall(`/courses/${courseId}?_embed`);
      return this.formatCourse(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  // Get course lessons (returns empty array if no lessons exist yet)
  async getCourseLessons(courseId: number): Promise<Lesson[]> {
    try {
      const lessons = await this.tutorLmsCall(`/lessons?course_id=${courseId}`);
      return Array.isArray(lessons) ? lessons.map(this.formatLesson) : [];
    } catch (error) {
      // If lessons endpoint doesn't exist yet, return empty array
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('rest_no_route'))) {
        console.log(`No lessons endpoint available yet for course ${courseId}`);
        return [];
      }
      console.error('Error fetching lessons:', error);
      return [];
    }
  }

  // Get course topics (returns empty array if no topics exist yet)
  async getCourseTopics(courseId: number): Promise<Topic[]> {
    try {
      const topics = await this.tutorLmsCall(`/topics?course_id=${courseId}`);
      return Array.isArray(topics) ? topics.map(this.formatTopic) : [];
    } catch (error) {
      // If topics endpoint doesn't exist yet, return empty array
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('rest_no_route'))) {
        console.log(`No topics endpoint available yet for course ${courseId}`);
        return [];
      }
      console.error('Error fetching topics:', error);
      return [];
    }
  }

  // Get course quizzes (returns empty array if no quizzes exist yet)
  async getCourseQuizzes(courseId: number): Promise<Quiz[]> {
    try {
      const quizzes = await this.tutorLmsCall(`/quizzes?course_id=${courseId}`);
      return Array.isArray(quizzes) ? quizzes.map(this.formatQuiz) : [];
    } catch (error) {
      // If quizzes endpoint doesn't exist yet, return empty array
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('rest_no_route'))) {
        console.log(`No quizzes endpoint available yet for course ${courseId}`);
        return [];
      }
      console.error('Error fetching quizzes:', error);
      return [];
    }
  }

  // Get course assignments (returns empty array if no assignments exist yet)
  async getCourseAssignments(courseId: number): Promise<Assignment[]> {
    try {
      const assignments = await this.tutorLmsCall(`/assignments?course_id=${courseId}`);
      return Array.isArray(assignments) ? assignments.map(this.formatAssignment) : [];
    } catch (error) {
      // If assignments endpoint doesn't exist yet, return empty array
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('rest_no_route'))) {
        console.log(`No assignments endpoint available yet for course ${courseId}`);
        return [];
      }
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  // Get user enrollments (returns empty array if no enrollments exist yet)
  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    try {
      const enrollments = await this.apiCall(`/enrollments?user=${userId}&per_page=100`);
      return enrollments.map(this.formatEnrollment);
    } catch (error) {
      // If enrollments endpoint doesn't exist yet, return empty array
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('rest_no_route'))) {
        console.log(`No enrollments endpoint available yet for user ${userId}`);
        return [];
      }
      console.error('Error fetching enrollments:', error);
      return [];
    }
  }

  // Enroll user in course (basic implementation for now)
  async enrollUser(userId: number, courseId: number, userData: any): Promise<boolean> {
    try {
      // For now, just log the enrollment attempt
      // In a real implementation, you'd create an enrollment record
      console.log('Enrollment attempt:', {
        userId,
        courseId,
        userData,
        timestamp: new Date().toISOString()
      });
      
      // TODO: Implement actual enrollment logic when endpoints are available
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      return false;
    }
  }

  // Update enrollment progress (basic implementation for now)
  async updateProgress(enrollmentId: number, progress: number): Promise<boolean> {
    try {
      // For now, just log the progress update
      console.log('Progress update:', {
        enrollmentId,
        progress,
        timestamp: new Date().toISOString()
      });
      
      // TODO: Implement actual progress update when endpoints are available
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
      const courses = await this.apiCall(`/courses?course-category=${categoryId}&per_page=100&_embed`);
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

      // Get lessons, topics, quizzes, and assignments counts
      const [lessons, topics, quizzes, assignments] = await Promise.all([
        this.getCourseLessons(courseId),
        this.getCourseTopics(courseId),
        this.getCourseQuizzes(courseId),
        this.getCourseAssignments(courseId)
      ]);

      return {
        total_enrolled: course.meta.course_enrolled || 0,
        capacity: course.meta.course_capacity || 0,
        availability: (course.meta.course_capacity || 0) - (course.meta.course_enrolled || 0),
        is_full: (course.meta.course_capacity || 0) > 0 && 
          (course.meta.course_enrolled || 0) >= (course.meta.course_capacity || 0),
        lessons_count: lessons.length,
        topics_count: topics.length,
        quiz_count: quizzes.length,
        assignments_count: assignments.length,
        has_certificate: course.meta.course_certificate || false
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return null;
    }
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

  // Get course categories
  async getCourseCategories(): Promise<any[]> {
    try {
      const categories = await this.apiCall('/course-category?per_page=100');
      return categories;
    } catch (error) {
      console.error('Error fetching course categories:', error);
      return [];
    }
  }

  // Get course tags
  async getCourseTags(): Promise<any[]> {
    try {
      const tags = await this.apiCall('/course-tag?per_page=100');
      return tags;
    } catch (error) {
      console.error('Error fetching course tags:', error);
      return [];
    }
  }

  // Format course data
  private formatCourse(course: any): Course {
    return {
      id: course.id,
      title: course.title?.rendered || course.title || '',
      content: course.content?.rendered || course.content || '',
      excerpt: course.excerpt?.rendered || course.excerpt || '',
      slug: course.slug,
      featured_image: course._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      categories: course['course-category'] || [],
      tags: course['course-tag'] || [],
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
        course_type: course.meta?.course_type || course.meta?.type || 'présentiel',
        course_lessons_count: course.meta?.course_lessons_count || 0,
        course_topics_count: course.meta?.course_topics_count || 0,
        course_quiz_count: course.meta?.course_quiz_count || 0,
        course_assignments_count: course.meta?.course_assignments_count || 0,
        course_certificate: course.meta?.course_certificate || false,
        course_access_duration: course.meta?.course_access_duration || 'lifetime'
      },
      woocommerce: undefined // Will be implemented when WooCommerce is set up
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
      attachments: lesson.meta?.attachments || [],
      is_preview: lesson.meta?.is_preview || false,
      lesson_type: lesson.meta?.lesson_type || 'text'
    };
  }

  // Format topic data
  private formatTopic(topic: any): Topic {
    return {
      id: topic.id,
      title: topic.title?.rendered || topic.title || '',
      content: topic.content?.rendered || topic.content || '',
      lesson_id: topic.lesson_id || topic.lesson || 0,
      course_id: topic.course_id || topic.course || 0,
      order: topic.menu_order || topic.order || 0,
      duration: topic.meta?.duration,
      is_preview: topic.meta?.is_preview || false
    };
  }

  // Format quiz data
  private formatQuiz(quiz: any): Quiz {
    return {
      id: quiz.id,
      title: quiz.title?.rendered || quiz.title || '',
      description: quiz.description || '',
      course_id: quiz.course_id || quiz.course || 0,
      lesson_id: quiz.lesson_id || quiz.lesson,
      time_limit: quiz.meta?.time_limit,
      total_marks: quiz.meta?.total_marks,
      passing_grade: quiz.meta?.passing_grade,
      attempts_allowed: quiz.meta?.attempts_allowed
    };
  }

  // Format assignment data
  private formatAssignment(assignment: any): Assignment {
    return {
      id: assignment.id,
      title: assignment.title?.rendered || assignment.title || '',
      description: assignment.description || '',
      course_id: assignment.course_id || assignment.course || 0,
      lesson_id: assignment.lesson_id || assignment.lesson,
      due_date: assignment.meta?.due_date,
      total_marks: assignment.meta?.total_marks,
      passing_grade: assignment.meta?.passing_grade
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
      progress: enrollment.progress || 0,
      certificate_issued: enrollment.certificate_issued || false,
      certificate_url: enrollment.certificate_url,
      woocommerce_order_id: enrollment.woocommerce_order_id,
      payment_status: enrollment.payment_status || 'pending'
    };
  }
}

// Create singleton instance
const tutorLmsService = new TutorLmsService();
export default tutorLmsService;
