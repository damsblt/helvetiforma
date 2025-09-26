'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import tutorLmsService, { TutorCourse, TutorEnrollment } from '@/services/tutorLmsService';
import authService from '@/services/authService';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<TutorCourse[]>([]);
  const [enrollments, setEnrollments] = useState<TutorEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'my-courses' | 'progress'>('overview');

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = authService.getUser();
      if (!currentUser) {
        // Redirect to login if no user
        window.location.href = '/login';
        return;
      }
      
      setUser(currentUser);

      // Get all courses and enrollments
      const [coursesData, enrollmentsData] = await Promise.all([
        tutorLmsService.getCourses(),
        tutorLmsService.getStudentEnrollments(currentUser.id)
      ]);

      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMyCourses = () => {
    return enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      return {
        ...enrollment,
        course: course
      };
    }).filter(item => item.course);
  };

  const getCompletedCourses = () => {
    return getMyCourses().filter(item => item.status === 'completed');
  };

  const getInProgressCourses = () => {
    return getMyCourses().filter(item => item.status === 'enrolled' && item.progress < 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à cette page.</p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const myCourses = getMyCourses();
  const completedCourses = getCompletedCourses();
  const inProgressCourses = getInProgressCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
              <p className="text-gray-600">Bienvenue, {user.firstName} {user.lastName}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => authService.logout()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Se déconnecter
              </button>
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
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Vue d\'ensemble' },
              { id: 'my-courses', name: 'Mes Cours' },
              { id: 'progress', name: 'Progrès' }
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
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Mes Cours</p>
                    <p className="text-2xl font-semibold text-gray-900">{myCourses.length}</p>
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
                    <p className="text-2xl font-semibold text-gray-900">{completedCourses.length}</p>
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
                    <p className="text-sm font-medium text-gray-500">En Cours</p>
                    <p className="text-2xl font-semibold text-gray-900">{inProgressCourses.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Cours en Cours</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {inProgressCourses.slice(0, 5).map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.course?.title}</p>
                          <p className="text-sm text-gray-500">{item.course?.meta.course_level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{item.progress}%</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Cours Terminés</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {completedCourses.slice(0, 5).map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.course?.title}</p>
                          <p className="text-sm text-gray-500">Terminé le {formatDate(item.completed_date || item.enrolled_date)}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Terminé
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Mes Cours</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {myCourses.map((item) => (
                <div key={item.id} className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{item.course?.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.course?.excerpt.replace(/<[^>]*>/g, '')}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Niveau: {item.course?.meta.course_level}</span>
                        <span>Durée: {item.course?.meta.course_duration}</span>
                        <span>Inscrit le: {formatDate(item.enrolled_date)}</span>
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <div className="text-right">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          item.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'enrolled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'completed' ? 'Terminé' : 
                           item.status === 'enrolled' ? 'En cours' : item.status}
                        </span>
                        {item.status === 'enrolled' && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-900">{item.progress}% complété</p>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Overall Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progrès Global</h3>
              <div className="space-y-4">
                {myCourses.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{item.course?.title}</h4>
                      <span className="text-sm text-gray-500">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Inscrit le {formatDate(item.enrolled_date)}</span>
                      {item.completed_date && (
                        <span>Terminé le {formatDate(item.completed_date)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Réalisations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🎓</div>
                  <p className="text-sm font-medium text-gray-900">Premier Cours</p>
                  <p className="text-xs text-gray-500">
                    {myCourses.length > 0 ? 'Débloqué' : 'En attente'}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-sm font-medium text-gray-900">Premier Diplôme</p>
                  <p className="text-xs text-gray-500">
                    {completedCourses.length > 0 ? 'Débloqué' : 'En attente'}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">⭐</div>
                  <p className="text-sm font-medium text-gray-900">Étudiant Assidu</p>
                  <p className="text-xs text-gray-500">
                    {completedCourses.length >= 3 ? 'Débloqué' : 'En attente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
