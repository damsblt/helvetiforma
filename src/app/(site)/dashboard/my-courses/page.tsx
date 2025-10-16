'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Play, Award, Calendar } from 'lucide-react';
import { TutorCourse, CourseProgress, getTutorUserCourses, getTutorUserProgress } from '@/lib/tutor-lms';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CourseWithProgress extends TutorCourse {
  progress?: CourseProgress | null;
}

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'completed' | 'in-progress'>('enrolled');

  useEffect(() => {
    const loadUserCourses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userCourses = await getTutorUserCourses(user.id);
        
        // Load progress for each course
        const coursesWithProgress = await Promise.all(
          userCourses.map(async (course) => {
            const progress = await getTutorUserProgress(user.id, course.id);
            return { ...course, progress };
          })
        );

        setCourses(coursesWithProgress);
      } catch (error) {
        console.error('Error loading user courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserCourses();
  }, [user?.id]);

  const filteredCourses = courses.filter(course => {
    switch (activeTab) {
      case 'enrolled':
        return course.is_enrolled;
      case 'completed':
        return course.is_completed || (course.progress?.progress_percentage || 0) >= 100;
      case 'in-progress':
        return course.is_enrolled && !course.is_completed && (course.progress?.progress_percentage || 0) > 0 && (course.progress?.progress_percentage || 0) < 100;
      default:
        return true;
    }
  });

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'enrolled':
        return courses.filter(c => c.is_enrolled).length;
      case 'completed':
        return courses.filter(c => c.is_completed || (c.progress?.progress_percentage || 0) >= 100).length;
      case 'in-progress':
        return courses.filter(c => c.is_enrolled && !c.is_completed && (c.progress?.progress_percentage || 0) > 0 && (c.progress?.progress_percentage || 0) < 100).length;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mes Formations
            </h1>
            <p className="text-lg text-gray-600">
              Gérez vos formations et suivez votre progression
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'enrolled', label: 'Toutes mes formations', icon: BookOpen },
                { id: 'in-progress', label: 'En cours', icon: Play },
                { id: 'completed', label: 'Terminées', icon: CheckCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const count = getTabCount(tab.id);
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'enrolled' && 'Aucune formation inscrite'}
              {activeTab === 'in-progress' && 'Aucune formation en cours'}
              {activeTab === 'completed' && 'Aucune formation terminée'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'enrolled' && 'Commencez par explorer notre catalogue de formations'}
              {activeTab === 'in-progress' && 'Continuez vos formations pour voir votre progression'}
              {activeTab === 'completed' && 'Terminez vos formations pour les voir ici'}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Explorer les formations
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  {course.featured_image ? (
                    <img
                      src={course.featured_image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Progress Overlay */}
                  {course.progress && course.progress.progress_percentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span>{course.progress.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {course.is_completed || (course.progress?.progress_percentage || 0) >= 100 ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Terminé
                      </div>
                    ) : course.progress && course.progress.progress_percentage > 0 ? (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        En cours
                      </div>
                    ) : (
                      <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Inscrit
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.excerpt}
                  </p>

                  {/* Course Stats */}
                  <div className="space-y-2 mb-4">
                    {course.progress && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Leçons terminées</span>
                        <span>{course.progress.lessons_completed} / {course.progress.lessons_total}</span>
                      </div>
                    )}

                    {course.course_duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{course.course_duration}</span>
                      </div>
                    )}

                    {course.progress?.last_accessed && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Dernière visite: {formatDate(course.progress.last_accessed)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {course.is_completed || (course.progress?.progress_percentage || 0) >= 100 ? (
                        <>
                          <Award className="w-4 h-4" />
                          Voir le certificat
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Continuer la formation
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
