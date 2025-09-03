'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function ConstructionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>('/');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      router.push('/');
    }
    
    // Get redirect parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ identifier: email, password });
      if (response.success) {
        // Show success message briefly
        setError(''); // Clear any previous errors
        
        // Add a small delay to show success feedback
        setTimeout(() => {
          // Use the stored redirect destination, or fallback to smart redirect
          let redirectUrl = redirectTo;
          
          // If no specific redirect, try to go back to where user was
          if (redirectTo === '/') {
            const referrer = document.referrer;
            if (referrer && referrer.includes(window.location.origin)) {
              try {
                const referrerUrl = new URL(referrer);
                if (referrerUrl.pathname !== '/construction' && referrerUrl.pathname !== '/login') {
                  redirectUrl = referrerUrl.pathname;
                }
              } catch (e) {
                redirectUrl = '/';
              }
            }
          }
          
          // Force a complete page refresh to load the main website
          window.location.href = redirectUrl;
        }, 500);
      } else {
        setError(response.message || 'Identifiants incorrects');
      }
    } catch (error) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showLogin) {
      setShowLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Custom Navbar for Construction Page */}
      <nav className="bg-white bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-white">HelvetiForma</h1>
              <span className="px-3 py-1 bg-yellow-400 bg-opacity-20 text-yellow-300 text-sm rounded-full border border-yellow-400 border-opacity-30">
                🚧 En Construction
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm opacity-80">
                Lancement: Décembre 2024
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Construction Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Construction Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 rounded-full mb-6">
              <svg className="w-12 h-12 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Site en Construction
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Nous travaillons actuellement sur quelque chose d'incroyable. 
            Revenez bientôt pour découvrir notre nouvelle plateforme de formation !
          </p>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="w-full bg-blue-700 rounded-full h-3 mb-4">
              <div className="bg-yellow-400 h-3 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-blue-200 text-sm">Progression: 75%</p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-yellow-400 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Formations en Ligne</h3>
              <p className="text-blue-200 text-sm">Cours interactifs et modules d'apprentissage</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-yellow-400 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Calendrier Interactif</h3>
              <p className="text-blue-200 text-sm">Planification et réservation de sessions</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-yellow-400 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Suivi des Progrès</h3>
              <p className="text-blue-200 text-sm">Tableaux de bord et certifications</p>
            </div>
          </div>

          {/* Access Section */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Accès Privilégié
            </h2>
            
            {!showLogin ? (
              <div>
                <p className="text-blue-200 mb-6">
                  Vous avez des identifiants d'accès ? 
                  Appuyez sur Entrée ou cliquez ci-dessous pour vous connecter.
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  onKeyPress={handleKeyPress}
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105"
                >
                  Accéder au Site
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="max-w-md mx-auto">
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600 text-yellow-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="px-6 py-3 text-blue-200 hover:text-white border border-blue-300 border-opacity-30 rounded-lg transition-colors duration-200"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-12 text-blue-200">
            <p className="mb-2">
              <strong>HelvetiForma</strong> - Formation continue en Suisse
            </p>
            <p className="text-sm">
              Pour toute question : contact@helvetiforma.ch
            </p>
          </div>

          {/* Estimated Launch */}
          <div className="mt-8 p-4 bg-yellow-400 bg-opacity-20 rounded-lg border border-yellow-400 border-opacity-30">
            <p className="text-yellow-200 text-sm">
              🚀 <strong>Lancement prévu :</strong> Décembre 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
