'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/tutor/AuthWrapper';
import { tutorService } from '@/services/tutorService';
import { authService } from '@/services/authService';
import type { TutorCourse, TutorEnrollment, TutorStats } from '@/types/tutor';

export default function DashboardPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<TutorCourse[]>([]);
  const [enrollments, setEnrollments] = useState<TutorEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = authService.getUser();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const enrollmentsData = await tutorService.getUserEnrollments();
        setEnrollments(enrollmentsData);

        // Get enrolled courses details
        if (enrollmentsData.length > 0) {
          const coursePromises = enrollmentsData.map(enrollment => 
            tutorService.getCourse(enrollment.course_id)
          );
          const coursesData = await Promise.all(coursePromises);
          setEnrolledCourses(coursesData.filter(course => course !== null) as TutorCourse[]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord
            </h1>
            <p className="text-gray-700">
              Bonjour {user?.firstName || user?.username} ! Gérez vos formations et suivez votre progression.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Formations inscrites</p>
                      <p className="text-2xl font-bold text-blue-900">{enrollments.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Formations terminées</p>
                      <p className="text-2xl font-bold text-green-900">
                        {enrollments.filter(e => e.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">En cours</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {enrollments.filter(e => e.status === 'enrolled').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Progression moyenne</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {enrollments.length > 0 
                          ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Mes formations</h2>
                  <Link href="/formations" className="text-blue-600 hover:text-blue-700 font-medium">
                    Découvrir plus de formations →
                  </Link>
                </div>

                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course) => {
                      const enrollment = enrollments.find(e => e.course_id === course.id);
                      return (
                        <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          {course.featured_image ? (
                            <img 
                              src={course.featured_image} 
                              alt={course.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                enrollment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                enrollment?.status === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {enrollment?.status === 'completed' ? 'Terminé' :
                                 enrollment?.status === 'enrolled' ? 'En cours' : 'Inscrit'}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {enrollment?.progress || 0}%
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {course.title}
                            </h3>

                            <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
                              <span>{course.lessons_count} leçons</span>
                              <span>{course.course_duration}</span>
                            </div>

                            <Link
                              href={`/courses/${course.id}`}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block font-medium"
                            >
                              Continuer
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation inscrite</h3>
                    <p className="mt-1 text-sm text-gray-600">Commencez par explorer notre catalogue de formations.</p>
                    <div className="mt-6">
                      <Link
                        href="/formations"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Découvrir les formations
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}

