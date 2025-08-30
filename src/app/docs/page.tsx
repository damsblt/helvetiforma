'use client';

import React, { useState, useEffect } from 'react';
import DocsList from './DocsList';

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  categories: number[];
  tags: number[];
}

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type?: string;
  Theme?: string;
  totalModules?: number;
  estimatedDuration?: number;
  difficulty?: string;
  price?: number;
  slug?: string;
  date?: string;
  excerpt?: string;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<Formation[]>([]);
  const [categories, setCategories] = useState<string[]>(['Toutes']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadata extraction function
  const extractMetadata = (content: string, key: string): string | number | null => {
    if (!content) return null;
    
    const regex = new RegExp(`\\[${key}:\\s*([^\\]]+)\\]`, 'i');
    const match = content.match(regex);
    
    if (match && match[1]) {
      const value = match[1].trim();
      if (!isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }
    
    return null;
  };

  // Helper function to safely extract string metadata
  const extractStringMetadata = (content: string, key: string): string | undefined => {
    const result = extractMetadata(content, key);
    return typeof result === 'string' ? result : undefined;
  };

  // Helper function to safely extract number metadata
  const extractNumberMetadata = (content: string, key: string): number | undefined => {
    const result = extractMetadata(content, key);
    return typeof result === 'number' ? result : undefined;
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        
        // Fetch WordPress posts
        const postsResponse = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?per_page=100');
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const posts: WordPressPost[] = await postsResponse.json();
        
        // Transform posts to Formation format
        const transformedDocs: Formation[] = posts.map(post => ({
          id: post.id,
          Title: post.title.rendered,
          Description: post.content.rendered,
          excerpt: post.excerpt.rendered,
          slug: post.slug,
          date: post.date,
          Type: extractStringMetadata(post.content.rendered, 'Type') || 'Article',
          Theme: extractStringMetadata(post.content.rendered, 'Theme') || 'General',
          difficulty: extractStringMetadata(post.content.rendered, 'Difficulty') || 'All Levels',
          estimatedDuration: extractNumberMetadata(post.content.rendered, 'Duration') || 0,
          totalModules: extractNumberMetadata(post.content.rendered, 'Modules') || 0,
          price: extractNumberMetadata(post.content.rendered, 'Price') || 0,
        }));

        setDocs(transformedDocs);

        // Extract unique categories from posts
        const categorySet = new Set<string>();
        categorySet.add('Toutes');
        
        transformedDocs.forEach(doc => {
          if (doc.Theme) {
            categorySet.add(doc.Theme);
          }
          if (doc.Type) {
            categorySet.add(doc.Type);
          }
        });

        setCategories(Array.from(categorySet));
        
      } catch (err) {
        console.error('Error fetching docs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des documents...</p>
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
        <DocsList docs={docs} categories={categories} />
      </div>
    </div>
  );
} 