'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';
import Link from 'next/link';

interface DashboardStats {
  totalFormations: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFormations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch formations count from our Next.js API
      const formationsRes = await fetch('/api/formations');
      const formationsData = await formationsRes.json();
      
      // For now, use mock data for registrations and users since we don't have those APIs yet
      // In the future, you can create /api/registrations and /api/users endpoints
      const mockRegistrations = [];
      const mockUsers = [];

      setStats({
        totalFormations: formationsData.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats on error
      setStats({
        totalFormations: 0
      });
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h1>
            <p className="text-gray-600">Récupération des statistiques</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600">Gérez votre plateforme de formations</p>
        </div>



        {/* Admin Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Registrations Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-blue-600 text-2xl mr-3">📋</span>
              <h3 className="text-lg font-semibold text-gray-900">Inscriptions</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gérez les inscriptions aux formations, approuvez ou rejetez les demandes.
            </p>
            <Link 
              href="/admin/registrations"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Gérer les inscriptions
            </Link>
          </div>

          {/* Content Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-green-600 text-2xl mr-3">📝</span>
              <h3 className="text-lg font-semibold text-gray-900">Contenu</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Modifiez le contenu de votre site web directement depuis cette interface.
            </p>
            <Link 
              href="/admin/content"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
            >
              Gérer le contenu
            </Link>
          </div>



          {/* Calendar Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-orange-600 text-2xl mr-3">📅</span>
              <h3 className="text-lg font-semibold text-gray-900">Calendrier</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Créez et gérez les sessions de formation dans le calendrier.
            </p>
            <Link 
              href="/admin/calendar"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
            >
              Gérer le calendrier
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
} 