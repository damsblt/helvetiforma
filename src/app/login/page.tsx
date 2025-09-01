'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
      return;
    }

    // Check for messages from URL params
    const urlMessage = searchParams.get('message');
    if (urlMessage === 'admin_required') {
      setMessage('Accès administrateur requis pour cette page');
    } else if (urlMessage === 'login_required') {
      setMessage('Veuillez vous connecter pour accéder à cette page');
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ identifier, password });
      
      if (response.success) {
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
      } else {
        setError(response.message || 'Identifiants incorrects');
      }
    } catch (error) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToConstruction = () => {
    router.push('/construction');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion
          </h2>
          <p className="text-gray-600">
            Accédez à votre espace HelvetiForma
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">{message}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email ou nom d'utilisateur
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToConstruction}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Retour au site en construction
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Nouveau sur HelvetiForma ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/register')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 