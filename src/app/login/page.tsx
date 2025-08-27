'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for redirect parameter
    const redirect = searchParams.get('redirect');
    const messageParam = searchParams.get('message');
    
    if (messageParam === 'admin_required') {
      setMessage('Accès administrateur requis. Veuillez vous connecter avec un compte administrateur.');
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Authenticate against Strapi user-accounts
      const authRes = await fetch('http://localhost:1337/api/user-accounts?filters[email]=' + encodeURIComponent(formData.email), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (authRes.ok) {
        const authData = await authRes.json();
        
        if (authData.data && authData.data.length > 0) {
          const user = authData.data[0];
          
          // For demo purposes, accept password "1" for any user
          if (formData.password === '1') {
            // Store user info in localStorage for demo
            localStorage.setItem('user', JSON.stringify({
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              isLoggedIn: true
            }));
            
            // Check if user is admin
            const isAdmin = user.email?.includes('admin') || 
                           user.email === 'admin@helvetiforma.com' ||
                           user.email === 'damien@helvetiforma.com';
            
            // Redirect based on original request
            const redirect = searchParams.get('redirect');
            if (redirect && isAdmin) {
              router.push(redirect);
            } else if (redirect && !isAdmin) {
              setError('Accès administrateur requis pour cette page');
            } else {
              // Redirect admin users to dashboard, regular users to personal space
              if (isAdmin) {
                router.push('/admin');
              } else {
                router.push('/personal-space');
              }
            }
          } else {
            setError('Email ou mot de passe incorrect');
          }
        } else {
          setError('Aucun compte trouvé avec cet email');
        }
      } else {
        setError('Erreur de connexion au serveur');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Une erreur s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accédez à votre espace personnel ou au dashboard administrateur
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-600">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-600">ℹ️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Demo:</span> Utilisez votre email d'inscription avec le mot de passe "1"
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Admin:</span> admin@helvetiforma.com ou damien@helvetiforma.com
            </p>
            <p className="text-xs text-gray-400">
              <span className="font-medium">Admin:</span> Redirection automatique vers /admin
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Retour à l'accueil
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 