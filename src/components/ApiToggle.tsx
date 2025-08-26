'use client';

import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface ApiToggleProps {
  onApiChange?: (apiSource: 'wordpress' | 'strapi') => void;
}

const ApiToggle: React.FC<ApiToggleProps> = ({ onApiChange }) => {
  const [currentApi, setCurrentApi] = useState<'wordpress' | 'strapi'>('strapi');
  const [apiHealth, setApiHealth] = useState<{
    wordpress: boolean;
    strapi: boolean;
  }>({ wordpress: false, strapi: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved preference
    const savedApi = localStorage.getItem('helvetiforma_api_source') as 'wordpress' | 'strapi';
    if (savedApi) {
      setCurrentApi(savedApi);
      apiService.toggleApi(savedApi === 'wordpress');
    }

    // Check API health
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    setIsLoading(true);
    try {
      const health = await apiService.checkApiHealth();
      setApiHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiToggle = (newApi: 'wordpress' | 'strapi') => {
    setCurrentApi(newApi);
    apiService.toggleApi(newApi === 'wordpress');
    onApiChange?.(newApi);
    
    // Reload page to apply changes
    window.location.reload();
  };

  return (
    <div className="api-toggle bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Source de données
        </h3>
        <button
          onClick={checkApiHealth}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isLoading ? 'Vérification...' : 'Actualiser'}
        </button>
      </div>

      <div className="space-y-3">
        {/* WordPress Option */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              apiHealth.wordpress ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <div className="font-medium text-gray-900">WordPress</div>
              <div className="text-sm text-gray-500">
                {apiHealth.wordpress ? 'Connecté' : 'Non connecté'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleApiToggle('wordpress')}
            disabled={!apiHealth.wordpress}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentApi === 'wordpress'
                ? 'bg-blue-600 text-white'
                : apiHealth.wordpress
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentApi === 'wordpress' ? 'Actif' : 'Activer'}
          </button>
        </div>

        {/* Strapi Option */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              apiHealth.strapi ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <div className="font-medium text-gray-900">Strapi (Backup)</div>
              <div className="text-sm text-gray-500">
                {apiHealth.strapi ? 'Connecté' : 'Non connecté'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleApiToggle('strapi')}
            disabled={!apiHealth.strapi}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentApi === 'strapi'
                ? 'bg-blue-600 text-white'
                : apiHealth.strapi
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentApi === 'strapi' ? 'Actif' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Status Information */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-1">Statut actuel:</div>
          <div>• API active: <span className="font-medium">{currentApi === 'wordpress' ? 'WordPress' : 'Strapi'}</span></div>
          <div>• Fallback: {currentApi === 'wordpress' ? 'Strapi (si WordPress échoue)' : 'Aucun'}</div>
          <div>• Dernière vérification: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Migration Tool */}
      {currentApi === 'wordpress' && apiHealth.strapi && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-2">Migration de données:</div>
            <div>Vous pouvez migrer vos formations de Strapi vers WordPress.</div>
            <button
              onClick={() => {
                // This would trigger migration
                alert('Fonctionnalité de migration à implémenter');
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Migrer les données
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiToggle;
