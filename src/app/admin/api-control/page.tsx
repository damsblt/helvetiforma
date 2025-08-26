'use client';

import React from 'react';
import ApiToggle from '../../../components/ApiToggle';

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
            Gérez vos sources de données et basculez entre WordPress et Strapi
          </p>
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

        {/* Migration Tools */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Outils de Migration
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Migration de Données</h3>
              <p className="text-blue-800 text-sm mb-3">
                Migrez vos formations de Strapi vers WordPress pour bénéficier de l'e-commerce intégré.
              </p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={() => alert('Fonctionnalité de migration à implémenter')}
              >
                Démarrer la Migration
              </button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Synchronisation</h3>
              <p className="text-green-800 text-sm mb-3">
                Synchronisez les données entre les deux systèmes pour maintenir la cohérence.
              </p>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                onClick={() => alert('Fonctionnalité de synchronisation à implémenter')}
              >
                Synchroniser
              </button>
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
      </div>
    </div>
  );
}
