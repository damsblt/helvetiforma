'use client';

import React, { useState, useEffect } from 'react';
import DocsList from './DocsList';

interface Article {
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

export default function DocsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(['Toutes']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        // Fetch WordPress posts
        const postsResponse = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?per_page=100');
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const posts: Article[] = await postsResponse.json();
        setArticles(posts);

        // Extract unique categories from posts
        const categorySet = new Set<string>();
        categorySet.add('Toutes');
        
        // Get categories from WordPress
        const categoriesResponse = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/categories');
        if (categoriesResponse.ok) {
          const wpCategories = await categoriesResponse.json();
          wpCategories.forEach((cat: any) => {
            categorySet.add(cat.name);
          });
        }

        setCategories(Array.from(categorySet));
        
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-3xl">
        <DocsList articles={articles} categories={categories} />
      </div>
    </div>
  );
} 