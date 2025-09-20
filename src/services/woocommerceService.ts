import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';

export class WooCommerceService {
  private baseUrl: string;
  private auth: string;

  constructor() {
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
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getProducts error:', error);
      throw error;
    }
  }

  // Get single product
  async getProduct(productId: number) {
    try {
      console.log('WooCommerce getProduct: Fetching product', productId, 'from', `${this.baseUrl}/products/${productId}`);
      
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('WooCommerce getProduct response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WooCommerce API error response:', errorText);
        throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
      }

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
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce createProduct error:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId: number, productData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorData.message}`);
      }

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
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getOrders error:', error);
      throw error;
    }
  }

  // Create order
  async createOrder(orderData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorData.message}`);
      }

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
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getCustomers error:', error);
      throw error;
    }
  }

  // Create customer
  async createCustomer(customerData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorData.message}`);
      }

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
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce getCategories error:', error);
      throw error;
    }
  }

  // Create product category
  async createCategory(categoryData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/products/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WooCommerce API error: ${response.status} - ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WooCommerce createCategory error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const wooCommerceService = new WooCommerceService();
