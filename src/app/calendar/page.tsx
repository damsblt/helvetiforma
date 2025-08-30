'use client';

import React, { useState, useEffect } from 'react';
import FormationCalendar from '@/components/FormationCalendar';
import FormationRegistrationForm from '@/components/FormationRegistrationForm';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';

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

export default function CalendarPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    console.log('Date selected:', selectInfo.startStr);
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek') => {
    setSelectedView(view);
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

  const handleRegistrationSubmit = (formData: any) => {
    console.log('Registration submitted:', formData);
    // Here you would typically send the data to your backend
    // For now, we'll just show a success message and close the form
    alert('Inscription soumise avec succès ! Nous vous contacterons bientôt pour confirmer votre inscription.');
    setShowRegistrationForm(false);
    setSelectedEvent(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier des Formations</h1>
          <p className="text-gray-600">
            Consultez toutes les formations disponibles et leurs sessions programmées
          </p>
        </div>

        {/* Category Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats['Salaire']}</div>
            <div className="text-sm text-gray-600">Salaires</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats['Assurances sociales']}</div>
            <div className="text-sm text-gray-600">Charges Sociales</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{stats['Impôt à la source']}</div>
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
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Salaires ({stats['Salaire']})
              </button>
              <button
                onClick={() => handleCategoryChange('Assurances sociales')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'Assurances sociales'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Charges Sociales ({stats['Assurances sociales']})
              </button>
              <button
                onClick={() => handleCategoryChange('Impôt à la source')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'Impôt à la source'
                    ? 'bg-orange-600 text-white'
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
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {selectedCategory}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredFormations.length === 0 ? (
            <p>Aucune formation trouvée avec les filtres actuels.</p>
          ) : (
            <p>
              Affichage de {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} 
              {selectedCategory !== 'all' && ` dans la catégorie "${selectedCategory}"`}
              {searchTerm && ` correspondant à "${searchTerm}"`}
            </p>
          )}
        </div>

        {/* View Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => handleViewChange('dayGridMonth')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'dayGridMonth'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Vue Mensuelle
          </button>
          <button
            onClick={() => handleViewChange('timeGridWeek')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'timeGridWeek'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Vue Hebdomadaire
          </button>
          <button
            onClick={() => handleViewChange('timeGridDay')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'timeGridDay'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Vue Journalière
          </button>
          <button
            onClick={() => handleViewChange('listWeek')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'listWeek'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Vue Liste
          </button>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Formations en Présentiel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Formations en Ligne</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <FormationCalendar
            formations={filteredFormations}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            view={selectedView}
            height="700px"
          />
        </div>

        {/* Event Details Modal */}
        {selectedEvent && !showRegistrationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de la Formation
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
                  onClick={() => setShowRegistrationForm(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  S'inscrire à cette formation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedEvent && (
          <FormationRegistrationForm
            formationTitle={selectedEvent.event.extendedProps.originalTitle || selectedEvent.event.title}
            formationTheme={selectedEvent.event.extendedProps.theme}
            sessionDate={new Date(selectedEvent.event.start!).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            sessionTime={`${new Date(selectedEvent.event.start!).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${new Date(selectedEvent.event.end!).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}`}
            onClose={() => setShowRegistrationForm(false)}
            onSubmit={handleRegistrationSubmit}
          />
        )}
      </div>
    </div>
  );
}
