'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  ID: number;
  post_title: string;
  post_content: string;
  post_excerpt: string;
  post_date: string;
  post_modified: string;
  guid: string;
  course_completed_percentage?: string;
}

interface StudentCourses {
  enrolled_courses: Course[];
  active_courses: Course[];
  completed_courses: Course[];
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<StudentCourses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadStudentCourses();
  }, []);

  const loadStudentCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student-courses?student_id=1'); // Demo user
      const result = await response.json();
      
      if (result.success) {
        setCourses(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des cours');
      }
    } catch (error) {
      console.error('Error loading student courses:', error);
      setError('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCoursesToShow = () => {
    if (!courses) return [];
    
    switch (activeTab) {
      case 'active':
        return courses.active_courses || [];
      case 'completed':
        return courses.completed_courses || [];
      default:
        return courses.enrolled_courses || [];
    }
  };

  const getCourseProgress = (course: Course) => {
    if (course.course_completed_percentage) {
      return course.course_completed_percentage;
    }
    return '0%';
  };

  const isCourseCompleted = (course: Course) => {
    return courses?.completed_courses?.some(c => c.ID === course.ID) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={loadStudentCourses}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const coursesToShow = getCoursesToShow();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Formations</h1>
              <p className="text-gray-600">Accédez à vos cours et suivez votre progression</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/student-dashboard/select-course"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📚 Voir tous les cours
              </Link>
              <Link
                href="/enroll"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                S'inscrire à un nouveau cours
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📚</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cours Inscrits</p>
                <p className="text-2xl font-semibold text-gray-900">{courses?.enrolled_courses?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🔄</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cours en Cours</p>
                <p className="text-2xl font-semibold text-gray-900">{courses?.active_courses?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cours Terminés</p>
                <p className="text-2xl font-semibold text-gray-900">{courses?.completed_courses?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'Tous les Cours', count: courses?.enrolled_courses?.length || 0 },
              { id: 'active', name: 'En Cours', count: courses?.active_courses?.length || 0 },
              { id: 'completed', name: 'Terminés', count: courses?.completed_courses?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Courses Grid */}
        {coursesToShow.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? "Vous n'êtes inscrit à aucun cours pour le moment."
                : activeTab === 'active'
                ? "Vous n'avez aucun cours en cours."
                : "Vous n'avez terminé aucun cours."
              }
            </p>
            <Link
              href="/enroll"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              S'inscrire à un cours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesToShow.map((course) => (
              <div key={course.ID} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {course.post_title}
                    </h3>
                    {isCourseCompleted(course) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Terminé
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Progression</span>
                      <span>{getCourseProgress(course)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isCourseCompleted(course) ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: getCourseProgress(course).replace('%', '') + '%' 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <p>Dernière modification: {formatDate(course.post_modified)}</p>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      href={`/student-dashboard/course/${course.ID}`}
                      className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Accéder au cours
                    </Link>
                    <Link
                      href={`/formations/${course.ID}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
