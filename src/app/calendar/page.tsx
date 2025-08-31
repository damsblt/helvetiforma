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
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  // Calculate statistics
  const stats = {
    total: filteredFormations.length,
    'Salaire': filteredFormations.filter(f => f.attributes.Theme === 'Salaire').length,
    'Assurances sociales': filteredFormations.filter(f => f.attributes.Theme === 'Assurances sociales').length,
    'Impôt à la source': filteredFormations.filter(f => f.attributes.Theme === 'Impôt à la source').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Chargement du calendrier...</h2>
            <p className="text-gray-600 mt-2">Récupération des formations disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Modern Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Calendrier des Formations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez et réservez vos formations en gestion des salaires, charges sociales et impôts à la source
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-sm md:text-base text-gray-600 font-medium">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stats['Salaire']}</div>
            <div className="text-sm md:text-base text-gray-600 font-medium">Salaires</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">{stats['Assurances sociales']}</div>
            <div className="text-sm md:text-base text-gray-600 font-medium">Charges Sociales</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{stats['Impôt à la source']}</div>
            <div className="text-sm md:text-base text-gray-600 font-medium">Impôt à la Source</div>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => handleCategoryChange('Salaire')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === 'Salaire'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Salaires ({stats['Salaire']})
              </button>
              <button
                onClick={() => handleCategoryChange('Assurances sociales')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === 'Assurances sociales'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Charges Sociales ({stats['Assurances sociales']})
              </button>
              <button
                onClick={() => handleCategoryChange('Impôt à la source')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === 'Impôt à la source'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Impôt à la Source ({stats['Impôt à la source']})
              </button>
            </div>
            
            {/* Search and Clear */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || searchTerm) && (
          <div className="mb-6 flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">Filtres actifs:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                {selectedCategory}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-green-600 hover:text-green-800 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Calendar Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <FormationCalendar
              formations={filteredFormations}
              view={selectedView}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              height="700px"
            />
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && !showRegistrationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Détails de la Formation
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">Formation:</span>
                  <p className="text-gray-900 mt-1">{selectedEvent.event.extendedProps.originalTitle || selectedEvent.event.title}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Date:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedEvent.event.start!).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Heure:</span>
                  <p className="text-gray-900 mt-1">
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
                  <span className="font-semibold text-gray-700">Type:</span>
                  <p className="text-gray-900 mt-1">{selectedEvent.event.extendedProps.type}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Thème:</span>
                  <p className="text-gray-900 mt-1">{selectedEvent.event.extendedProps.theme}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Difficulté:</span>
                  <p className="text-gray-900 mt-1">{selectedEvent.event.extendedProps.difficulty}</p>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  S'inscrire
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Fermer
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
            onClose={() => {
              setShowRegistrationForm(false);
              setSelectedEvent(null);
            }}
            onSubmit={(formData) => {
              console.log('Registration submitted:', formData);
              alert('Inscription soumise avec succès ! Nous vous contacterons bientôt pour confirmer votre inscription.');
              setShowRegistrationForm(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
