'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isLoggedIn: boolean;
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
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFormations, setIsLoadingFormations] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const userInfo = JSON.parse(userData);
      if (userInfo.isLoggedIn) {
        setUser(userInfo);
        // Fetch user's registrations
        fetchUserRegistrations(userInfo.id);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const fetchUserRegistrations = async (userId: number) => {
    try {
      // Fetch user's registrations with formation data (avoiding sessions field)
      const res = await fetch(`http://localhost:1337/api/registrations?filters[userAccount][id][$eq]=${userId}&populate[formation][fields]=Title,Description,Type,Theme`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('User registrations:', data);
        
        if (data.data && data.data.length > 0) {
          const userRegistrations = data.data.map((reg: any) => ({
            id: reg.id,
            formation: {
              id: reg.formation.id,
              Title: reg.formation.Title || 'Formation sans titre',
              Description: reg.formation.Description || '',
              Type: reg.formation.Type || 'En ligne',
              Theme: reg.formation.Theme || ''
            },
            status: reg.status || 'pending',
            createdAt: reg.createdAt
          }));
          setRegistrations(userRegistrations);
        }
      } else {
        console.error('Failed to fetch registrations:', res.status);
        const errorText = await res.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoadingFormations(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
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
                  <p className="text-gray-900 font-semibold">{registrations.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* My Formations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Formations</h2>

              {isLoadingFormations ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-600">Chargement de vos formations...</p>
                </div>
              ) : registrations.length > 0 ? (
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {registration.formation.Title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {registration.formation.Description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Type: {registration.formation.Type}</span>
                            {registration.formation.Theme && (
                              <span>Thème: {registration.formation.Theme}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(registration.status)}
                          <span className="text-xs text-gray-400">
                            Inscrit le {formatDate(registration.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/formations/${registration.formation.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Voir les détails
                        </Link>
                        {registration.status === 'confirmed' && (
                          <Link
                            href={`/formation-docs/${registration.formation.id}`}
                            className="text-sm text-green-600 hover:text-green-800 underline"
                          >
                            Accéder aux documents
                          </Link>
                        )}
                        {registration.status === 'pending' && (
                          <span className="text-sm text-yellow-600">
                            ⏳ En attente d'approbation
                          </span>
                        )}
                        {registration.status === 'cancelled' && (
                          <span className="text-sm text-red-600">
                            ❌ Inscription annulée
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
              )}
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
                  href="/formations"
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