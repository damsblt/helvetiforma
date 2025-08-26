'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalFormations: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFormations: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    totalUsers: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch formations count
      const formationsRes = await fetch('http://localhost:1337/api/formations');
      const formationsData = await formationsRes.json();
      
      // Fetch registrations with status counts
      const registrationsRes = await fetch('http://localhost:1337/api/registrations?populate=formation,userAccount');
      const registrationsData = await registrationsRes.json();
      
      // Fetch users count
      const usersRes = await fetch('http://localhost:1337/api/user-accounts');
      const usersData = await usersRes.json();

      const registrations = registrationsData.data || [];
      const pendingCount = registrations.filter((r: any) => r.status === 'pending').length;
      const confirmedCount = registrations.filter((r: any) => r.status === 'confirmed').length;

      // Generate recent activity from registrations
      const recentActivity = registrations
        .slice(0, 5)
        .map((registration: any) => ({
          id: registration.id.toString(),
          type: 'registration',
          message: `Nouvelle inscription à "${registration.formation?.Title || 'Formation inconnue'}"`,
          timestamp: registration.createdAt
        }));

      setStats({
        totalFormations: formationsData.data?.length || 0,
        pendingRegistrations: pendingCount,
        confirmedRegistrations: confirmedCount,
        totalUsers: usersData.data?.length || 0,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-xl lg:text-2xl">📚</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Formations</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalFormations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-xl lg:text-2xl">⏳</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">En attente</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-xl lg:text-2xl">✅</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Confirmées</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.confirmedRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-purple-600 text-xl lg:text-2xl">👥</span>
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Utilisateurs</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
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
              Créez et modifiez les formations directement dans votre interface.
            </p>
            <Link 
              href="/admin/content"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
            >
              Gérer le contenu
            </Link>
          </div>

          {/* Users Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-purple-600 text-2xl mr-3">👥</span>
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Consultez et gérez les utilisateurs inscrits.
            </p>
            <Link 
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
            >
              Gérer les utilisateurs
            </Link>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-orange-600 text-2xl mr-3">📊</span>
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Consultez les statistiques et rapports de votre plateforme.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700">
              Voir les analytics
            </button>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-gray-600 text-2xl mr-3">⚙️</span>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Accès aux paramètres avancés de la plateforme.
            </p>
            <a 
              href="http://localhost:1337/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Paramètres avancés
            </a>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-red-600 text-2xl mr-3">⚡</span>
              <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Accès rapide aux actions les plus fréquentes.
            </p>
            <div className="space-y-2">
              <Link href="/admin/content" className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded block">
                + Nouvelle formation
              </Link>
              <Link href="/admin/registrations" className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded block">
                Gérer inscriptions
              </Link>
              <Link href="/admin/users" className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded block">
                Voir utilisateurs
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
          </div>
          <div className="p-6">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{activity.message}</span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 