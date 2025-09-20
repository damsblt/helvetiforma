'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface InPersonStats {
  totalSessions: number;
  upcomingSessions: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  totalParticipants: number;
}

export default function InPersonManagementPage() {
  const [stats, setStats] = useState<InPersonStats>({
    totalSessions: 0,
    upcomingSessions: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    totalParticipants: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInPersonStats();
  }, []);

  const fetchInPersonStats = async () => {
    try {
      // Fetch registrations data
      const registrationsRes = await fetch('/api/registrations');
      const registrationsData = registrationsRes.ok ? await registrationsRes.json() : { data: [] };
      
      // Mock data for sessions (replace with real API calls)
      const mockSessions = 15;
      const mockUpcomingSessions = 8;
      const mockParticipants = 45;

      setStats({
        totalSessions: mockSessions,
        upcomingSessions: mockUpcomingSessions,
        totalRegistrations: registrationsData.data?.length || 0,
        pendingRegistrations: registrationsData.data?.filter((r: any) => r.status === 'pending').length || 0,
        confirmedRegistrations: registrationsData.data?.filter((r: any) => r.status === 'confirmed').length || 0,
        totalParticipants: mockParticipants
      });
    } catch (error) {
      console.error('Error fetching in-person stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données formations présentielles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Formations Présentielles</h1>
              <p className="text-lg text-gray-600">Gérez vos sessions en présentiel et les inscriptions</p>
            </div>
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              ← Retour au dashboard
            </Link>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sessions Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">À Venir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
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
                <p className="text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Management */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📅</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Calendrier</h2>
                  <p className="text-green-100">Planifiez et gérez vos sessions de formation</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">📅</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Calendrier</h3>
                      <p className="text-sm text-gray-600">Planifier les sessions de formation</p>
                    </div>
                  </div>
                  <Link 
                    href="/admin/calendar"
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    Accéder
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Management */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Gestion Sessions</h2>
                  <p className="text-blue-100">Gérez toutes les sessions de formation</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">🎯</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sessions</h3>
                      <p className="text-sm text-gray-600">Voir et gérer toutes les sessions</p>
                    </div>
                  </div>
                  <Link 
                    href="/admin/sessions"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Accéder
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Registrations Management */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📋</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Gestion Inscriptions</h2>
                  <p className="text-yellow-100">Gérez les inscriptions aux formations</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-yellow-600 text-sm">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Gestion Inscriptions</h3>
                      <p className="text-sm text-gray-600">Approuver et gérer les inscriptions</p>
                    </div>
                  </div>
                  <Link 
                    href="/admin/registrations"
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
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