'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?redirect=/admin');
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Check if user is admin (email contains 'admin' or specific admin emails)
      const isAdminUser = user.email?.includes('admin') || 
                         user.email === 'admin@helvetiforma.com' ||
                         user.email === 'damien@helvetiforma.com';
      
      if (!isAdminUser) {
        router.push('/login?message=admin_required');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login?redirect=/admin');
      return;
    } finally {
      setIsLoading(false);
    }
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

  if (!isAdmin) {
    return null; // Will redirect
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
              <button
                onClick={() => {
                  localStorage.removeItem('user');
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
      <main className="py-8">
        {children}
      </main>
    </div>
  );
} 