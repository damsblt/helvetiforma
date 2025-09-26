'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { productCacheManager } from '@/utils/productCache';

export interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  short_description: string;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  tutor_course_id?: string;
  course_duration?: string;
  course_level?: string;
  course_slug?: string;
  virtual?: boolean;
  downloadable?: boolean;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

interface ProductsState {
  products: Product[];
  courseProducts: Product[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isInitialized: boolean;
}

type ProductsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: { products: Product[]; courseProducts: Product[] } }
  | { type: 'SET_LAST_FETCHED'; payload: number }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CLEAR_PRODUCTS' };

const initialState: ProductsState = {
  products: [],
  courseProducts: [],
  loading: false,
  error: null,
  lastFetched: null,
  isInitialized: false
};

function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PRODUCTS':
      return { 
        ...state, 
        products: action.payload.products, 
        courseProducts: action.payload.courseProducts,
        loading: false, 
        error: null 
      };
    
    case 'SET_LAST_FETCHED':
      return { ...state, lastFetched: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'CLEAR_PRODUCTS':
      return {
        ...state,
        products: [],
        courseProducts: [],
        lastFetched: null,
        isInitialized: false
      };
    
    default:
      return state;
  }
}

interface ProductsContextType {
  products: Product[];
  courseProducts: Product[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastFetched: number | null;
  fetchProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  clearProducts: () => void;
  getProductById: (id: number) => Product | undefined;
  getCourseProducts: () => Product[];
  isCacheValid: () => boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  const isCacheValid = (): boolean => {
    if (!state.lastFetched) return false;
    return Date.now() - state.lastFetched < CACHE_DURATION;
  };

  const fetchProducts = useCallback(async (): Promise<void> => {
    // If cache is valid and we have products, don't fetch again
    if (isCacheValid() && state.products.length > 0) {
      console.log('ProductsContext: Using cached products');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/woocommerce/course-products');
      const result = await response.json();
      
      if (result.success && result.data) {
        // The API already returns course products, so we can use them directly
        // All products from this endpoint are course products
        const courseProducts = result.data;

        dispatch({ 
          type: 'SET_PRODUCTS', 
          payload: { 
            products: result.data, 
            courseProducts: courseProducts 
          } 
        });
        dispatch({ type: 'SET_LAST_FETCHED', payload: Date.now() });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('ProductsContext: Error fetching products:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch products' 
      });
    }
  }, [state.products.length, state.lastFetched]);

  const refreshProducts = async (): Promise<void> => {
    console.log('ProductsContext: Refreshing products (ignoring cache)');
    dispatch({ type: 'SET_LAST_FETCHED', payload: 0 }); // Force refresh
    await fetchProducts();
  };

  const clearProducts = (): void => {
    dispatch({ type: 'CLEAR_PRODUCTS' });
  };

  const getProductById = (id: number): Product | undefined => {
    return state.products.find(product => product.id === id);
  };

  const getCourseProducts = (): Product[] => {
    return state.courseProducts;
  };

  // Auto-fetch products on mount if not already loaded
  useEffect(() => {
    if (!state.isInitialized) {
      fetchProducts();
    }
  }, [fetchProducts]);

  // Register for cache invalidation
  useEffect(() => {
    const unregister = productCacheManager.registerRefreshCallback(() => {
      refreshProducts();
    });

    return unregister;
  }, []);

  const value: ProductsContextType = {
    products: state.products,
    courseProducts: state.courseProducts,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,
    lastFetched: state.lastFetched,
    fetchProducts,
    refreshProducts,
    clearProducts,
    getProductById,
    getCourseProducts,
    isCacheValid
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
