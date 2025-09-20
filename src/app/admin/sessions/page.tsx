'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface Session {
  id: number;
  date: string;
  formation: {
    id: number;
    title: string;
    theme: string;
    type: string;
    difficulty: string;
    estimatedDuration: number;
  };
  location?: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  instructor?: string;
  notes?: string;
}

export default function SessionsManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      } else {
        setError('Erreur lors du chargement des sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = searchTerm === '' || 
      session.formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.formation.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.instructor && session.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programmée' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getThemeColor = (theme: string) => {
    const themeColors = {
      'salaires': 'bg-blue-50 border-blue-200 text-blue-800',
      'charges-sociales': 'bg-green-50 border-green-200 text-green-800',
      'impot-a-la-source': 'bg-purple-50 border-purple-200 text-purple-800'
    };
    
    return themeColors[theme as keyof typeof themeColors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchSessions();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Sessions</h1>
              <p className="text-lg text-gray-600">Gérez toutes les sessions de formation</p>
            </div>
            <Link 
              href="/admin/inperson" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Retour aux formations présentielles
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes ({sessions.length})
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Programmées ({sessions.filter(s => s.status === 'scheduled').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Terminées ({sessions.filter(s => s.status === 'completed').length})
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Annulées ({sessions.filter(s => s.status === 'cancelled').length})
              </button>
            </div>
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par formation, thème ou instructeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Sessions ({filteredSessions.length})
            </h2>
          </div>
          
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session trouvée</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Aucune session ne correspond à votre recherche.' : 'Aucune session disponible.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.formation.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getThemeColor(session.formation.theme)}`}>
                          {session.formation.theme}
                        </span>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span>
                          <p className="text-gray-900">{formatDate(session.date)}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="text-gray-900">{session.formation.type}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Participants:</span>
                          <p className="text-gray-900">
                            {session.currentParticipants}/{session.maxParticipants}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Durée:</span>
                          <p className="text-gray-900">{session.formation.estimatedDuration}h</p>
                        </div>
                      </div>
                      
                      {session.instructor && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Instructeur:</span> {session.instructor}
                        </div>
                      )}
                      
                      {session.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {session.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
                        Modifier
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
