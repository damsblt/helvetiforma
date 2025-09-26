// Enrollment Sync Service
// Syncs WooCommerce enrollment orders to TutorLMS when authentication is available

export interface EnrollmentOrder {
  id: number;
  customer_id: number;
  course_id: number;
  date_created: string;
  status: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

class EnrollmentSyncService {
  private baseUrl: string;
  private wooAuth: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    this.wooAuth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b'}:${process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076'}`
    ).toString('base64');
  }

  // Get all enrollment orders from WooCommerce
  async getEnrollmentOrders(): Promise<EnrollmentOrder[]> {
    try {
      const ordersUrl = new URL(`${this.baseUrl}/wp-json/wc/v3/orders`);
      ordersUrl.searchParams.set('per_page', '100');
      ordersUrl.searchParams.set('orderby', 'date');
      ordersUrl.searchParams.set('order', 'desc');

      const response = await fetch(ordersUrl.toString(), {
        headers: {
          'Authorization': `Basic ${this.wooAuth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const orders = await response.json();
      
      // Filter for enrollment orders
      return orders.filter((order: any) => 
        order.payment_method === 'helvetiforma_enrollment' ||
        order.meta_data?.some((meta: any) => meta.key === '_helvetiforma_enrollment')
      ).map((order: any) => {
        const courseIdMeta = order.meta_data?.find((meta: any) => meta.key === '_enrollment_course_id');
        return {
          id: order.id,
          customer_id: order.customer_id,
          course_id: parseInt(courseIdMeta?.value || '0'),
          date_created: order.date_created,
          status: order.status,
          billing: order.billing
        };
      }).filter((order: EnrollmentOrder) => order.course_id > 0);
    } catch (error) {
      console.error('Error fetching enrollment orders:', error);
      return [];
    }
  }

  // Test TutorLMS API authentication
  async testTutorLMSAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/courses`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`admin:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Sync enrollment to TutorLMS
  async syncEnrollmentToTutorLMS(userId: number, courseId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/tutor/v1/enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`admin:${process.env.WORDPRESS_APP_PASSWORD || 'your-app-password'}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.code === 'tutor_enrollment_created' || 
               responseData.code === 'success' || 
               responseData.success === true ||
               !!responseData.data;
      }

      return false;
    } catch (error) {
      console.error('Error syncing enrollment to TutorLMS:', error);
      return false;
    }
  }

  // Sync all enrollment orders to TutorLMS
  async syncAllEnrollments(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      message: '',
      syncedCount: 0,
      failedCount: 0,
      errors: []
    };

    try {
      console.log('🔄 Starting enrollment sync...');

      // Test authentication first
      const authWorking = await this.testTutorLMSAuth();
      if (!authWorking) {
        result.message = 'TutorLMS API authentication not working. Please fix WordPress App Password.';
        result.errors.push('Authentication failed');
        return result;
      }

      // Get all enrollment orders
      const enrollmentOrders = await this.getEnrollmentOrders();
      console.log(`📊 Found ${enrollmentOrders.length} enrollment orders to sync`);

      if (enrollmentOrders.length === 0) {
        result.success = true;
        result.message = 'No enrollment orders found to sync';
        return result;
      }

      // Sync each enrollment
      for (const order of enrollmentOrders) {
        try {
          console.log(`🔄 Syncing enrollment: User ${order.customer_id} → Course ${order.course_id}`);
          
          const syncSuccess = await this.syncEnrollmentToTutorLMS(order.customer_id, order.course_id);
          
          if (syncSuccess) {
            result.syncedCount++;
            console.log(`✅ Synced: User ${order.customer_id} → Course ${order.course_id}`);
          } else {
            result.failedCount++;
            result.errors.push(`Failed to sync User ${order.customer_id} → Course ${order.course_id}`);
            console.log(`❌ Failed: User ${order.customer_id} → Course ${order.course_id}`);
          }
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Error syncing User ${order.customer_id} → Course ${order.course_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`❌ Error syncing User ${order.customer_id} → Course ${order.course_id}:`, error);
        }
      }

      result.success = result.failedCount === 0;
      result.message = `Sync completed: ${result.syncedCount} successful, ${result.failedCount} failed`;

      console.log(`🎉 Sync completed: ${result.syncedCount} successful, ${result.failedCount} failed`);

    } catch (error) {
      result.message = `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Sync failed:', error);
    }

    return result;
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    totalEnrollments: number;
    authWorking: boolean;
    lastSync?: string;
  }> {
    const enrollmentOrders = await this.getEnrollmentOrders();
    const authWorking = await this.testTutorLMSAuth();

    return {
      totalEnrollments: enrollmentOrders.length,
      authWorking,
      lastSync: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const enrollmentSyncService = new EnrollmentSyncService();
export default enrollmentSyncService;
