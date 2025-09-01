'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FormationRegistrationForm from '@/components/FormationRegistrationForm';

interface TrainingSession {
  id: number;
  formation_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  price: number;
  currency: string;
  status: string;
  instructor: string;
  type: string;
  difficulty: string;
  materials: string[];
  created_at: string;
  updated_at: string;
}

interface FormationRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function TrainingSessionsPage() {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchTrainingSessions();
  }, []);

  const fetchTrainingSessions = async () => {
    try {
      const response = await fetch('/api/training-sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch training sessions');
      }
      const data = await response.json();
      setTrainingSessions(data.data || []);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      setError('Erreur lors du chargement des sessions de formation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = (session: TrainingSession) => {
    setSelectedSession(session);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSubmit = async (formData: FormationRegistrationFormData) => {
    try {
      // Here you would typically send the enrollment data to your backend
      console.log('Enrollment data:', {
        ...formData,
        training_session_id: selectedSession?.id,
        formation_id: selectedSession?.formation_id
      });
      
      // For now, we'll just show a success message
      alert('Inscription enregistrée avec succès! Nous vous contacterons bientôt.');
      setShowRegistrationForm(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      alert('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'débutant': return 'bg-blue-100 text-blue-800';
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'avancé': return 'bg-orange-100 text-orange-800';
      case 'spécialisé': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'présentiel': return '🏢';
      case 'en ligne': return '💻';
      case 'hybride': return '🔄';
      default: return '📚';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getAvailabilityStatus = (session: TrainingSession) => {
    const available = session.max_participants - session.current_participants;
    if (available <= 0) return { text: 'Complet', color: 'text-red-600', bg: 'bg-red-50' };
    if (available <= 3) return { text: `${available} places restantes`, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: `${available} places disponibles`, color: 'text-green-600', bg: 'bg-green-50' };
  };

  // Filter and search training sessions
  const filteredSessions = trainingSessions.filter(session => {
    const matchesType = filterType === 'all' || session.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || session.difficulty === filterDifficulty;
    const matchesSearch = searchTerm === '' || 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesDifficulty && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des sessions de formation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchTrainingSessions}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Sessions de Formation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos prochaines sessions de formation et inscrivez-vous dès maintenant. 
            Des formations pratiques et professionnelles adaptées à tous les niveaux.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher par titre, description ou instructeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="présentiel">Présentiel</option>
                <option value="en ligne">En ligne</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les niveaux</option>
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
                <option value="spécialisé">Spécialisé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Training Sessions Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {filteredSessions.map((session) => {
            const availability = getAvailabilityStatus(session);
            const isFull = session.current_participants >= session.max_participants;
            
            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{getTypeIcon(session.type)}</span>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {session.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {session.description}
                  </p>

                  {/* Availability */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${availability.bg}`}>
                    <span className={availability.color}>{availability.text}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  {/* Date and Time */}
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(session.start_date)} - {formatDate(session.end_date)}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {session.location}
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {session.instructor}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">
                      {session.price} {session.currency}
                    </div>
                    <button
                      onClick={() => handleEnroll(session)}
                      disabled={isFull}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {isFull ? 'Complet' : 'S\'inscrire'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session trouvée</h3>
            <p className="text-gray-600 mb-4">
              Aucune session de formation ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterDifficulty('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedSession && (
          <FormationRegistrationForm
            formationTitle={selectedSession.title}
            formationTheme={selectedSession.type}
            sessionDate={`${formatDate(selectedSession.start_date)} - ${formatDate(selectedSession.end_date)}`}
            sessionTime={`${formatTime(selectedSession.start_time)} - ${formatTime(selectedSession.end_time)}`}
            onClose={() => {
              setShowRegistrationForm(false);
              setSelectedSession(null);
            }}
            onSubmit={handleRegistrationSubmit}
          />
        )}
      </div>
    </div>
  );
}
