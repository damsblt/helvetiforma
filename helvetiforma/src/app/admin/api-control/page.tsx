'use client';

import React from 'react';

export default function ApiControlPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contrôle des APIs
          </h1>
          <p className="text-gray-600">
            Gérez vos sources de données WordPress
          </p>
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informations sur l'API
          </h2>
          
          <div className="grid md:grid-cols-1 gap-6">
            {/* WordPress Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">WordPress (CMS Principal)</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• URL: <code className="bg-gray-100 px-1 rounded">https://api.helvetiforma.ch</code></div>
                <div>• Endpoint: <code className="bg-gray-100 px-1 rounded">/wp-json/wp/v2/</code></div>
                <div>• Tutor LMS: <code className="bg-gray-100 px-1 rounded">/wp-json/tutor/v1/</code></div>
                <div>• Avantages: E-commerce intégré, gestion facile, Tutor LMS Pro</div>
                <div>• Statut: CMS headless configuré avec Tutor LMS</div>
              </div>
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
              <h3 className="font-medium text-gray-900 mb-2">Test WordPress Posts API</h3>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mr-2"
                onClick={async () => {
                  try {
                    const response = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?per_page=1');
                    if (response.ok) {
                      alert('✅ WordPress Posts API fonctionne !');
                    } else {
                      alert('❌ WordPress Posts API erreur: ' + response.status);
                    }
                  } catch (error) {
                    alert('❌ WordPress Posts API erreur: ' + error);
                  }
                }}
              >
                Tester Posts
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Tutor LMS API</h3>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm mr-2"
                onClick={async () => {
                  try {
                    const response = await fetch('https://api.helvetiforma.ch/wp-json/tutor/v1/courses?per_page=1');
                    if (response.ok) {
                      alert('✅ Tutor LMS API fonctionne !');
                    } else {
                      alert('❌ Tutor LMS API erreur: ' + response.status);
                    }
                  } catch (error) {
                    alert('❌ Tutor LMS API erreur: ' + error);
                  }
                }}
              >
                Tester Tutor LMS
              </button>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Variables d'environnement</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_WORDPRESS_URL</code> - URL de votre WordPress</div>
                <div><code className="bg-gray-100 px-1 rounded">TUTOR_API_URL</code> - URL de l'API Tutor LMS</div>
                <div><code className="bg-gray-100 px-1 rounded">TUTOR_LICENSE_KEY</code> - Clé de licence Tutor LMS Pro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}