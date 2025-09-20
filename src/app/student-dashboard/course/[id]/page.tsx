'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function StudentCoursePage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const courseId = params.id;
      
      try {
        const response = await fetch(`/api/tutor-course/${courseId}`);
        const result = await response.json();

        if (result.success) {
          setCourse(result.data.course);
        } else {
          setError(result.error || 'Erreur lors du chargement du cours');
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError('Impossible de charger les détails du cours. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCourseDetails();
    }
  }, [params.id]);

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
        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
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
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
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
            <p className="mt-4 text-gray-600">Chargement du cours...</p>
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
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
              <Link
                href="/student-dashboard"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cours non trouvé</h2>
            <p className="text-gray-600 mb-8">Le cours demandé n'existe pas ou n'est plus disponible.</p>
            <Link
              href="/student-dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/student-dashboard" className="hover:text-blue-600">Tableau de bord</Link></li>
            <li><span>/</span></li>
            <li><Link href="/student-dashboard/select-course" className="hover:text-blue-600">Mes cours</Link></li>
            <li><span>/</span></li>
            <li className="text-gray-900">{course.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                  
                  {/* Course Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {course.meta.course_level}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {course.meta.course_duration}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {course.meta.course_price}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(course.meta.course_rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.meta.course_rating} ({course.meta.course_rating_count} avis)
                    </span>
                  </div>

                  {/* Categories and Tags */}
                  {((course.meta.course_categories && course.meta.course_categories.length > 0) || (course.meta.course_tags && course.meta.course_tags.length > 0)) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {course.meta.course_categories?.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {category}
                        </span>
                      ))}
                      {course.meta.course_tags?.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Course Image */}
                {course.meta.course_thumbnail && (
                  <div className="ml-6">
                    <img
                      src={course.meta.course_thumbnail}
                      alt={course.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Course Description */}
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: (course.content || course.excerpt || 'Aucune description disponible.')
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

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contenu du cours</h2>
              
              <div className="space-y-6">
                {/* Benefits */}
                {course.meta.course_benefits && course.meta.course_benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ce que vous apprendrez</h3>
                    <ul className="space-y-2">
                      {course.meta.course_benefits?.map((benefit, index) => (
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

                {/* Requirements */}
                {course.meta.course_requirements && course.meta.course_requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Prérequis</h3>
                    <ul className="space-y-2">
                      {course.meta.course_requirements?.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Target Audience */}
                {course.meta.course_target_audience && course.meta.course_target_audience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Public cible</h3>
                    <ul className="space-y-2">
                      {course.meta.course_target_audience?.map((audience, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                          </svg>
                          <span className="text-gray-700">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Materials Included */}
                {course.meta.course_material_includes && course.meta.course_material_includes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Matériel inclus</h3>
                    <ul className="space-y-2">
                      {course.meta.course_material_includes?.map((material, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-700">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {course.meta.course_price}
                </div>
                <div className="text-sm text-gray-500">
                  {course.meta.course_price_type.includes('free') ? 'Gratuit' : 'Prix du cours'}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-medium">{course.meta.course_duration}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Niveau</span>
                  <span className="font-medium">{course.meta.course_level}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Publié le</span>
                  <span className="font-medium">{formatDate(course.date)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Dernière mise à jour</span>
                  <span className="font-medium">{formatDate(course.modified)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/student-dashboard/course/${course.id}/learn`}
                  className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium block"
                >
                  Commencer le cours
                </Link>
                <Link
                  href="/student-dashboard/select-course"
                  className="w-full bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium block"
                >
                  Retour à mes cours
                </Link>
                <Link
                  href="/student-dashboard"
                  className="w-full bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium block"
                >
                  Tableau de bord
                </Link>
              </div>

              {/* Course Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Informations du cours</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>ID du cours: {course.id}</div>
                  <div>Slug: {course.slug}</div>
                  <div>Statut: {course.status}</div>
                  {course.author && (
                    <div>Formateur: {course.author.display_name || course.author.user_login}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
