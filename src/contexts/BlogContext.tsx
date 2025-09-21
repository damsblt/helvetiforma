'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cacheManager } from '@/utils/productCache';

export interface BlogArticle {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any;
  categories: number[];
  tags: number[];
  link: string;
  guid: any;
  status: string;
  type: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

interface BlogState {
  articles: BlogArticle[];
  categories: BlogCategory[];
  categoryNames: string[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isInitialized: boolean;
}

type BlogAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BLOG_DATA'; payload: { articles: BlogArticle[]; categories: BlogCategory[]; categoryNames: string[] } }
  | { type: 'SET_LAST_FETCHED'; payload: number }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CLEAR_BLOG_DATA' };

const initialState: BlogState = {
  articles: [],
  categories: [],
  categoryNames: ['Toutes'],
  loading: false,
  error: null,
  lastFetched: null,
  isInitialized: false
};

function blogReducer(state: BlogState, action: BlogAction): BlogState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_BLOG_DATA':
      return { 
        ...state, 
        articles: action.payload.articles,
        categories: action.payload.categories,
        categoryNames: action.payload.categoryNames,
        loading: false, 
        error: null 
      };
    
    case 'SET_LAST_FETCHED':
      return { ...state, lastFetched: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'CLEAR_BLOG_DATA':
      return {
        ...state,
        articles: [],
        categories: [],
        categoryNames: ['Toutes'],
        lastFetched: null,
        isInitialized: false
      };
    
    default:
      return state;
  }
}

interface BlogContextType {
  articles: BlogArticle[];
  categories: BlogCategory[];
  categoryNames: string[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastFetched: number | null;
  fetchBlogData: () => Promise<void>;
  refreshBlogData: () => Promise<void>;
  clearBlogData: () => void;
  getArticleById: (id: number) => BlogArticle | undefined;
  getArticlesByCategory: (categoryName: string) => BlogArticle[];
  isCacheValid: () => boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Cache duration: 10 minutes (600000 ms) - blog data changes less frequently
const CACHE_DURATION = 10 * 60 * 1000;

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  const isCacheValid = (): boolean => {
    if (!state.lastFetched) return false;
    return Date.now() - state.lastFetched < CACHE_DURATION;
  };

  const fetchBlogData = useCallback(async (): Promise<void> => {
    // If cache is valid and we have data, don't fetch again
    if (isCacheValid() && state.articles.length > 0) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Fetch WordPress posts
      const postsResponse = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?per_page=100');
      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const articles: BlogArticle[] = await postsResponse.json();

      // Fetch categories from WordPress
      const categoriesResponse = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/categories');
      let categories: BlogCategory[] = [];
      let categoryNames = ['Toutes'];
      
      if (categoriesResponse.ok) {
        const wpCategories = await categoriesResponse.json();
        categories = wpCategories;
        
        // Filter out "Non classé" (Unclassified) category
        const filteredCategories = wpCategories.filter((cat: BlogCategory) => cat.name !== 'Non classé');
        categoryNames = ['Toutes', ...filteredCategories.map((cat: BlogCategory) => cat.name)];
      }

      dispatch({ 
        type: 'SET_BLOG_DATA', 
        payload: { 
          articles,
          categories,
          categoryNames
        } 
      });
      dispatch({ type: 'SET_LAST_FETCHED', payload: Date.now() });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      
    } catch (error) {
      console.error('BlogContext: Error fetching blog data:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch blog data' 
      });
    }
  }, [state.articles.length, state.lastFetched]);

  const refreshBlogData = async (): Promise<void> => {
    dispatch({ type: 'SET_LAST_FETCHED', payload: 0 }); // Force refresh
    await fetchBlogData();
  };

  const clearBlogData = (): void => {
    dispatch({ type: 'CLEAR_BLOG_DATA' });
  };

  const getArticleById = (id: number): BlogArticle | undefined => {
    return state.articles.find(article => article.id === id);
  };

  const getArticlesByCategory = (categoryName: string): BlogArticle[] => {
    if (categoryName === 'Toutes') return state.articles;
    
    const categoryMap = new Map<number, string>();
    state.categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });
    
    return state.articles.filter(article => {
      return article.categories.some((catId: number) => {
        const categoryNameFromMap = categoryMap.get(catId);
        return categoryNameFromMap === categoryName;
      });
    });
  };

  // Auto-fetch blog data on mount if not already loaded
  useEffect(() => {
    if (!state.isInitialized) {
      fetchBlogData();
    }
  }, [fetchBlogData]);

  // Register for cache invalidation
  useEffect(() => {
    const unregister = cacheManager.registerRefreshCallback(() => {
      refreshBlogData();
    });

    return unregister;
  }, []);

  const value: BlogContextType = {
    articles: state.articles,
    categories: state.categories,
    categoryNames: state.categoryNames,
    loading: state.loading,
    error: state.error,
    isInitialized: state.isInitialized,
    lastFetched: state.lastFetched,
    fetchBlogData,
    refreshBlogData,
    clearBlogData,
    getArticleById,
    getArticlesByCategory,
    isCacheValid
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}
