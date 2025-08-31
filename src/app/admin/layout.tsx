'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple admin check using authService
    if (!authService.isAuthenticated()) {
      router.push('/login?redirect=/admin');
      return;
    }

    const user = authService.getUser();
    if (!user || !user.isAdmin) {
      router.push('/login?message=admin_required');
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'administration...</p>
          <p className="text-sm text-gray-400 mt-2">Zone d'administration sécurisée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-blue-700 hover:text-blue-800 font-medium">
                ← Retour au site
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Administration</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-blue-700 transition"
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/registrations"
                className="text-gray-600 hover:text-blue-700 transition"
              >
                Inscriptions
              </Link>
              <Link
                href="/admin/content"
                className="text-gray-600 hover:text-blue-700 transition"
              >
                Contenu
              </Link>
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-blue-700 transition"
              >
                Utilisateurs
              </Link>
              <Link
                href="/admin/api-control"
                className="text-gray-600 hover:text-blue-700 transition"
              >
                Contrôle API
              </Link>
              <Link
                href="/admin/calendar"
                className="text-gray-600 hover:text-blue-700 transition"
              >
                Calendrier
              </Link>
              <button
                onClick={async () => {
                  await authService.logout();
                  router.push('/');
                }}
                className="text-red-600 hover:text-red-800 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 