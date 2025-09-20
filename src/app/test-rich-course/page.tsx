'use client';

import { useState, useEffect } from 'react';

interface RichCourse {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  course_duration: string;
  course_level: string;
  intro_video?: string;
  images?: any[];
}

export default function TestRichCoursePage() {
  const [course, setCourse] = useState<RichCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRichCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/woocommerce/courses-with-content');
        const result = await response.json();

        if (!result.success || !result.data) {
          setError('Erreur lors du chargement des formations');
          return;
        }

        // Find the rich course (ID 120)
        const richCourse = result.data.find((c: any) => c.id === 120);

        if (!richCourse) {
          setError('Cours riche non trouvé');
          return;
        }

        setCourse(richCourse);
      } catch (err) {
        console.error('Failed to fetch rich course:', err);
        setError('Impossible de charger le cours riche');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRichCourse();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du cours riche...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cours non trouvé</h1>
          <p className="text-gray-600 mb-4">Le cours riche n'a pas été trouvé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <a 
            href="/formations" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Retour aux formations
          </a>
          <h1 className="text-4xl font-bold text-gray-900">{course.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Images */}
            {course.images && course.images.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-48 object-cover rounded-lg shadow-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Intro Video */}
            {course.intro_video && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎥 Vidéo d'introduction</h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <a 
                      href={course.intro_video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l8-5-8-5z"/>
                      </svg>
                      <span>Regarder la vidéo d'introduction</span>
                    </a>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Cliquez pour ouvrir la vidéo dans un nouvel onglet
                  </p>
                </div>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Description du cours</h2>
              <div 
                className="prose max-w-none rich-content"
                dangerouslySetInnerHTML={{
                  __html: course.description
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/\[embed\][^[]*\[\/embed\]/g, '')
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, '')
                        .replace(/<p>\s*<\/p>/g, '')
                }}
              />
            </div>

            {/* Course Short Description */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">📝 Résumé</h2>
              <div 
                className="prose max-w-none text-blue-800"
                dangerouslySetInnerHTML={{
                  __html: course.short_description
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/\[embed\][^[]*\[\/embed\]/g, '')
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, '')
                        .replace(/<p>\s*<\/p>/g, '')
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Course Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Durée</span>
                  <p className="text-lg font-semibold text-gray-900">{course.course_duration || '3 jours'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Niveau</span>
                  <p className="text-lg font-semibold text-gray-900">{course.course_level || 'Intermédiaire'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Prix</span>
                  <p className="text-2xl font-bold text-blue-600">{course.price ? `${course.price} CHF` : 'Gratuit'}</p>
                </div>
              </div>

              {/* Video Link */}
              {course.intro_video && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🎥 Vidéo d'introduction</h3>
                  <a 
                    href={course.intro_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Regarder maintenant →
                  </a>
                </div>
              )}

              {/* Add to Cart Button */}
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
                Ajouter au panier
              </button>

              {/* Checkout Button */}
              <a 
                href="/checkout"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block"
              >
                Commander maintenant
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rich-content h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
        }
        .rich-content h3 {
          color: #374151;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
        }
        .rich-content h4 {
          color: #4b5563;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        .rich-content p {
          color: #4b5563;
          margin: 0.75rem 0;
          line-height: 1.6;
        }
        .rich-content ul, .rich-content ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        .rich-content li {
          color: #4b5563;
          margin: 0.25rem 0;
          line-height: 1.5;
        }
        .rich-content strong {
          color: #1f2937;
          font-weight: 600;
        }
        .rich-content .course-intro {
          margin-bottom: 2rem;
        }
        .rich-content .course-highlight {
          background: #f0f9ff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          border-left: 4px solid #3b82f6;
        }
        .rich-content .module {
          background: #f9fafb;
          padding: 1.25rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          border: 1px solid #e5e7eb;
        }
        .rich-content .course-methods {
          background: #f0fdf4;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          border-left: 4px solid #10b981;
        }
        .rich-content .course-certification {
          background: #fef3c7;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          border-left: 4px solid #f59e0b;
        }
        .rich-content .course-target {
          background: #fce7f3;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          border-left: 4px solid #ec4899;
        }
      `}</style>
    </div>
  );
}
