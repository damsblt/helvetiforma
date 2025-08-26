'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SetupPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await fetch(`http://localhost:1337/api/password-setup-tokens?filters[token]=${token}&populate=*`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const tokenData = data.data[0];
          const expiresAt = new Date(tokenData.expiresAt);
          const now = new Date();

          if (expiresAt > now && !tokenData.isUsed) {
            setTokenValid(true);
            setUserEmail(tokenData.email);
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      // Update user account password
      const userRes = await fetch(`http://localhost:1337/api/user-accounts?filters[email]=${userEmail}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.data && userData.data.length > 0) {
          const userId = userData.data[0].id;

          // Update password
          const updateRes = await fetch(`http://localhost:1337/api/user-accounts/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                password: password
              }
            }),
          });

          if (updateRes.ok) {
            // Mark token as used
            const tokenRes = await fetch(`http://localhost:1337/api/password-setup-tokens?filters[token]=${token}`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (tokenRes.ok) {
              const tokenData = await tokenRes.json();
              if (tokenData.data && tokenData.data.length > 0) {
                const tokenId = tokenData.data[0].id;
                await fetch(`http://localhost:1337/api/password-setup-tokens/${tokenId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    data: {
                      isUsed: true
                    }
                  }),
                });
              }
            }

            setStatus('success');
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Lien invalide</h1>
            <p className="text-gray-600 mb-6 text-center">
              Ce lien de configuration de mot de passe est invalide ou a expiré.
            </p>
            <div className="text-center">
              <Link href="/personal-space" className="text-blue-600 hover:text-blue-800">
                Retour à l'espace personnel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Lien expiré</h1>
            <p className="text-gray-600 mb-6 text-center">
              Ce lien de configuration de mot de passe a expiré ou a déjà été utilisé.
            </p>
            <div className="text-center">
              <Link href="/personal-space" className="text-blue-600 hover:text-blue-800">
                Retour à l'espace personnel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <span className="text-green-600 text-4xl mb-4 block">✅</span>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Mot de passe configuré!</h1>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été configuré avec succès. Vous pouvez maintenant vous connecter à votre espace personnel.
              </p>
              <Link 
                href="/personal-space" 
                className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Accéder à mon espace personnel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Configurer votre mot de passe</h1>
          <p className="text-gray-600 mb-6 text-center">
            Configurez votre mot de passe pour accéder à votre espace personnel.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 6 caractères"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Répétez votre mot de passe"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Configuration...' : 'Configurer le mot de passe'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous recevrez un email de confirmation une fois votre mot de passe configuré.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 