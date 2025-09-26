'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { wooCommerceCartService } from '@/services/woocommerceCartService';

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
  course_id?: string;
  course_duration?: string;
  course_level?: string;
}

interface Cart {
  items: CartItem[];
  total: number;
  currency: string;
  item_count: number;
}

interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { product_id: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

const initialState: CartState = {
  cart: {
    items: [],
    total: 0,
    currency: 'CHF',
    item_count: 0
  },
  loading: false,
  error: null,
  isOpen: false
};

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, loading: action.payload };
      break;
    
    case 'SET_ERROR':
      newState = { ...state, error: action.payload, loading: false };
      break;
    
    case 'SET_CART':
      newState = { ...state, cart: action.payload, loading: false, error: null };
      break;
    
    case 'ADD_ITEM': {
      const existingItem = state.cart.items.find(item => item.product_id === action.payload.product_id);
      
      if (existingItem) {
        const updatedItems = state.cart.items.map(item =>
          item.product_id === action.payload.product_id
            ? { ...item, quantity: item.quantity + action.payload.quantity, total: item.price * (item.quantity + action.payload.quantity) }
            : item
        );
        
        const total = updatedItems.reduce((sum, item) => sum + item.total, 0);
        const item_count = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        newState = {
          ...state,
          cart: { ...state.cart, items: updatedItems, total, item_count }
        };
      } else {
        const newItems = [...state.cart.items, action.payload];
        const total = newItems.reduce((sum, item) => sum + item.total, 0);
        const item_count = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        newState = {
          ...state,
          cart: { ...state.cart, items: newItems, total, item_count }
        };
      }
      break;
    }
    
    case 'UPDATE_ITEM': {
      const updatedItems = state.cart.items.map(item =>
        item.product_id === action.payload.product_id
          ? { ...item, quantity: action.payload.quantity, total: item.price * action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const item_count = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      newState = {
        ...state,
        cart: { ...state.cart, items: updatedItems, total, item_count }
      };
      break;
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.cart.items.filter(item => item.product_id !== action.payload);
      const total = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const item_count = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      newState = {
        ...state,
        cart: { ...state.cart, items: updatedItems, total, item_count }
      };
      break;
    }
    
    case 'CLEAR_CART':
      newState = {
        ...state,
        cart: { items: [], total: 0, currency: 'CHF', item_count: 0 }
      };
      break;
    
    case 'TOGGLE_CART':
      newState = {
        ...state,
        isOpen: !state.isOpen
      };
      break;
    
    case 'OPEN_CART':
      newState = {
        ...state,
        isOpen: true
      };
      break;
    
    case 'CLOSE_CART':
      newState = {
        ...state,
        isOpen: false
      };
      break;
    
    default:
      newState = state;
      break;
  }
  
  // Save to localStorage after any cart changes
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify(newState.cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
  
  return newState;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from WooCommerce service on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // First try to load from localStorage
        if (typeof window !== 'undefined') {
          try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              const cart = JSON.parse(savedCart);
              console.log('Loading cart from localStorage:', cart);
              dispatch({ type: 'SET_CART', payload: cart });
              return;
            }
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
          }
        }
        
        // Fallback to WooCommerce service
        const cart = await wooCommerceCartService.getCart();
        dispatch({ type: 'SET_CART', payload: cart });
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadCart();
  }, []);

  // Cart persistence is handled by WooCommerce service

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Adding to cart:', { productId, quantity });
      const cart = await wooCommerceCartService.addToCart(productId, quantity);
      console.log('Cart updated:', cart);
      dispatch({ type: 'SET_CART', payload: cart });
      
      // Auto-open cart when item is added
      dispatch({ type: 'OPEN_CART' });
    } catch (error) {
      console.error('Cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const cart = await wooCommerceCartService.updateCartItem(productId, quantity);
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const cart = await wooCommerceCartService.removeFromCart(productId);
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const cart = await wooCommerceCartService.clearCart();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  const getCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const cart = await wooCommerceCartService.getCart();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get cart' });
    }
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  // Load cart on mount
  useEffect(() => {
    getCart();
  }, []);

  const value: CartContextType = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    isOpen: state.isOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCart,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
