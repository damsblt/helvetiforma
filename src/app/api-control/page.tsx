'use client';

import React from 'react';

export default function PublicApiControlPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Contrôle des APIs (Public)
              </h1>
              <p className="text-gray-600">
                Gérez vos sources de données WordPress
              </p>
            </div>
            <a 
              href="/admin/api-control" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Version Admin
            </a>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 text-sm">
                Version publique - Pour les tests. Utilisez la version admin pour la gestion complète.
              </span>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration actuelle
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">WordPress API</span>
              </div>
              <span className="text-sm text-gray-600">Actif</span>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tests d'API
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test WordPress API</h3>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={async () => {
                  try {
                    const response = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?per_page=1');
                    if (response.ok) {
                      alert('✅ WordPress API fonctionne !');
                    } else {
                      alert('❌ WordPress API erreur: ' + response.status);
                    }
                  } catch (error) {
                    alert('❌ WordPress API erreur: ' + error);
                  }
                }}
              >
                Tester WordPress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}