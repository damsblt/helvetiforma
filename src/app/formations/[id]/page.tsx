'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiService from '../../../services/apiService';

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

export default function FormationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [formation, setFormation] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Unwrap params using React.use()
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchFormation();
  }, [resolvedParams.id]);

  const fetchFormation = async () => {
    try {
      // Use the new API service with fallback support
      const formationData = await apiService.getArticle(resolvedParams.id);
      setFormation(formationData);
    } catch (error) {
      console.error('Error fetching formation:', error);
      setError('Erreur lors du chargement de la formation');
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'Salaire': return '💰';
      case 'Assurances sociales': return '🛡️';
      case 'Impôt à la source': return '📊';
      default: return '📚';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la formation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error || 'Formation non trouvée'}</p>
            <button 
              onClick={() => router.back()} 
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-700 transition-colors">
                Accueil
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link href="/formations" className="hover:text-blue-700 transition-colors">
                Formations
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{formation.title.rendered}</span>
            </li>
          </ol>
        </nav>

        {/* Formation Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📚</span>
              <h1 className="text-3xl font-bold text-gray-900">{formation.title.rendered}</h1>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formation.format === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {formation.format || 'Standard'}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {formation.status}
              </span>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: formation.content.rendered }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/formations"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
          >
            ← Retour aux formations
          </Link>
          <a
            href={formation.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            Voir sur WordPress
          </a>
        </div>
      </div>
    </div>
  );
} 