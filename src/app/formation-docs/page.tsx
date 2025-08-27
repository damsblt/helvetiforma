'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';

export default function FormationDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des formations</h1>
          <p className="text-gray-600">Découvrez nos formations structurées par modules et documents</p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Formations en cours de chargement</h2>
          <p className="text-gray-600 mb-6">Les formations seront bientôt disponibles dans le catalogue.</p>
          <Link 
            href="/formations"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir les formations par thème
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/formations"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux formations par thème
          </Link>
          <Link 
            href="/personal-space"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mon espace personnel
          </Link>
        </div>
      </div>
    </div>
  );
} 