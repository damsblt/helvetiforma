// WooCommerce Service with enhanced error handling and retry logic for Vercel

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';

// Environment validation
const validateEnvironment = () => {
  const required = [
    'WOOCOMMERCE_CONSUMER_KEY',
    'WOOCOMMERCE_CONSUMER_SECRET',
    'NEXT_PUBLIC_WORDPRESS_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Enhanced error handling
const handleWooCommerceError = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `WooCommerce API error: ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `${errorMessage} - ${errorText}`;
    }
    
    // Log specific error types
    switch (response.status) {
      case 401:
        console.error('Authentication failed - check API credentials');
        break;
      case 403:
        console.error('Access forbidden - check API permissions');
        break;
      case 404:
        console.error('Resource not found - check endpoint URL');
        break;
      case 429:
        console.error('Rate limit exceeded - implement retry logic');
        break;
      case 500:
        console.error('WooCommerce server error - check WordPress logs');
        break;
    }
    
    throw new Error(errorMessage);
  }
};

// Rate limiting and retry logic
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      if (response.ok) return response;
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * Math.pow(2, i);
        console.log(`Rate limited, retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('All retry attempts failed');
};

// Performance monitoring
const trackApiPerformance = async (apiCall: () => Promise<Response>) => {
  const start = Date.now();
  try {
    const response = await apiCall();
    const duration = Date.now() - start;
    console.log(`API call completed in ${duration}ms`);
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`API call failed after ${duration}ms:`, error);
    throw error;
  }
};

export class WooCommerceService {
  private baseUrl: string;
  private auth: string;

  constructor() {
    // Validate environment variables
    validateEnvironment();
    
    this.baseUrl = `${WORDPRESS_URL}/wp-json/wc/v3`;
    this.auth = Buffer.from(
      `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
    
    console.log('WooCommerceService initialized:', {
      baseUrl: this.baseUrl,
      hasConsumerKey: !!WOOCOMMERCE_CONSUMER_KEY,
      hasConsumerSecret: !!WOOCOMMERCE_CONSUMER_SECRET,
      authLength: this.auth.length
    });
  }

  // Enhanced headers for better Vercel compatibility
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Helvetiforma-API/1.0',
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
  }

  // Get all products
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    status?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);

      const url = `${this.baseUrl}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('WooCommerceService - Fetching URL:', url);
      console.log('WooCommerceService - Auth header length:', this.auth.length);
      
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(url, {
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(15000), // Increased timeout for Vercel
        });
      });
      
      console.log('WooCommerceService - Response status:', response.status);
      console.log('WooCommerceService - Response headers:', Object.fromEntries(response.headers.entries()));

      await handleWooCommerceError(response);

      const data = await response.json();
      console.log('WooCommerceService - Successfully fetched products:', data.length);
      return data;
    } catch (error) {
      console.error('WooCommerce getProducts error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('WooCommerce API timeout - request took too long');
        }
        if (error.message.includes('ENOTFOUND') || error.message.includes('fetch failed')) {
          throw new Error('WooCommerce API not accessible - network error');
        }
        if (error.message.includes('Missing required environment variables')) {
          throw new Error('WooCommerce API configuration error - check environment variables');
        }
      }
      
      throw error;
    }
  }

  // Get single product
  async getProduct(productId: number) {
    try {
      console.log('WooCommerce getProduct: Fetching product', productId, 'from', `${this.baseUrl}/products/${productId}`);
      
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(`${this.baseUrl}/products/${productId}`, {
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(15000),
        });
      });

      console.log('WooCommerce getProduct response status:', response.status);

      await handleWooCommerceError(response);

      const product = await response.json();
      console.log('WooCommerce getProduct success:', product?.id, product?.name);
      return product;
    } catch (error) {
      console.error('WooCommerce getProduct error:', error);
      throw error;
    }
  }

  // Create product
  async createProduct(productData: any) {
    try {
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(`${this.baseUrl}/products`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(productData),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce createProduct error:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId: number, productData: any) {
    try {
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(`${this.baseUrl}/products/${productId}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(productData),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce updateProduct error:', error);
      throw error;
    }
  }

  // Get orders
  async getOrders(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    customer?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.customer) queryParams.append('customer', params.customer.toString());

      const url = `${this.baseUrl}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(url, {
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getOrders error:', error);
      throw error;
    }
  }

  // Create order
  async createOrder(orderData: any) {
    try {
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(`${this.baseUrl}/orders`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(orderData),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce createOrder error:', error);
      throw error;
    }
  }

  // Get customers
  async getCustomers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    email?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.email) queryParams.append('email', params.email);

      const url = `${this.baseUrl}/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(url, {
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getCustomers error:', error);
      throw error;
    }
  }

  // Create customer
  async createCustomer(customerData: any) {
    try {
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(`${this.baseUrl}/customers`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(customerData),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce createCustomer error:', error);
      throw error;
    }
  }

  // Get product categories
  async getCategories(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${this.baseUrl}/products/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(url, {
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getCategories error:', error);
      throw error;
    }
  }

  // Create product category
  async createCategory(categoryData: any) {
    try {
      const response = await trackApiPerformance(async () => {
        return await fetchWithRetry(`${this.baseUrl}/products/categories`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(categoryData),
          signal: AbortSignal.timeout(15000),
        });
      });

      await handleWooCommerceError(response);

      return await response.json();
    } catch (error) {
      console.error('WooCommerce createCategory error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const wooCommerceService = new WooCommerceService();
