'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  date: string;
  modified: string;
  author: any;
  guid: string;
  thumbnail_url: string | null;
  meta: {
    course_duration: string;
    course_level: string;
    course_price: string;
    course_rating: number;
    course_rating_count: number;
    course_students_count: number;
    course_thumbnail: string | null;
    course_categories: string[];
    course_tags: string[];
    course_benefits: string[];
    course_requirements: string[];
    course_target_audience: string[];
    course_material_includes: string[];
    course_settings: any;
    course_price_type: string[];
  };
}

export default function CourseSelectionPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tutor-courses');
      const result = await response.json();

      if (result.success) {
        setCourses(result.data.courses);
      } else {
        setError(result.error || 'Erreur lors du chargement des cours');
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Impossible de charger les cours. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleViewCourse = () => {
    if (selectedCourse) {
      router.push(`/student-dashboard/course/${selectedCourse.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sélectionner un cours
              </h1>
              <p className="text-gray-600">
                Choisissez un cours pour accéder à son contenu et suivre votre progression
              </p>
            </div>
            <Link
              href="/student-dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Mes cours disponibles ({courses?.length || 0})
            </h2>
            
            <div className="space-y-4">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                      selectedCourse?.id === course.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCourseSelect(course)}
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.meta.course_level}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {course.meta.course_duration}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {course.meta.course_price}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(course.meta.course_rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {course.meta.course_rating} ({course.meta.course_rating_count} avis)
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.excerpt || course.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'}
                      </p>
                    </div>

                    {course.meta.course_thumbnail && (
                      <div className="ml-4">
                        <img
                          src={course.meta.course_thumbnail}
                          alt={course.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {selectedCourse?.id === course.id && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center text-blue-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Cours sélectionné
                      </div>
                    </div>
                  )}
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📚</div>
                  <p className="text-gray-600">Aucun cours disponible pour le moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Preview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Aperçu du cours
            </h2>
            
            {selectedCourse ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedCourse.title}
                  </h3>
                  
                  {selectedCourse.meta.course_thumbnail && (
                    <img
                      src={selectedCourse.meta.course_thumbnail}
                      alt={selectedCourse.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="prose max-w-none mb-6">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: (selectedCourse.content || selectedCourse.excerpt || 'Aucune description disponible.')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>')
                          .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
                          .replace(/<p[^>]*>/g, '') // Remove opening p tags
                          .replace(/<\/p>/g, '') // Remove closing p tags
                          .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
                      }}
                    />
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-medium">{selectedCourse.meta.course_duration}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Niveau</span>
                    <span className="font-medium">{selectedCourse.meta.course_level}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Prix</span>
                    <span className="font-medium">{selectedCourse.meta.course_price}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Publié le</span>
                    <span className="font-medium">{formatDate(selectedCourse.date)}</span>
                  </div>
                </div>

                {/* Course Benefits */}
                {selectedCourse.meta.course_benefits && selectedCourse.meta.course_benefits.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Ce que vous apprendrez</h4>
                    <ul className="space-y-2">
                      {selectedCourse.meta.course_benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <div className="space-y-3">
                <Link
                  href={`/student-dashboard/course/${selectedCourse.id}/learn`}
                  className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium block"
                >
                  Commencer le cours
                </Link>
                  <Link
                    href={`/formations/${selectedCourse.id}`}
                    className="w-full bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium block"
                  >
                    Voir les détails complets
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez un cours
                  </h3>
                  <p className="text-gray-600">
                    Cliquez sur un cours dans la liste pour voir son aperçu et accéder à son contenu.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
