'use client';

import React, { useState, useEffect } from 'react';

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
    Theme: 'Salaire' | 'Assurances sociales' | 'Impôt à la source';
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

  // Get category from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    filterFormations();
  }, [formations, selectedCategory, searchTerm]);

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations?populate=*');
      if (response.ok) {
        const data = await response.json();
        setFormations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFormations = () => {
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
  };

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
      'Salaire': 0,
      'Assurances sociales': 0,
      'Impôt à la source': 0,
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier Administrateur</h1>
          <p className="text-gray-600">
            Gérez les formations et sessions. Glissez-déposez pour modifier les horaires.
          </p>
        </div>

        {/* Category Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats['Salaire']}</div>
            <div className="text-sm text-gray-600">Salaires</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats['Assurances sociales']}</div>
            <div className="text-sm text-gray-600">Charges Sociales</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats['Impôt à la source']}</div>
            <div className="text-sm text-gray-600">Impôt à la Source</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => handleCategoryChange('Salaire')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'Salaire'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Salaires ({stats['Salaire']})
              </button>
              <button
                onClick={() => handleCategoryChange('Assurances sociales')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'Assurances sociales'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Charges Sociales ({stats['Assurances sociales']})
              </button>
              <button
                onClick={() => handleCategoryChange('Impôt à la source')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'Impôt à la source'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Impôt à la Source ({stats['Impôt à la source']})
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                        {formation.attributes.Theme === 'Salaire' ? 'Salaires' : 
                         formation.attributes.Theme === 'Assurances sociales' ? 'Charges sociales' :
                         formation.attributes.Theme === 'Impôt à la source' ? 'Impôt à la source' :
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
      </div>
    </div>
  );
}
