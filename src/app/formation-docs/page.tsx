// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type: string;
  Theme: string;
  totalModules?: number;
  estimatedDuration?: number;
  difficulty?: string;
}

async function getFormations() {
  try {
    const res = await fetch('http://localhost:1337/api/formations?populate=*', { cache: 'no-store' });
    const data = await res.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      return [];
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching formations:', error);
    return [];
  }
}

export default async function FormationDocsPage() {
  const formations = await getFormations();
  
  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'Salaire': return '💰';
      case 'Assurances sociales': return '🛡️';
      case 'Impôt à la source': return '📊';
      default: return '📚';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des formations</h1>
          <p className="text-gray-600">Découvrez nos formations structurées par modules et documents</p>
          <p className="text-sm text-gray-500 mt-2">Nombre de formations: {formations.length}</p>
        </div>
        
        {formations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation: Formation) => (
              <Link
                key={formation.id}
                href={`/formations/${formation.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getThemeIcon(formation.Theme)}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{formation.Title}</h2>
                </div>
                
                {formation.Description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{formation.Description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formation.Type === 'En ligne' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {formation.Type}
                  </span>
                  {formation.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(formation.difficulty)}`}>
                      {formation.difficulty}
                    </span>
                  )}
                  {formation.totalModules && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {formation.totalModules} module{formation.totalModules > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  {formation.estimatedDuration && (
                    <span>⏱️ {formation.estimatedDuration}h</span>
                  )}
                  <span className="flex items-center gap-1">
                    Voir le programme
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune formation disponible</h2>
            <p className="text-gray-600 mb-6">Les formations seront bientôt disponibles dans le catalogue.</p>
            <Link 
              href="/formations"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir les formations par thème
            </Link>
          </div>
        )}
        
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