'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';
import AdminCalendar from '@/components/AdminCalendar';
import { EventClickArg, DateSelectArg, EventChangeArg, EventDropArg } from '@fullcalendar/core';

interface Formation {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Type: 'Présentiel' | 'En ligne';
    Theme: 'salaires' | 'charges-sociales' | 'impot-a-la-source';
    difficulty: string;
    estimatedDuration: number;
    sessions?: Session[];
  };
}

interface Session {
  id: number;
  attributes: {
    date: string;
    formation?: Formation;
  };
}

export default function AdminCalendarPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Session creation form state
  const [sessionForm, setSessionForm] = useState({
    formationId: '',
    date: '',
    duration: 2
  });

  // Delete functionality state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get category from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/formations?populate=*');
      if (response.ok) {
        const data = await response.json();
        console.log('Admin Calendar Page: Fetched data:', data);
        setFormations(data.data || []);
      } else {
        console.error('Admin Calendar Page: API response not ok:', response.status);
        setError(`Erreur API: ${response.status}`);
        setFormations([]);
      }
    } catch (error) {
      console.error('Error fetching formations:', error);
      setError('Erreur de connexion au serveur');
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFormations = useCallback(() => {
    let filtered = [...formations];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(formation => formation.attributes.Theme === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(formation => 
        formation.attributes.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.attributes.Description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFormations(filtered);
  }, [formations, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    filterFormations();
  }, [filterFormations]);

  const handleEventClick = (eventInfo: EventClickArg) => {
    setSelectedEvent(eventInfo);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selectedDate = new Date(selectInfo.start);
    setSelectedDate(selectedDate);
    setSessionForm({
      formationId: '',
      date: selectedDate.toISOString().slice(0, 16),
      duration: 2
    });
    setShowCreateSession(true);
  };

  const handleEventChange = (changeInfo: EventChangeArg) => {
    console.log('Event changed:', changeInfo);
    // Here you would typically update the session in your backend
    // For now, we'll just log the change
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    console.log('Event dropped:', dropInfo);
    // Here you would typically update the session date in your backend
    // For now, we'll just log the drop
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    console.log('Debug - sessionToDelete:', sessionToDelete);
    console.log('Debug - sessionId:', sessionToDelete.sessionId);

    if (!sessionToDelete.sessionId) {
      alert('Erreur: ID de session manquant');
      setIsDeleting(false);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sessions?id=${sessionToDelete.sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh formations to update the calendar
        await fetchFormations();
        setSelectedEvent(null);
        setShowDeleteConfirm(false);
        setSessionToDelete(null);
        alert('Session supprimée avec succès!');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Erreur lors de la suppression de la session');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (event: any) => {
    console.log('Debug - confirmDelete called with event:', event);
    console.log('Debug - event.sessionId:', event.sessionId);
    setSessionToDelete(event);
    setShowDeleteConfirm(true);
  };



  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({}, '', url.toString());
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url.toString());
  };

  const handleCreateSession = async (formationId: number, date: string, duration: number) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            date: date,
            formation: formationId,
          },
        }),
      });

      if (response.ok) {
        setShowCreateSession(false);
        setSelectedDate(null);
        fetchFormations(); // Refresh the calendar
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const getCategoryStats = () => {
    const stats = {
      'salaires': 0,
      'charges-sociales': 0,
      'impot-a-la-source': 0,
      total: 0
    };

    formations.forEach(formation => {
      if (formation.attributes.sessions && formation.attributes.sessions.length > 0) {
        stats[formation.attributes.Theme]++;
        stats.total++;
      }
    });

    return stats;
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
          <p className="mt-2 text-sm text-gray-500">Chargement des formations...</p>
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
              fetchFormations();
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Calendrier Administrateur</h1>
              <p className="text-sm md:text-base text-gray-600">
                Gérez les formations et sessions. Glissez-déposez pour modifier les horaires.
              </p>
            </div>
            <Link 
              href="/admin" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Retour au dashboard
            </Link>
          </div>
        </div>

        {/* Category Statistics */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200">
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200">
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats['salaires']}</div>
            <div className="text-xs md:text-sm text-gray-600">Salaires</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200">
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats['charges-sociales']}</div>
            <div className="text-xs md:text-sm text-gray-600">Charges Sociales</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-gray-200">
            <div className="text-lg md:text-2xl font-bold text-purple-600">{stats['impot-a-la-source']}</div>
            <div className="text-xs md:text-sm text-gray-600">Impôt à la Source</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => handleCategoryChange('salaires')}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                  selectedCategory === 'salaires'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Salaires ({stats['salaires']})
              </button>
              <button
                onClick={() => handleCategoryChange('charges-sociales')}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                  selectedCategory === 'charges-sociales'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Charges Sociales ({stats['charges-sociales']})
              </button>
              <button
                onClick={() => handleCategoryChange('impot-a-la-source')}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                  selectedCategory === 'impot-a-la-source'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Impôt à la Source ({stats['impot-a-la-source']})
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || searchTerm) && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <span>Filtres actifs:</span>
            {selectedCategory !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {selectedCategory}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                "{searchTerm}"
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}



        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <AdminCalendar
            formations={filteredFormations}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            onEventChange={handleEventChange}
            onEventDrop={handleEventDrop}
            height="700px"
          />
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de la Session
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Formation:</span>
                  <p className="text-gray-900">{selectedEvent.event.extendedProps.originalTitle || selectedEvent.event.title}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-900">
                    {new Date(selectedEvent.event.start!).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Heure:</span>
                  <p className="text-gray-900">
                    {new Date(selectedEvent.event.start!).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - {new Date(selectedEvent.event.end!).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900">{selectedEvent.event.extendedProps.type}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Thème:</span>
                  <p className="text-gray-900">{selectedEvent.event.extendedProps.theme}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Difficulté:</span>
                  <p className="text-gray-900">{selectedEvent.event.extendedProps.difficulty}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Durée:</span>
                  <p className="text-gray-900">{selectedEvent.event.extendedProps.duration} heures</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Navigate to formation details or edit
                    window.location.href = `/admin/formations/${selectedEvent.event.extendedProps.formationId}`;
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => confirmDelete(selectedEvent.event.extendedProps)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateSession && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Créer une Nouvelle Session
                </h3>
                <button
                  onClick={() => {
                    setShowCreateSession(false);
                    setSelectedDate(null);
                    setSessionForm({ formationId: '', date: '', duration: 2 });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formation
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.formationId}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, formationId: e.target.value }))}
                  >
                    <option value="">Sélectionnez une formation</option>
                    {formations.map((formation) => (
                      <option key={formation.id} value={formation.id}>
                        {formation.attributes.Theme === 'salaires' ? 'Salaires' : 
                         formation.attributes.Theme === 'charges-sociales' ? 'Charges sociales' :
                         formation.attributes.Theme === 'impot-a-la-source' ? 'Impôt à la source' :
                         formation.attributes.Title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date et Heure
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (heures)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 2 }))}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateSession(false);
                    setSelectedDate(null);
                    setSessionForm({ formationId: '', date: '', duration: 2 });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (sessionForm.formationId && sessionForm.date) {
                      handleCreateSession(
                        parseInt(sessionForm.formationId),
                        sessionForm.date,
                        sessionForm.duration
                      );
                    } else {
                      alert('Veuillez sélectionner une formation et une date');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && sessionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirmer la suppression
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Formation:</strong> {sessionToDelete.originalTitle}<br />
                    <strong>Thème:</strong> {sessionToDelete.theme}<br />
                    <strong>Type:</strong> {sessionToDelete.type}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSessionToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteSession}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
