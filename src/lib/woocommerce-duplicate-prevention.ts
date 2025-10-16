/**
 * WooCommerce Duplicate Order Prevention Utility
 * 
 * This utility helps prevent duplicate WooCommerce orders by checking for existing orders
 * with the same metadata before creating new ones.
 */

interface OrderCheckParams {
  customerId?: number;
  productId?: number;
  postId?: string;
  courseId?: string;
  paymentIntentId?: string;
  stripeSessionId?: string;
}

interface ExistingOrder {
  id: number;
  status: string;
  meta_data: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Check if a WooCommerce order already exists with the given criteria
 */
export async function checkForExistingOrder(params: OrderCheckParams): Promise<ExistingOrder | null> {
  const {
    customerId,
    productId,
    postId,
    courseId,
    paymentIntentId,
    stripeSessionId
  } = params;

  try {
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (customerId) {
      searchParams.append('customer', customerId.toString());
    }
    
    if (productId) {
      searchParams.append('product', productId.toString());
    }
    
    // Search for orders with specific metadata
    const metaQueries = [];
    
    if (postId) {
      metaQueries.push({
        key: '_post_id',
        value: postId
      });
    }
    
    if (courseId) {
      metaQueries.push({
        key: '_course_id',
        value: courseId
      });
    }
    
    if (paymentIntentId) {
      metaQueries.push({
        key: '_stripe_payment_intent_id',
        value: paymentIntentId
      });
    }
    
    if (stripeSessionId) {
      metaQueries.push({
        key: '_stripe_session_id',
        value: stripeSessionId
      });
    }

    // Search for orders with any of the metadata
    for (const metaQuery of metaQueries) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders?${searchParams.toString()}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
            ).toString('base64')}`
          }
        }
      );

      if (response.ok) {
        const orders: ExistingOrder[] = await response.json();
        
        // Check if any order has the specific metadata we're looking for
        for (const order of orders) {
          const hasMatchingMeta = order.meta_data.some(meta => 
            meta.key === metaQuery.key && meta.value === metaQuery.value
          );
          
          if (hasMatchingMeta) {
            console.log(`🔍 Found existing order ${order.id} with ${metaQuery.key}: ${metaQuery.value}`);
            return order;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error checking for existing orders:', error);
    return null;
  }
}

/**
 * Check for existing article orders
 */
export async function checkForExistingArticleOrder(
  customerId: number,
  postId: string,
  productId?: number,
  paymentIntentId?: string,
  stripeSessionId?: string
): Promise<ExistingOrder | null> {
  return checkForExistingOrder({
    customerId,
    productId,
    postId,
    paymentIntentId,
    stripeSessionId
  });
}

/**
 * Check for existing course orders
 */
export async function checkForExistingCourseOrder(
  customerId: number,
  courseId: string,
  productId?: number,
  paymentIntentId?: string
): Promise<ExistingOrder | null> {
  return checkForExistingOrder({
    customerId,
    productId,
    courseId,
    paymentIntentId
  });
}

/**
 * Log order creation attempt with duplicate check
 */
export function logOrderCreationAttempt(
  type: 'article' | 'course',
  params: OrderCheckParams,
  existingOrder: ExistingOrder | null
) {
  const identifier = type === 'article' ? params.postId : params.courseId;
  
  if (existingOrder) {
    console.log(`⚠️  DUPLICATE PREVENTION: ${type} order already exists for ${identifier}`);
    console.log(`   Existing order ID: ${existingOrder.id}, Status: ${existingOrder.status}`);
    console.log(`   Skipping order creation to prevent duplicate`);
  } else {
    console.log(`✅ No existing ${type} order found for ${identifier}, proceeding with creation`);
  }
}
