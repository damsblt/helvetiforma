'use client';

import { useState, useEffect } from 'react';
import tutorLmsService from '@/services/tutorLmsService';

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  categories: number[];
  tags: number[];
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
    course_lessons_count?: number;
    course_topics_count?: number;
    course_quiz_count?: number;
    course_assignments_count?: number;
    course_certificate?: boolean;
    course_access_duration?: string;
  };
}

export default function TestCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStats, setCourseStats] = useState<any>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await tutorLmsService.getCourses();
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseStats = async (courseId: number) => {
    try {
      const stats = await tutorLmsService.getCourseStats(courseId);
      setCourseStats(stats);
    } catch (err) {
      console.error('Error loading course stats:', err);
    }
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    await loadCourseStats(course.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCourses}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Réessayer
          </button>
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
            Test des Cours TutorLMS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test de l'intégration avec votre API TutorLMS à api.helvetiforma.ch
          </p>
        </div>

        {/* Courses List */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                selectedCourse?.id === course.id
                  ? 'border-blue-500 shadow-xl'
                  : 'border-gray-200 hover:shadow-xl'
              }`}
              onClick={() => handleCourseSelect(course)}
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-2xl flex items-center justify-center">
                {course.featured_image ? (
                  <img
                    src={course.featured_image}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="text-white text-6xl">📚</div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {course.title}
                </h3>
                <div
                  className="text-gray-600 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: course.excerpt }}
                />
                
                {/* Course Meta */}
                <div className="space-y-2 mb-4">
                  {course.meta.course_duration && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">⏱️</span>
                      {course.meta.course_duration}
                    </div>
                  )}
                  {course.meta.course_level && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📊</span>
                      {course.meta.course_level}
                    </div>
                  )}
                  {course.meta.course_type && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📍</span>
                      {course.meta.course_type}
                    </div>
                  )}
                </div>

                {/* Course ID */}
                <div className="text-xs text-gray-400">
                  ID: {course.id} | Slug: {course.slug}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Courses Message */}
        {courses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun cours trouvé
            </h2>
            <p className="text-gray-600">
              Créez votre premier cours dans TutorLMS pour commencer.
            </p>
          </div>
        )}

        {/* Selected Course Details */}
        {selectedCourse && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Détails du Cours: {selectedCourse.title}
            </h2>
            
            {/* Course Stats */}
            {courseStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {courseStats.lessons_count}
                  </div>
                  <div className="text-sm text-gray-600">Leçons</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {courseStats.topics_count}
                  </div>
                  <div className="text-sm text-gray-600">Sujets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {courseStats.quiz_count}
                  </div>
                  <div className="text-sm text-gray-600">Quiz</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {courseStats.assignments_count}
                  </div>
                  <div className="text-sm text-gray-600">Devoirs</div>
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Contenu du Cours
              </h3>
              <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedCourse.content }}
              />
            </div>

            {/* Course Meta Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Informations du Cours</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>ID:</strong> {selectedCourse.id}</div>
                  <div><strong>Slug:</strong> {selectedCourse.slug}</div>
                  <div><strong>Statut:</strong> Publié</div>
                  <div><strong>Catégories:</strong> {selectedCourse.categories.length}</div>
                  <div><strong>Tags:</strong> {selectedCourse.tags.length}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Métadonnées</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {Object.entries(selectedCourse.meta).map(([key, value]) => {
                    if (value && value !== '') {
                      return (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Statut de l'API
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">✅ Fonctionnel</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• WordPress REST API</li>
                <li>• Endpoint des cours</li>
                <li>• Taxonomies des cours</li>
                <li>• Intégration TutorLMS</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-3">🔄 En Attente</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Création des leçons</li>
                <li>• Création des sujets</li>
                <li>• Création des quiz</li>
                <li>• Configuration WooCommerce</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">Prochaines Étapes</h4>
            <p className="text-blue-800 text-sm">
              Allez dans votre admin WordPress et créez le contenu de votre cours 
              (leçons, sujets, quiz) pour activer toutes les fonctionnalités de l'API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
