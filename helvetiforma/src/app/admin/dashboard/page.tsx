'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalFormations: number;
  totalUsers: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  totalSessions: number;
  upcomingSessions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFormations: 0,
    totalUsers: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    totalSessions: 0,
    upcomingSessions: 0
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
      
      // Fetch registrations data
      const registrationsRes = await fetch('/api/registrations');
      const registrationsData = registrationsRes.ok ? await registrationsRes.json() : { data: [] };
      
      // Mock data for users and sessions (replace with real APIs when available)
      const mockUsers = 0;
      const mockSessions = 0;
      const mockUpcomingSessions = 0;

      setStats({
        totalFormations: formationsData.data?.length || 0,
        totalUsers: mockUsers,
        pendingRegistrations: registrationsData.data?.filter((r: any) => r.status === 'pending').length || 0,
        confirmedRegistrations: registrationsData.data?.filter((r: any) => r.status === 'confirmed').length || 0,
        totalSessions: mockSessions,
        upcomingSessions: mockUpcomingSessions
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalFormations: 0,
        totalUsers: 0,
        pendingRegistrations: 0,
        confirmedRegistrations: 0,
        totalSessions: 0,
        upcomingSessions: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-lg text-gray-600">Gérez votre plateforme de formations HelvetiForma</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📚</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Formations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFormations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* E-learning Management Section */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">💻</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">E-learning Management</h2>
                  <p className="text-blue-100">Gérez les formations en ligne et l'intégration WooCommerce</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">💻</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">E-learning Management</h3>
                      <p className="text-sm text-gray-600">Tutor LMS, WooCommerce, contenu</p>
                      <p className="text-xs text-blue-600 mt-1">↗ S'ouvre dans Tutor LMS</p>
                    </div>
                  </div>
                  <a 
                    href="https://api.helvetiforma.ch/wp-admin/admin.php?page=tutor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    Accéder
                    <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* In-Person Subscriptions Section */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🏢</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Formations Présentielles</h2>
                  <p className="text-green-100">Gérez les sessions en présentiel et les inscriptions</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Formations Présentielles</h3>
                      <p className="text-sm text-gray-600">Calendrier, inscriptions, sessions</p>
                    </div>
                  </div>
                  <Link 
                    href="/admin/inperson"
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    Accéder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 