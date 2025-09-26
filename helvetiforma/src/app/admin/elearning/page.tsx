'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  date_created: string;
  date_modified: string;
  author: {
    id: number;
    name: string;
  };
  featured_image?: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
  meta: {
    course_duration: string;
    course_level: string;
    course_price: string;
    course_students: number;
  };
}

interface Student {
  id: number;
  display_name: string;
  user_email: string;
  first_name: string;
  last_name: string;
  date_registered: string;
  avatar_url?: string;
  meta: {
    total_courses: number;
    completed_courses: number;
    total_lessons: number;
    completed_lessons: number;
  };
}

export default function ELearningManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'publish',
    categories: '',
    tags: '',
    course_duration: '',
    course_level: 'beginner',
    course_price: '0'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch courses and students in parallel
      const [coursesRes, studentsRes] = await Promise.all([
        fetch('/api/tutor-courses'),
        fetch('/api/tutor-students')
      ]);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.data || []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tutor-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseForm.title,
          content: courseForm.content,
          excerpt: courseForm.excerpt,
          status: courseForm.status,
          meta: {
            course_duration: courseForm.course_duration,
            course_level: courseForm.course_level,
            course_price: courseForm.course_price
          }
        }),
      });

      if (response.ok) {
        setShowCourseForm(false);
        setCourseForm({
          title: '',
          content: '',
          excerpt: '',
          status: 'publish',
          categories: '',
          tags: '',
          course_duration: '',
          course_level: 'beginner',
          course_price: '0'
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      content: course.content,
      excerpt: course.excerpt,
      status: course.status,
      categories: course.categories.map(c => c.name).join(', '),
      tags: course.tags.map(t => t.name).join(', '),
      course_duration: course.meta.course_duration || '',
      course_level: course.meta.course_level || 'beginner',
      course_price: course.meta.course_price || '0'
    });
    setShowCourseForm(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const response = await fetch(`/api/tutor-courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseForm.title,
          content: courseForm.content,
          excerpt: courseForm.excerpt,
          status: courseForm.status,
          meta: {
            course_duration: courseForm.course_duration,
            course_level: courseForm.course_level,
            course_price: courseForm.course_price
          }
        }),
      });

      if (response.ok) {
        setShowCourseForm(false);
        setEditingCourse(null);
        setCourseForm({
          title: '',
          content: '',
          excerpt: '',
          status: 'publish',
          categories: '',
          tags: '',
          course_duration: '',
          course_level: 'beginner',
          course_price: '0'
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const response = await fetch(`/api/tutor-courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données e-learning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">E-learning Management</h1>
              <p className="text-lg text-gray-600">Gérez les cours et étudiants de votre plateforme</p>
            </div>
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Retour au dashboard
            </Link>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📚</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cours Total</p>
                <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Étudiants</p>
                <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">📖</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Leçons Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students?.reduce((sum, student) => sum + (student.meta?.total_lessons || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cours Terminés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students?.reduce((sum, student) => sum + (student.meta?.completed_courses || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gestion des Cours ({courses?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Liste des Étudiants ({students?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Cours</h2>
                  <button
                    onClick={() => {
                      setEditingCourse(null);
                      setCourseForm({
                        title: '',
                        content: '',
                        excerpt: '',
                        status: 'publish',
                        categories: '',
                        tags: '',
                        course_duration: '',
                        course_level: 'beginner',
                        course_price: '0'
                      });
                      setShowCourseForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Nouveau Cours
                  </button>
                </div>

                {!courses || courses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
                    <p className="text-gray-600">Commencez par créer votre premier cours.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.excerpt}</p>
                        
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex justify-between">
                            <span>Statut:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              course.status === 'publish' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {course.status === 'publish' ? 'Publié' : 'Brouillon'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Niveau:</span>
                            <span>{course.meta.course_level || 'Non défini'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Durée:</span>
                            <span>{course.meta.course_duration || 'Non définie'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prix:</span>
                            <span>{course.meta.course_price ? `${course.meta.course_price} CHF` : 'Gratuit'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Étudiants:</span>
                            <span>{course.meta.course_students || 0}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-400">
                            Créé le {formatDate(course.date_created)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Étudiants</h2>
                
                {!students || students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun étudiant trouvé</h3>
                    <p className="text-gray-600">Les étudiants apparaîtront ici une fois inscrits.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Étudiant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cours Inscrits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cours Terminés
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inscription
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students?.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {student.avatar_url ? (
                                    <img className="h-10 w-10 rounded-full" src={student.avatar_url} alt="" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-gray-600 text-sm font-medium">
                                        {student.display_name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.display_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {student.first_name} {student.last_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.user_email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.meta?.total_courses || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.meta?.completed_courses || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(student.date_registered)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Course Form Modal */}
        {showCourseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCourse ? 'Modifier le Cours' : 'Nouveau Cours'}
                </h3>
                <button
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du Cours *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={courseForm.excerpt}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu du Cours
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    value={courseForm.content}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={courseForm.status}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="publish">Publié</option>
                      <option value="draft">Brouillon</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={courseForm.course_level}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, course_level: e.target.value }))}
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (CHF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={courseForm.course_price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, course_price: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (ex: 2h30, 1 jour)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.course_duration}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, course_duration: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourseForm(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCourse ? 'Mettre à jour' : 'Créer le cours'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}