'use client';

import { useState } from 'react';

interface SyncResult {
  tutor_course_id: number;
  woo_commerce_product_id?: number;
  status: 'created' | 'updated' | 'already_exists' | 'error';
  message: string;
}

export default function SyncCoursesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SyncResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const syncAllCourses = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/sync/tutor-to-woocommerce');
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || 'Erreur lors de la synchronisation');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const syncSingleCourse = async (courseId: string) => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/sync/tutor-to-woocommerce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId: parseInt(courseId) }),
      });

      const data = await response.json();

      if (data.success) {
        setResults([data.data]);
      } else {
        setError(data.message || 'Erreur lors de la synchronisation');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async (courseId: string) => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`/api/webhooks/tutor-course-created?course_id=${courseId}`);
      const data = await response.json();

      if (data.success) {
        setResults([data.data]);
      } else {
        setError(data.message || 'Erreur lors du test du webhook');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'text-green-600 bg-green-100';
      case 'updated':
        return 'text-blue-600 bg-blue-100';
      case 'already_exists':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created':
        return 'Créé';
      case 'updated':
        return 'Mis à jour';
      case 'already_exists':
        return 'Existe déjà';
      case 'error':
        return 'Erreur';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Synchronisation des cours</h1>
          <p className="text-gray-600 mt-2">
            Fonctionnalité désactivée - La synchronisation automatique des cours vers les produits WooCommerce a été arrêtée
          </p>
        </div>

        {/* Disabled Notice */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Synchronisation désactivée
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  La synchronisation automatique des cours Tutor LMS vers les produits WooCommerce a été désactivée. 
                  Les nouveaux cours ne créeront plus automatiquement de produits WooCommerce.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sync Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions de synchronisation</h2>
            
            {/* Sync All Courses - DISABLED */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Synchroniser tous les cours (Désactivé)</h3>
              <p className="text-gray-400 text-sm mb-4">
                Cette fonctionnalité a été désactivée
              </p>
              <button
                disabled={true}
                className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed opacity-50"
              >
                Fonctionnalité désactivée
              </button>
            </div>

            {/* Sync Single Course - DISABLED */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Synchroniser un cours spécifique (Désactivé)</h3>
              <p className="text-gray-400 text-sm mb-4">
                Cette fonctionnalité a été désactivée
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="ID du cours"
                  disabled={true}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                  id="single-course-id"
                />
                <button
                  disabled={true}
                  className="bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed opacity-50"
                >
                  Désactivé
                </button>
              </div>
            </div>

            {/* Test Webhook - DISABLED */}
            <div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">Tester le webhook (Désactivé)</h3>
              <p className="text-gray-400 text-sm mb-4">
                Cette fonctionnalité a été désactivée
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="ID du cours"
                  disabled={true}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                  id="webhook-course-id"
                />
                <button
                  disabled={true}
                  className="bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed opacity-50"
                >
                  Désactivé
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Résultats</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        Cours ID: {result.tutor_course_id}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusText(result.status)}
                      </span>
                    </div>
                    
                    {result.woo_commerce_product_id && (
                      <p className="text-sm text-gray-600">
                        Produit WooCommerce ID: {result.woo_commerce_product_id}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600">
                      {result.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {results.length === 0 && !error && !isLoading && (
              <p className="text-gray-500 text-center py-8">
                Aucun résultat à afficher. Lancez une synchronisation pour voir les résultats.
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Fonctionnalité désactivée</h3>
          <div className="text-gray-700 space-y-2">
            <p><strong>Changement de stratégie:</strong> La synchronisation automatique des cours Tutor LMS vers les produits WooCommerce a été désactivée.</p>
            <p><strong>Raison:</strong> Modification du parcours utilisateur - les cours ne créent plus automatiquement de produits WooCommerce.</p>
            <p><strong>Impact:</strong> Les nouveaux cours ajoutés dans Tutor LMS ne déclencheront plus la création automatique de produits WooCommerce.</p>
            <p><strong>Note:</strong> Cette page reste accessible pour référence historique, mais toutes les fonctionnalités de synchronisation sont désactivées.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
