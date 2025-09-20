'use client';

import React, { useState, useEffect } from 'react';
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
  woocommerce?: {
    product_id?: number;
    price?: string;
    sale_price?: string;
    regular_price?: string;
    currency?: string;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    stock_quantity?: number;
    categories?: string[];
    tags?: string[];
    attributes?: {
      name: string;
      value: string;
    }[];
  };
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  course_id: number;
  order: number;
  duration?: string;
  video_url?: string;
  attachments?: string[];
  is_preview?: boolean;
  lesson_type?: 'video' | 'text' | 'assignment' | 'quiz';
}

interface Topic {
  id: number;
  title: string;
  content: string;
  lesson_id: number;
  course_id: number;
  order: number;
  duration?: string;
  is_preview?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  lesson_id?: number;
  time_limit?: number;
  total_marks?: number;
  passing_grade?: number;
  attempts_allowed?: number;
}

export default function ELearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseContent, setCourseContent] = useState<{
    lessons: Lesson[];
    topics: Topic[];
    quizzes: Quiz[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [categories, setCategories] = useState<string[]>(['Toutes']);

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await tutorLmsService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await tutorLmsService.getCourseCategories();
      const categoryNames = ['Toutes', ...categoriesData.map((cat: any) => cat.name)];
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCourseContent = async (course: Course) => {
    try {
      setSelectedCourse(course);
      const [lessons, topics, quizzes] = await Promise.all([
        tutorLmsService.getCourseLessons(course.id),
        tutorLmsService.getCourseTopics(course.id),
        tutorLmsService.getCourseQuizzes(course.id),
      ]);
      
      setCourseContent({
        lessons,
        topics,
        quizzes,
      });
    } catch (error) {
      console.error('Error loading course content:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Toutes' || 
                           course.categories.some(catId => 
                             categories.includes(catId.toString())
                           );
    return matchesSearch && matchesCategory;
  });

  if (loading) {
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
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadCourses} 
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
            Plateforme E-learning
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos formations en ligne et accédez à un contenu pédagogique de qualité
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                selectedCourse?.id === course.id
                  ? 'border-blue-500 shadow-xl'
                  : 'border-gray-200 hover:shadow-xl'
              }`}
              onClick={() => loadCourseContent(course)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Cours
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: {course.id}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {course.title}
                </h3>
                
                <div 
                  className="text-gray-600 text-sm mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: (course.excerpt || '')
                      .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
                      .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
                  }}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Slug: {course.slug}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    Cours
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Courses Message */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'Toutes' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun cours n\'est disponible pour le moment'
              }
            </p>
          </div>
        )}

        {/* Selected Course Details */}
        {selectedCourse && courseContent && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {selectedCourse.title}
            </h2>
            
            {/* Course Content Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700 mb-2">
                  {courseContent.lessons.length}
                </div>
                <div className="text-sm text-blue-600">Leçons</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700 mb-2">
                  {courseContent.topics.length}
                </div>
                <div className="text-sm text-green-600">Sujets</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700 mb-2">
                  {courseContent.quizzes.length}
                </div>
                <div className="text-sm text-purple-600">Quiz</div>
              </div>
            </div>

            {/* Course Content */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Contenu du Cours
              </h3>
              <div
                className="text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ 
                  __html: (selectedCourse.content || '')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\[embed\][^[]*\[\/embed\]/g, '') // Remove embed tags
                    .replace(/<p[^>]*>/g, '') // Remove opening p tags
                    .replace(/<\/p>/g, '') // Remove closing p tags
                    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
                }}
              />
            </div>

            {/* Lessons Section */}
            {courseContent.lessons.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Leçons</h3>
                <div className="space-y-3">
                  {courseContent.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                      <div 
                        className="text-sm text-gray-600 mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Section */}
            {courseContent.topics.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sujets</h3>
                <div className="space-y-3">
                  {courseContent.topics.map((topic) => (
                    <div key={topic.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{topic.title}</h4>
                      <div 
                        className="text-sm text-gray-600 mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: topic.content }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes Section */}
            {courseContent.quizzes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz</h3>
                <div className="space-y-3">
                  {courseContent.quizzes.map((quiz) => (
                    <div key={quiz.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                      <div 
                        className="text-sm text-gray-600 mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: quiz.description }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Meta Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Slug:</span> {selectedCourse.slug}
              </div>
              <div>
                <span className="font-medium">Type:</span> Cours
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
