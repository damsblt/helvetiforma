'use client';

import React from 'react';
import ApiToggle from '../../components/ApiToggle';

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
                Gérez vos sources de données et basculez entre WordPress et Strapi
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

        {/* API Toggle Component */}
        <ApiToggle 
          onApiChange={(apiSource) => {
            console.log('API changed to:', apiSource);
            // You can add additional logic here
          }} 
        />

        {/* Status Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informations sur les APIs
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* WordPress Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">WordPress (CMS Principal)</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• URL: <code className="bg-gray-100 px-1 rounded">https://helvetiforma.ch</code></div>
                <div>• Endpoint: <code className="bg-gray-100 px-1 rounded">/wp-json/helvetiforma/v1/</code></div>
                <div>• Avantages: E-commerce intégré, gestion facile</div>
                <div>• Statut: CMS headless configuré</div>
              </div>
            </div>

            {/* Strapi Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Strapi (Backup)</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• URL: <code className="bg-gray-100 px-1 rounded">http://localhost:1337</code></div>
                <div>• Endpoint: <code className="bg-gray-100 px-1 rounded">/api/formations</code></div>
                <div>• Avantages: API flexible, données existantes</div>
                <div>• Statut: Système de backup</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actions Rapides
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => window.open('https://helvetiforma.ch/wp-admin', '_blank')}
            >
              <div className="font-medium text-gray-900">WordPress Admin</div>
              <div className="text-sm text-gray-600">Gérer le contenu</div>
            </button>

            <button 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => window.open('http://localhost:1337/admin', '_blank')}
            >
              <div className="font-medium text-gray-900">Strapi Admin</div>
              <div className="text-sm text-gray-600">Gérer les données</div>
            </button>

            <button 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => window.open('/formations', '_self')}
            >
              <div className="font-medium text-gray-900">Voir Formations</div>
              <div className="text-sm text-gray-600">Tester l'affichage</div>
            </button>
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
                    const response = await fetch('https://helvetiforma.ch/wp-json/helvetiforma/v1/formations');
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

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Strapi API</h3>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:1337/api/formations');
                    if (response.ok) {
                      alert('✅ Strapi API fonctionne !');
                    } else {
                      alert('❌ Strapi API erreur: ' + response.status);
                    }
                  } catch (error) {
                    alert('❌ Strapi API erreur: ' + error);
                  }
                }}
              >
                Tester Strapi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
