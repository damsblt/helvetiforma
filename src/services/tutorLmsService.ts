///–………………………………………………………ﬁ m// Tutor LMS Pro API Service
// Handles all Tutor LMS API calls for dashboards and course management

export interface TutorCourse {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  author: number;
  featured_media: number;
  date: string;
  modified: string;
  slug: string;
  categories: number[];
  tags: number[];
  meta: {
    course_duration: string;
    course_level: string;
    course_price: string;
    course_rating: number;
    course_students_count: number;
  };
}

export interface TutorStudent {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  registered_date: string;
  last_activity: string;
  courses_count: number;
  completed_courses: number;
}

export interface TutorEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  enrolled_date: string;
  completed_date?: string;
  progress: number;
}

export interface TutorStats {
  total_courses: number;
  total_students: number;
  total_enrollments: number;
  active_courses: number;
  completed_courses: number;
  revenue: number;
}

class TutorLmsService {
  private baseUrl: string;
  private clientId: string;
  private secretKey: string;

  constructor() {
    this.baseUrl = process.env.TUTOR_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    this.clientId = process.env.TUTOR_CLIENT_ID || '';
    this.secretKey = process.env.TUTOR_SECRET_KEY || '';
    
    console.log('TutorLmsService initialized with:', {
      baseUrl: this.baseUrl,
      hasClientId: !!this.clientId,
      hasSecretKey: !!this.secretKey,
      wordpressAppPassword: process.env.WORDPRESS_APP_PASSWORD ? 'SET' : 'NOT SET'
    });
  }

  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    // Use WordPress App Password with admin user as primary method
    const tutorAuth = `Basic ${Buffer.from(`admin:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`;
    
    return {
      'Authorization': tutorAuth,
      'Content-Type': 'application/json'
    };
  }

  // Get all courses
  async getCourses(): Promise<TutorCourse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/courses`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.code !== 'success') {
        throw new Error('Failed to fetch courses');
      }
      
      return data.data.posts.map((course: any) => ({
        id: course.ID,
        title: course.post_title,
        content: course.post_content,
        excerpt: course.post_excerpt,
        status: course.post_status,
        author: course.post_author.ID,
        featured_media: course.thumbnail_url ? 1 : 0,
        date: course.post_date,
        modified: course.post_modified,
        slug: course.post_name,
        categories: course.course_category?.map((cat: any) => cat.term_id) || [],
        tags: course.course_tag?.map((tag: any) => tag.term_id) || [],
        meta: {
          course_duration: course.additional_info?.course_duration?.[0] ? 
            `${course.additional_info.course_duration[0].hours}h ${course.additional_info.course_duration[0].minutes}min` : 'N/A',
          course_level: course.additional_info?.course_level?.[0] || 'N/A',
          course_price: course.price || 'Free',
          course_rating: course.ratings?.rating_avg || 0,
          course_students_count: 0 // This would need to be fetched separately
        }
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Get course by ID
  async getCourse(courseId: number): Promise<TutorCourse | null> {
    try {
      // First, get the course from the courses list (same approach as working API)
      const coursesResponse = await fetch(`${this.baseUrl}/wp-json/tutor/v1/courses`, {
        headers: this.getAuthHeaders()
      });

      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses list: ${coursesResponse.statusText}`);
      }

      const coursesData = await coursesResponse.json();
      const courses = coursesData.data?.posts || [];
      const course = courses.find((c: any) => c.ID == courseId);

      if (!course) {
        return null;
      }

      // Transform the course data to match our interface
      return {
        id: course.ID,
        title: course.post_title,
        content: course.post_content,
        excerpt: course.post_excerpt,
        status: course.post_status,
        author: course.post_author?.ID || 0,
        featured_media: course.thumbnail_url ? 1 : 0,
        date: course.post_date,
        modified: course.post_modified,
        slug: course.post_name,
        categories: course.course_category?.map((cat: any) => cat.term_id) || [],
        tags: course.course_tag?.map((tag: any) => tag.term_id) || [],
        meta: {
          course_duration: course.additional_info?.course_duration?.[0] ? 
            `${course.additional_info.course_duration[0].hours}h ${course.additional_info.course_duration[0].minutes}min` : 'N/A',
          course_level: course.additional_info?.course_level?.[0] || 'N/A',
          course_price: course.price || 'Free',
          course_rating: course.ratings?.rating_avg || 0,
          course_students_count: 0 // This would need to be fetched separately
        }
      };
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  // Get all students (admin only) - students enrolled via WooCommerce orders
  async getStudents(): Promise<TutorStudent[]> {
    try {
      console.log('Fetching students from WooCommerce enrollment orders...');
      
      // Get WooCommerce enrollment orders
      const wooAuth = Buffer.from(
        `${process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b'}:${process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076'}`
      ).toString('base64');

      const ordersUrl = new URL(`${this.baseUrl}/wp-json/wc/v3/orders`);
      ordersUrl.searchParams.set('per_page', '100');
      ordersUrl.searchParams.set('orderby', 'date');
      ordersUrl.searchParams.set('order', 'desc');

      const ordersResponse = await fetch(ordersUrl.toString(), {
        headers: {
          'Authorization': `Basic ${wooAuth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
      }

      const orders = await ordersResponse.json();
      console.log('WooCommerce orders fetched:', orders.length);
      
      // Filter for enrollment orders
      const enrollmentOrders = orders.filter((order: any) => 
        order.payment_method === 'helvetiforma_enrollment' ||
        order.meta_data?.some((meta: any) => meta.key === '_helvetiforma_enrollment')
      );
      
      console.log('Enrollment orders found:', enrollmentOrders.length);
      
      // Get unique students from enrollment orders
      const studentMap = new Map();
      
      for (const order of enrollmentOrders) {
        const userId = order.customer_id;
        const enrollmentMeta = order.meta_data?.find((meta: any) => meta.key === '_enrollment_course_id');
        const courseId = enrollmentMeta?.value;
        
        if (userId && courseId) {
          if (!studentMap.has(userId)) {
            studentMap.set(userId, {
              id: userId,
              name: order.billing?.first_name && order.billing?.last_name 
                ? `${order.billing.first_name} ${order.billing.last_name}` 
                : order.billing?.first_name || 'Unknown',
              email: order.billing?.email || 'Unknown',
              avatar_url: '',
              registered_date: order.date_created,
              last_activity: order.date_modified,
              courses_count: 0,
              completed_courses: 0,
              courses: new Set()
            });
          }
          
          const student = studentMap.get(userId);
          student.courses.add(courseId);
          student.courses_count = student.courses.size;
        }
      }
      
      const students = Array.from(studentMap.values()).map(student => ({
        ...student,
        courses: undefined // Remove the Set from the final object
      }));
      
      console.log('Students from enrollment orders:', students.length, students.map(s => ({ id: s.id, name: s.name, courses_count: s.courses_count })));
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  // Get student by ID
  async getStudent(studentId: number): Promise<TutorStudent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/students/${studentId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student: ${response.statusText}`);
      }

      const student = await response.json();
      return {
        id: student.id,
        name: student.display_name || student.user_login,
        email: student.user_email,
        avatar_url: student.avatar_url || '',
        registered_date: student.user_registered,
        last_activity: student.last_activity || 'N/A',
        courses_count: student.courses_count || 0,
        completed_courses: student.completed_courses || 0
      };
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  }

  // Get enrollments - fetch from all courses
  async getEnrollments(): Promise<TutorEnrollment[]> {
    try {
      // First get all courses
      const courses = await this.getCourses();
      const allEnrollments: TutorEnrollment[] = [];

      // Fetch enrollments for each course
      for (const course of courses) {
        try {
          const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/enrollments?course_id=${course.id}`, {
            headers: this.getAuthHeaders()
          });

          if (response.ok) {
            const data = await response.json();
            if (data.code === 'tutor_read_enrollment' && data.data) {
              const courseEnrollments = data.data.map((enrollment: any) => ({
                id: parseInt(enrollment.enrol_id),
                user_id: parseInt(enrollment.student_id),
                course_id: parseInt(enrollment.course_id),
                status: enrollment.status,
                enrolled_date: enrollment.enrol_date,
                completed_date: enrollment.status === 'completed' ? enrollment.enrol_date : undefined,
                progress: enrollment.status === 'completed' ? 100 : 0
              }));
              allEnrollments.push(...courseEnrollments);
            }
          }
        } catch (courseError) {
          console.error(`Error fetching enrollments for course ${course.id}:`, courseError);
        }
      }

      return allEnrollments;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  }

  // Get student's enrollments
  async getStudentEnrollments(studentId: number): Promise<TutorEnrollment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/enrollments?user_id=${studentId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student enrollments: ${response.statusText}`);
      }

      const enrollments = await response.json();
      return enrollments.map((enrollment: any) => ({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        status: enrollment.status,
        enrolled_date: enrollment.enrolled_date,
        completed_date: enrollment.completed_date,
        progress: enrollment.progress || 0
      }));
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      return [];
    }
  }

  // Get course enrollments
  async getCourseEnrollments(courseId: number): Promise<TutorEnrollment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/enrollments?course_id=${courseId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course enrollments: ${response.statusText}`);
      }

      const enrollments = await response.json();
      return enrollments.map((enrollment: any) => ({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        status: enrollment.status,
        enrolled_date: enrollment.enrolled_date,
        completed_date: enrollment.completed_date,
        progress: enrollment.progress || 0
      }));
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      return [];
    }
  }

  // Get course categories
  async getCourseCategories(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/course-category`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const categories = await response.json();
      return categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category.count
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get course lessons
  async getCourseLessons(courseId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/lessons?course_id=${courseId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  }

  // Get course topics
  async getCourseTopics(courseId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/topics?course_id=${courseId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  }

  // Get course quizzes
  async getCourseQuizzes(courseId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/quizzes?course_id=${courseId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  }

  // Get course statistics
  async getCourseStats(courseId: number): Promise<any> {
    try {
      // Get enrollments for this course
      const enrollments = await this.getCourseEnrollments(courseId);
      
      return {
        total_enrollments: enrollments.length,
        completed_enrollments: enrollments.filter(e => e.status === 'completed').length,
        in_progress_enrollments: enrollments.filter(e => e.status === 'enrolled' && e.progress < 100).length,
        average_progress: enrollments.length > 0 
          ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
          : 0
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return {
        total_enrollments: 0,
        completed_enrollments: 0,
        in_progress_enrollments: 0,
        average_progress: 0
      };
    }
  }

  // Get student dashboard data
  async getStudentDashboard(studentId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/students/${studentId}/dashboard`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student dashboard: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return {};
    }
  }

  // Get student order history
  async getStudentOrderHistory(studentId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/students/${studentId}/order-histories`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student order history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching student order history:', error);
      return [];
    }
  }

  // Get student calendar
  async getStudentCalendar(studentId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/students/${studentId}/calendar`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student calendar: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching student calendar:', error);
      return [];
    }
  }

  // Get subscriptions (for subscription workflow)
  async getSubscriptions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/subscriptions`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }

  // Create subscription
  async createSubscription(subscriptionData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/subscriptions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create subscription: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getStats(): Promise<TutorStats> {
    try {
      const [courses, students, enrollments] = await Promise.all([
        this.getCourses(),
        this.getStudents(),
        this.getEnrollments()
      ]);

      const activeCourses = courses.filter(course => course.status === 'publish').length;
      const completedEnrollments = enrollments.filter(enrollment => enrollment.status === 'completed').length;

      return {
        total_courses: courses.length,
        total_students: students.length,
        total_enrollments: enrollments.length,
        active_courses: activeCourses,
        completed_courses: completedEnrollments,
        revenue: 0 // This would need to be calculated based on course prices
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total_courses: 0,
        total_students: 0,
        total_enrollments: 0,
        active_courses: 0,
        completed_courses: 0,
        revenue: 0
      };
    }
  }

  // Enroll student in course
  async enrollStudent(userId: number, courseId: number): Promise<boolean> {
    try {
      console.log(`🔐 Attempting to enroll user ${userId} in course ${courseId}...`);
      // Direct TutorLMS enrollment via REST (primary path)
      console.log(`📡 Enrolling via TutorLMS REST...`);
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ user_id: userId, course_id: courseId })
      });

      if (!response.ok) {
        console.error(`❌ TutorLMS enrollment failed with status ${response.status}`);
        return false;
      }

      const responseData = await response.json();
      console.log(`✅ TutorLMS enrollment success:`, responseData);
      return true;
      
    } catch (error) {
      console.error('❌ Error enrolling student:', error);
      return false;
    }
  }

  // Fallback method: Enroll student directly using WordPress database
  private async enrollStudentDirectly(userId: number, courseId: number): Promise<boolean> {
    try {
      console.log(`🔧 Attempting direct database enrollment for user ${userId} in course ${courseId}...`);
      
      // Use WooCommerce API to create a simple enrollment record
      // This is a workaround since we can't access the TutorLMS database directly
      const wooAuth = Buffer.from(
        `${process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b'}:${process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076'}`
      ).toString('base64');

      // Create a simple order item that represents the enrollment
      const enrollmentData = {
        payment_method: 'helvetiforma_enrollment',
        payment_method_title: 'HelvetiForma Enrollment',
        set_paid: true,
        status: 'completed',
        customer_id: userId,
        line_items: [
          {
            product_id: courseId, // Use course ID as product ID for tracking
            quantity: 1,
            name: `Course Enrollment - ${courseId}`
          }
        ],
        meta_data: [
          {
            key: '_helvetiforma_enrollment',
            value: 'yes'
          },
          {
            key: '_enrollment_course_id',
            value: courseId.toString()
          },
          {
            key: '_enrollment_user_id',
            value: userId.toString()
          }
        ]
      };

      const orderResponse = await fetch(`${this.baseUrl}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${wooAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enrollmentData)
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        console.log(`✅ Direct enrollment successful! Order created: ${orderData.id}`);
        return true;
      } else {
        const errorData = await orderResponse.json().catch(() => ({}));
        console.error(`❌ Direct enrollment failed:`, errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in direct enrollment:', error);
      return false;
    }
  }

  // Update enrollment status
  async updateEnrollmentStatus(enrollmentId: number, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          status: status
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tutorLmsService = new TutorLmsService();
export default tutorLmsService;