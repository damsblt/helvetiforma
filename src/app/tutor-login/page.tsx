'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function TutorLoginPage() {
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      setIsAlreadyLoggedIn(true);
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/tableau-de-bord');
      }, 2000);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.login({
        identifier: formData.identifier,
        password: formData.password
      });

      if (result.success) {
        router.push('/tableau-de-bord');
      } else {
        setError(result.message || 'Identifiants incorrects. Veuillez vérifier votre email/nom d\'utilisateur et mot de passe.');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer plus tard.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isAlreadyLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Déjà connecté</h2>
          <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre espace HelvetiForma
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-900 mb-2">
                Email ou nom d'utilisateur
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="votre.email@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <Link href="/mot-de-passe-oublie" className="text-sm text-blue-600 hover:text-blue-700">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Vous n'avez pas encore de compte ?{' '}
              <Link href="/inscription-des-apprenants" className="text-blue-600 hover:text-blue-700 font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Besoin d'aide ?
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• <Link href="/inscription-des-apprenants" className="underline hover:no-underline">Créer un compte apprenant</Link></p>
            <p>• <Link href="/inscription-des-formateurs-et-formatrices" className="underline hover:no-underline">Devenir formateur</Link></p>
            <p>• En cas de problème : <a href="mailto:support@helvetiforma.ch" className="underline hover:no-underline">support@helvetiforma.ch</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
