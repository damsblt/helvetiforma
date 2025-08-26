'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiService from '../../../services/apiService';

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type: string;
  Theme: string;
  totalModules?: number;
  estimatedDuration?: number;
  difficulty?: string;
  modules?: FormationDoc[];
}

interface FormationDoc {
  id: number;
  title: string;
  description?: string;
  module: number;
  order: number;
  estimatedDuration?: number;
  isRequired: boolean;
}

export default function FormationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [formation, setFormation] = useState<Formation | null>(null);
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
      const formationData = await apiService.getFormation(resolvedParams.id);
      setFormation(formationData);
    } catch (error) {
      console.error('Error fetching formation:', error);
      setError('Erreur lors du chargement de la formation');
    } finally {
      setIsLoading(false);
    }
  };

  const getModulesByNumber = (modules: FormationDoc[]) => {
    const moduleGroups: { [key: number]: FormationDoc[] } = {};
    
    modules.forEach(doc => {
      if (!moduleGroups[doc.module]) {
        moduleGroups[doc.module] = [];
      }
      moduleGroups[doc.module].push(doc);
    });
    
    // Sort documents within each module by order
    Object.keys(moduleGroups).forEach(moduleNum => {
      const moduleDocs = moduleGroups[parseInt(moduleNum)];
      if (moduleDocs && Array.isArray(moduleDocs)) {
        moduleDocs.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    });
    
    return moduleGroups;
  };

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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-6">{error || 'Formation non trouvée'}</p>
            <Link 
              href="/formations"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const moduleGroups = formation.modules ? getModulesByNumber(formation.modules) : {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          {/* Course Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getThemeIcon(formation.Theme)}</span>
                  <h1 className="text-3xl font-bold text-gray-900">{formation.Title}</h1>
                </div>
                <p className="text-gray-600 mb-4">{formation.Description}</p>
                
                <div className="flex flex-wrap gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formation.Type === 'En ligne' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {formation.Type}
                  </span>
                  {formation.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(formation.difficulty)}`}>
                      {formation.difficulty}
                    </span>
                  )}
                  {formation.totalModules && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {formation.totalModules} module{formation.totalModules > 1 ? 's' : ''}
                    </span>
                  )}
                  {formation.estimatedDuration && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      ⏱️ {formation.estimatedDuration}h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Table des matières</h2>
          
          {Object.keys(moduleGroups).length > 0 ? (
            <div className="space-y-6">
              {Object.keys(moduleGroups).sort((a, b) => parseInt(a) - parseInt(b)).map(moduleNum => {
                const moduleDocs = moduleGroups[parseInt(moduleNum)];
                const moduleDuration = moduleDocs && Array.isArray(moduleDocs) 
                  ? moduleDocs.reduce((total, doc) => total + (doc.estimatedDuration || 0), 0)
                  : 0;
                
                return (
                  <div key={moduleNum} className="border border-gray-200 rounded-lg p-4">
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {moduleNum}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Module {moduleNum}</h3>
                      </div>
                      {moduleDuration > 0 && (
                        <span className="text-sm text-gray-500">⏱️ {moduleDuration} min</span>
                      )}
                    </div>
                    
                    {/* Module Documents */}
                    <div className="space-y-2">
                      {moduleDocs && Array.isArray(moduleDocs) ? moduleDocs.map((doc, index) => (
                        <Link
                          key={doc.id}
                          href={`/formation-docs/${doc.id}`}
                          className="block p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 line-clamp-1">{doc.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.estimatedDuration && (
                                <span className="text-xs text-gray-500">⏱️ {doc.estimatedDuration} min</span>
                              )}
                              {doc.isRequired && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Obligatoire</span>
                              )}
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      )) : (
                        <p className="text-gray-500 text-sm">Aucun document dans ce module.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun module disponible pour cette formation.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📚 Commencer la formation
          </button>
          <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            📋 Voir le programme détaillé
          </button>
        </div>
      </div>
    </div>
  );
} 