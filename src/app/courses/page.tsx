'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import lmsService from '@/services/lmsService';

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  categories: number[];
  meta: {
    course_duration?: string;
    course_level?: string;
    course_price?: string;
    course_currency?: string;
    course_instructor?: string;
    course_capacity?: number;
    course_enrolled?: number;
    course_start_date?: string;
    course_end_date?: string;
    course_location?: string;
    course_type?: string;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const coursesData = await lmsService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Erreur lors du chargement des cours');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'débutant': return 'bg-blue-100 text-blue-800';
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'avancé': return 'bg-orange-100 text-orange-800';
      case 'spécialisé': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'présentiel': return '🏢';
      case 'en ligne': return '💻';
      case 'hybride': return '🔄';
      default: return '📚';
    }
  };

  const getAvailabilityStatus = (course: Course) => {
    const capacity = course.meta.course_capacity || 0;
    const enrolled = course.meta.course_enrolled || 0;
    const available = capacity - enrolled;
    
    if (capacity === 0) return { text: 'Illimité', color: 'text-green-600', bg: 'bg-green-50' };
    if (available <= 0) return { text: 'Complet', color: 'text-red-600', bg: 'bg-red-50' };
    if (available <= 3) return { text: `${available} places restantes`, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: `${available} places disponibles`, color: 'text-green-600', bg: 'bg-green-50' };
  };

  // Filter and search courses
  const filteredCourses = courses.filter(course => {
    const matchesLevel = filterLevel === 'all' || 
      course.meta.course_level?.toLowerCase() === filterLevel.toLowerCase();
    const matchesType = filterType === 'all' || 
      course.meta.course_type?.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.meta.course_instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLevel && matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des cours...</p>
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
              onClick={fetchCourses}
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
            Nos Cours de Formation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos cours spécialisés en gestion RH, fiscalité et comptabilité. 
            Des programmes complets avec suivi de progression et certificats.
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

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les niveaux</option>
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
                <option value="spécialisé">Spécialisé</option>
              </select>
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
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {filteredCourses.map((course) => {
            const availability = getAvailabilityStatus(course);
            const isFull = (course.meta.course_capacity || 0) > 0 && 
              (course.meta.course_enrolled || 0) >= (course.meta.course_capacity || 0);
            
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Featured Image */}
                {course.featured_image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={course.featured_image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{getTypeIcon(course.meta.course_type || 'standard')}</span>
                    <div className="flex gap-2">
                      {course.meta.course_level && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.meta.course_level)}`}>
                          {course.meta.course_level}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeIcon(course.meta.course_type || 'standard') === '🏢' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {course.meta.course_type || 'Standard'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {course.excerpt}
                  </p>

                  {/* Availability */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${availability.bg}`}>
                    <span className={availability.color}>{availability.text}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  {/* Duration */}
                  {course.meta.course_duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.meta.course_duration}
                    </div>
                  )}

                  {/* Location */}
                  {course.meta.course_location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {course.meta.course_location}
                    </div>
                  )}

                  {/* Instructor */}
                  {course.meta.course_instructor && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {course.meta.course_instructor}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">
                      {course.meta.course_price ? `${course.meta.course_price} ${course.meta.course_currency}` : 'Gratuit'}
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {isFull ? 'Complet' : 'Voir le cours'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-600 mb-4">
              Aucun cours ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterLevel('all');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Formation sur Mesure
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nos formations peuvent être adaptées aux besoins spécifiques de votre entreprise. 
            Contactez-nous pour discuter de vos besoins et obtenir un devis personnalisé.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Demander un devis personnalisé
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
