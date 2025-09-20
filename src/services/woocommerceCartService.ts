import { authService } from './authService';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';

export interface WooCommerceCartItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  total: number;
  image: string;
  course_id?: string;
  course_duration?: string;
  course_level?: string;
  variation_id?: number;
  variation?: any[];
  cart_item_data?: any;
}

export interface WooCommerceCart {
  items: WooCommerceCartItem[];
  total: number;
  currency: string;
  item_count: number;
}

export class WooCommerceCartService {
  private baseUrl: string;
  private auth: string;

  constructor() {
    this.baseUrl = `${WORDPRESS_URL}/wp-json/wc/v3`;
    this.auth = Buffer.from(
      `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
  }

  // Get cart from WooCommerce (using session/customer data)
  async getCart(): Promise<WooCommerceCart> {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return {
          items: [],
          total: 0,
          currency: 'CHF',
          item_count: 0
        };
      }

      // For now, we'll use localStorage as WooCommerce doesn't have a direct cart API
      // In production, you'd implement this with WooCommerce sessions or custom endpoints
      const cartData = localStorage.getItem('helvetiforma-cart');
      
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        // Ensure the cart has the correct structure for the frontend
        return this.normalizeCartData(parsedCart);
      }

      return {
        items: [],
        total: 0,
        currency: 'CHF',
        item_count: 0
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId: number, quantity: number = 1): Promise<WooCommerceCart> {
    try {
      console.log('WooCommerceCartService: Adding product to cart', { productId, quantity });
      
      // Use server-side API to get product details
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to add product to cart`);
      }

      const result = await response.json();
      console.log('API success response:', result);
      const cartItem = result.data;

      // Get current cart
      const currentCart = await this.getCart();
      console.log('Current cart before update:', currentCart);
      
      // Check if item already exists
      const existingItemIndex = currentCart.items.findIndex(
        item => item.product_id === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        currentCart.items[existingItemIndex].quantity += quantity;
        // Update total for this item
        currentCart.items[existingItemIndex].total = 
          currentCart.items[existingItemIndex].quantity * cartItem.price;
      } else {
        // Add new item with proper structure
        currentCart.items.push(cartItem);
      }

      // Recalculate totals
      await this.calculateCartTotals(currentCart);

      // Save to localStorage (in production, save to WooCommerce session)
      if (typeof window !== 'undefined') {
        localStorage.setItem('helvetiforma-cart', JSON.stringify(currentCart));
      }

      console.log('Final cart after update:', currentCart);
      return currentCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error(`Erreur lors de l'ajout du produit au panier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update cart item quantity
  async updateCartItem(productId: number, quantity: number): Promise<WooCommerceCart> {
    try {
      const currentCart = await this.getCart();
      
      const itemIndex = currentCart.items.findIndex(
        item => item.product_id === productId
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          // Remove item
          currentCart.items.splice(itemIndex, 1);
        } else {
          // Update quantity and recalculate total for this item
          currentCart.items[itemIndex].quantity = quantity;
          currentCart.items[itemIndex].total = 
            currentCart.items[itemIndex].quantity * currentCart.items[itemIndex].price;
        }

        // Recalculate totals
        await this.calculateCartTotals(currentCart);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('helvetiforma-cart', JSON.stringify(currentCart));
        }
      }

      return currentCart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(productId: number): Promise<WooCommerceCart> {
    try {
      const currentCart = await this.getCart();
      
      currentCart.items = currentCart.items.filter(
        item => item.product_id !== productId
      );

      // Recalculate totals
      await this.calculateCartTotals(currentCart);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('helvetiforma-cart', JSON.stringify(currentCart));
      }

      return currentCart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear cart
  async clearCart(): Promise<WooCommerceCart> {
    try {
      const emptyCart: WooCommerceCart = {
        items: [],
        total: 0,
        currency: 'CHF',
        item_count: 0
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('helvetiforma-cart', JSON.stringify(emptyCart));
      }
      return emptyCart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }


  // Normalize cart data to ensure proper structure
  private normalizeCartData(cart: any): WooCommerceCart {
    // Ensure all items have the required properties
    const normalizedItems = cart.items?.map((item: any) => ({
      product_id: item.product_id || 0,
      quantity: item.quantity || 0,
      name: item.name || 'Unknown Product',
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
      total: typeof item.total === 'number' ? item.total : parseFloat(item.total || '0'),
      image: item.image || '',
      course_id: item.course_id || '',
      course_duration: item.course_duration || '',
      course_level: item.course_level || '',
      variation_id: item.variation_id,
      variation: item.variation,
      cart_item_data: item.cart_item_data
    })) || [];

    return {
      items: normalizedItems,
      total: typeof cart.total === 'number' ? cart.total : parseFloat(cart.total || '0'),
      currency: cart.currency || 'CHF',
      item_count: typeof cart.item_count === 'number' ? cart.item_count : parseInt(cart.item_count || '0')
    };
  }

  // Calculate cart totals
  private async calculateCartTotals(cart: WooCommerceCart): Promise<void> {
    try {
      let total = 0;
      let itemCount = 0;

      for (const item of cart.items) {
        // Use existing total if available, otherwise calculate
        if (item.total && typeof item.total === 'number') {
          total += item.total;
        } else {
          const itemTotal = item.price * item.quantity;
          item.total = itemTotal;
          total += itemTotal;
        }
        itemCount += item.quantity;
      }

      cart.total = total;
      cart.item_count = itemCount;
    } catch (error) {
      console.error('Error calculating cart totals:', error);
      throw error;
    }
  }

  // Create order from cart
  async createOrder(cart: WooCommerceCart, customerData: any): Promise<any> {
    try {
      const orderData = {
        payment_method: 'bacs',
        payment_method_title: 'Direct Bank Transfer',
        set_paid: false,
        billing: {
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone || '',
          company: customerData.company || '',
          address_1: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          postcode: customerData.postcode || '',
          country: customerData.country || 'CH'
        },
        line_items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping: {
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          address_1: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          postcode: customerData.postcode || '',
          country: customerData.country || 'CH'
        }
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Order creation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const wooCommerceCartService = new WooCommerceCartService();
