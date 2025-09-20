'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type: string;
  Theme: string;
  sessions?: any[];
  docs?: any[];
}

export default function AllFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      // Use Tutor LMS API
      const res = await fetch('/api/tutor-courses');
      const data = await res.json();
      
      if (data.success) {
        // Transform Tutor LMS data to match expected format
        const transformedFormations = data.data.courses.map((course: any) => ({
          id: course.id,
          Title: course.title,
          Description: course.excerpt || course.content,
          Type: 'En ligne',
          Theme: course.meta.course_categories.join(', ') || '',
          sessions: [],
          docs: []
        }));
        setFormations(transformedFormations);
      } else {
        setFormations([]);
      }
    } catch (error) {
      console.error('Error fetching formations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des formations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/formations"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux thèmes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Toutes les formations</h1>
          <p className="text-gray-600">{formations.length} formation{formations.length > 1 ? 's' : ''} disponibles</p>
        </div>

        {/* Formations list */}
        {formations.length > 0 ? (
          <div className="space-y-4">
            {formations.map((formation) => (
              <Link 
                href={`/formations/${formation.id}`} 
                key={formation.id}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{formation.Title}</h2>
                    {formation.Description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{formation.Description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formation.Type === 'En ligne' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {formation.Type}
                      </span>
                      {formation.Theme && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {formation.Theme}
                        </span>
                      )}
                      {formation.sessions && formation.sessions.length > 0 && (
                        <span className="flex items-center gap-1">
                          📅 {formation.sessions.length} session{formation.sessions.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {formation.docs && formation.docs.length > 0 && (
                        <span className="flex items-center gap-1">
                          📚 {formation.docs.length} ressource{formation.docs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune formation disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
} 