// Force dynamic rendering
export const dynamic = 'force-dynamic';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type: string;
  Theme: string;
  sessions?: any[];
  docs?: any[];
}

const themes = [
  {
    id: 'salaire',
    name: 'Salaire',
    description: 'Formations sur la gestion des salaires et la paie',
    icon: '💰',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  {
    id: 'assurances-sociales',
    name: 'Assurances sociales',
    description: 'Formations sur les assurances sociales et la sécurité sociale',
    icon: '🛡️',
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  {
    id: 'impot-a-la-source',
    name: 'Impôt à la source',
    description: 'Formations sur l\'impôt à la source et la fiscalité',
    icon: '📊',
    color: 'bg-green-50 border-green-200 text-green-800'
  }
];

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    // Check for theme parameter in URL
    const themeParam = searchParams.get('theme');
    if (themeParam) {
      setSelectedTheme(themeParam);
    }
  }, [searchParams]);

  const fetchFormations = async () => {
    try {
      const res = await fetch('http://localhost:1337/api/formations?populate=*');
      const data = await res.json();
      setFormations(data.data || []);
    } catch (error) {
      console.error('Error fetching formations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormationsByTheme = (theme: string) => {
    // Map theme IDs to database theme values
    const themeMapping: { [key: string]: string } = {
      'salaire': 'Salaire',
      'assurances-sociales': 'Assurances sociales',
      'impot-a-la-source': 'Impôt à la source'
    };
    
    const dbThemeValue = themeMapping[theme];
    if (!dbThemeValue) return [];
    
    return formations.filter(formation => 
      formation.Theme === dbThemeValue
    );
  };

  const getThemeStats = (theme: string) => {
    const themeFormations = getFormationsByTheme(theme);
    console.log(`Theme: ${theme}, Found formations:`, themeFormations.length);
    return {
      count: themeFormations.length,
      online: themeFormations.filter(f => f.Type === 'En ligne').length,
      onsite: themeFormations.filter(f => f.Type === 'Présentiel').length
    };
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

  if (selectedTheme) {
    const themeFormations = getFormationsByTheme(selectedTheme);
    const currentTheme = themes.find(t => t.id === selectedTheme);

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-4xl">
          {/* Header with back button */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedTheme(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux thèmes
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentTheme?.icon} {currentTheme?.name}
            </h1>
            <p className="text-gray-600">{currentTheme?.description}</p>
          </div>

          {/* Formations list */}
          {themeFormations.length > 0 ? (
            <div className="space-y-4">
              {themeFormations.map((formation) => (
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
              <p className="text-gray-500 text-lg">Aucune formation disponible pour ce thème.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">Formations par thème</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const stats = getThemeStats(theme.id);
            
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`block w-full p-6 rounded-lg border-2 hover:shadow-lg transition-all duration-200 ${theme.color} hover:scale-105`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{theme.icon}</div>
                  <h2 className="text-xl font-bold mb-2">{theme.name}</h2>
                  <p className="text-sm mb-4 opacity-80">{theme.description}</p>
                  
                  <div className="flex justify-center space-x-4 text-sm">
                    <span className="bg-white bg-opacity-50 px-2 py-1 rounded">
                      {stats.count} formation{stats.count > 1 ? 's' : ''}
                    </span>
                    {stats.online > 0 && (
                      <span className="bg-white bg-opacity-50 px-2 py-1 rounded">
                        {stats.online} en ligne
                      </span>
                    )}
                    {stats.onsite > 0 && (
                      <span className="bg-white bg-opacity-50 px-2 py-1 rounded">
                        {stats.onsite} présentiel
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* All formations link */}
        <div className="mt-12 text-center">
          <Link 
            href="/formations/all"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir toutes les formations
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 