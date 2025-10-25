'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TestLearnPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Test course API
        const courseResponse = await fetch(`/api/wordpress/courses/${slug}`);
        const courseData = await courseResponse.json();
        setCourse(courseData.data);
        
        // Test lessons API
        const lessonsResponse = await fetch(`/api/wordpress/lessons?course=${courseData.data.id}`);
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);
        
        console.log('Course data:', courseData);
        console.log('Lessons data:', lessonsData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Page - {course?.title || 'Chargement...'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du cours</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {course?.id}</p>
            <p><strong>Titre:</strong> {course?.title}</p>
            <p><strong>Slug:</strong> {course?.slug}</p>
            <p><strong>Prix:</strong> {course?.course_price} CHF</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Leçons ({lessons.length})
          </h2>
          {lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">ID: {lesson.id}</p>
                  <p className="text-sm text-gray-600">Type: {lesson.lesson_type}</p>
                  <p className="text-sm text-gray-600">Durée: {lesson.duration}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune leçon trouvée</p>
          )}
        </div>
      </div>
    </div>
  );
}

