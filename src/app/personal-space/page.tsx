'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface Formation {
  id: number;
  Title: string;
  Description: string;
  Type: string;
  Theme: string;
}

interface Registration {
  id: number;
  formation: Formation;
  status: string;
  createdAt: string;
}

export default function PersonalSpacePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated using the same method as login page
    if (authService.isAuthenticated()) {
      const userInfo = authService.getUser();
      if (userInfo) {
        setUser(userInfo);
        
        // If user is admin, redirect to admin area where they can manage calendar
        if (userInfo.isAdmin) {
          console.log('User is admin, redirecting to admin area');
          router.push('/admin');
          return;
        }
      } else {
        // User data is invalid, redirect to login
        authService.clearAuth();
        router.push('/login');
      }
    } else {
      // Not authenticated, redirect to login
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmée</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Annulée</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h1>
            <p className="text-gray-600">Vérification de votre session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // If user is admin, show admin message
  if (user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirection...</h1>
            <p className="text-gray-600">Redirection vers la zone d'administration</p>
            <p className="text-sm text-gray-400 mt-2">Vous avez accès administrateur</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Personnel</h1>
              <p className="text-gray-600">Bienvenue, {user.firstName} {user.lastName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formations inscrites</label>
                  <p className="text-gray-900 font-semibold">{0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* My Formations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Formations</h2>

              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation inscrite</h3>
                <p className="text-gray-600 mb-4">Vous n'avez pas encore de formations inscrites.</p>
                <Link
                  href="/formations"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Découvrir nos formations
                </Link>
              </div>
            </div>

            {/* My Courses (for subscribers) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Cours E-learning</h2>

              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Accédez à vos cours</h3>
                <p className="text-gray-600 mb-4">Découvrez nos formations en ligne et suivez votre progression.</p>
                <Link
                  href="/elearning"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Accéder aux cours
                </Link>
              </div>
            </div>

            {/* My Documents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Documents</h2>

              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
                <p className="text-gray-600 mb-4">Vous n'avez pas encore de documents dans votre espace.</p>
                <Link
                  href="/docs"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Explorer les documents
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions rapides</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/products"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Formations</h3>
                    <p className="text-sm text-gray-600">Découvrir nos formations</p>
                  </div>
                </Link>

                <Link
                  href="/docs"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-2xl">📄</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Documents</h3>
                    <p className="text-sm text-gray-600">Accéder aux ressources</p>
                  </div>
                </Link>

                <Link
                  href="/elearning"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-shrink-0">
                    <span className="text-green-600 text-2xl">🎓</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">E-learning</h3>
                    <p className="text-sm text-gray-600">Suivre vos cours</p>
                  </div>
                </Link>

                <Link
                  href="/ia"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-2xl">🤖</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">IA Assistant</h3>
                    <p className="text-sm text-gray-600">Poser vos questions</p>
                  </div>
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-2xl">📧</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Contact</h3>
                    <p className="text-sm text-gray-600">Nous contacter</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 