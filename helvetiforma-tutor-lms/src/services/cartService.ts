// Shopping Cart Service for Course Management

export interface CartItem {
  course_id: number;
  title: string;
  price: number;
  sale_price?: number;
  featured_image?: string;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  currency: string;
}

class CartService {
  private storageKey = 'helvetiforma_cart';

  // Get current cart
  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], total: 0, currency: 'CHF' };
    }

    try {
      const cartData = localStorage.getItem(this.storageKey);
      if (cartData) {
        const cart = JSON.parse(cartData);
        return {
          ...cart,
          total: this.calculateTotal(cart.items)
        };
      }
    } catch (error) {
      console.error('Error reading cart:', error);
    }

    return { items: [], total: 0, currency: 'CHF' };
  }

  // Add item to cart
  addToCart(item: CartItem): Cart {
    const cart = this.getCart();
    
    // Check if item already exists
    const existingIndex = cart.items.findIndex(cartItem => cartItem.course_id === item.course_id);
    
    if (existingIndex === -1) {
      // Add new item
      cart.items.push(item);
    } else {
      // Item already exists, don't add duplicates for courses
      console.log('Course already in cart');
      return cart;
    }

    cart.total = this.calculateTotal(cart.items);
    this.saveCart(cart);
    
    // Dispatch custom event for cart updates
    this.dispatchCartUpdate(cart);
    
    return cart;
  }

  // Remove item from cart
  removeFromCart(courseId: number): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.course_id !== courseId);
    cart.total = this.calculateTotal(cart.items);
    
    this.saveCart(cart);
    this.dispatchCartUpdate(cart);
    
    return cart;
  }

  // Clear entire cart
  clearCart(): Cart {
    const emptyCart = { items: [], total: 0, currency: 'CHF' };
    this.saveCart(emptyCart);
    this.dispatchCartUpdate(emptyCart);
    return emptyCart;
  }

  // Check if course is in cart
  isInCart(courseId: number): boolean {
    const cart = this.getCart();
    return cart.items.some(item => item.course_id === courseId);
  }

  // Get cart item count
  getItemCount(): number {
    const cart = this.getCart();
    return cart.items.length;
  }

  // Calculate total price
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const price = item.sale_price || item.price;
      return total + price;
    }, 0);
  }

  // Save cart to localStorage
  private saveCart(cart: Cart): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }

  // Dispatch cart update event
  private dispatchCartUpdate(cart: Cart): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    }
  }

  // Subscribe to cart updates
  onCartUpdate(callback: (cart: Cart) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('cartUpdated', handler as EventListener);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('cartUpdated', handler as EventListener);
    };
  }
}

export const cartService = new CartService();
