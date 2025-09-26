'use client';

import { useState } from 'react';

interface EndpointResult {
  endpoint: string;
  status: number | string;
  statusText?: string;
  available: boolean;
  contentType?: string;
  routes?: string[];
  sampleCount?: number;
  error?: string;
}

interface DebugResponse {
  server: string;
  timestamp: string;
  results: EndpointResult[];
  summary: {
    total: number;
    available: number;
    errors: number;
  };
}

export default function DebugPage() {
  const [results, setResults] = useState<DebugResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoints = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/endpoints');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number | string, available: boolean) => {
    if (status === 'ERROR') return 'text-red-600 bg-red-50';
    if (available) return 'text-green-600 bg-green-50';
    if (status === 404) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Debug API Endpoints
          </h1>
          <p className="text-gray-600 mb-6">
            Testez les endpoints disponibles sur votre serveur WordPress/Tutor LMS
          </p>
          
          <button
            onClick={testEndpoints}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Test en cours...' : 'Tester les endpoints'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="text-red-800 font-medium mb-2">Erreur</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
                  <div className="text-sm text-gray-600">Total testé</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.summary.available}</div>
                  <div className="text-sm text-gray-600">Disponibles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.summary.errors}</div>
                  <div className="text-sm text-gray-600">Erreurs</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Serveur</div>
                  <div className="font-mono text-xs">{results.server}</div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Résultats détaillés</h2>
                <p className="text-sm text-gray-600">Testé le {new Date(results.timestamp).toLocaleString('fr-FR')}</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {results.results.map((result, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {result.endpoint}
                      </code>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status, result.available)}`}>
                        {result.status} {result.statusText}
                      </span>
                    </div>
                    
                    {result.contentType && (
                      <p className="text-sm text-gray-600 mb-2">
                        Type: {result.contentType}
                      </p>
                    )}
                    
                    {result.routes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Routes disponibles:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.routes.map((route, i) => (
                            <code key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {route}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.sampleCount !== undefined && (
                      <p className="text-sm text-gray-600 mt-2">
                        {result.sampleCount} éléments trouvés
                      </p>
                    )}
                    
                    {result.error && (
                      <p className="text-sm text-red-600 mt-2">
                        Erreur: {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-800 font-medium mb-3">Recommandations</h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• Si aucun endpoint Tutor n'est disponible, vérifiez que Tutor LMS Pro est installé et activé</li>
                <li>• Si les endpoints WordPress de base ne fonctionnent pas, vérifiez les permaliens dans WordPress</li>
                <li>• Les endpoints 404 peuvent indiquer que les types de contenu ne sont pas exposés dans l'API REST</li>
                <li>• Vérifiez que l'utilisateur d'application WordPress a les bonnes permissions</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

