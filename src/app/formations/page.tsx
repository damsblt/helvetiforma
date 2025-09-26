'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tutorService } from '@/services/tutorService';
import CartButton from '@/components/CartButton';
import type { TutorCourse } from '@/types/tutor';

export default function FormationsPage() {
  const [courses, setCourses] = useState<TutorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const coursesData = await tutorService.getCourses({ per_page: 20 });
        setCourses(coursesData);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Erreur lors du chargement des formations');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(price);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des formations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos Formations
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Découvrez notre catalogue de formations professionnelles spécialisées 
            en comptabilité, paie et gestion d'entreprise en Suisse
          </p>
        </div>

        {/* Formations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative">
                {course.featured_image ? (
                  <img 
                    src={course.featured_image} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {course.categories.length > 0 ? course.categories[0].name : 'Formation'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                {/* Description */}
                <div 
                  className="text-gray-600 text-sm mb-4 line-clamp-3" 
                  dangerouslySetInnerHTML={{ __html: course.excerpt }}
                />
                
                {/* Meta info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {course.enrolled_students} inscrits
                  </span>
                  <span className="text-xs">{course.difficulty_level}</span>
                </div>
                
                {/* Bottom section */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-blue-600">
                      {course.is_free ? 'Gratuit' : formatPrice(course.price || 0)}
                    </span>
                    {course.sale_price && course.sale_price < (course.price || 0) && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(course.sale_price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Voir détails
                    </Link>
                    {!course.is_free && (
                      <CartButton
                        courseId={course.id}
                        courseTitle={course.title}
                        coursePrice={course.price || 0}
                        courseSalePrice={course.sale_price}
                        courseSlug={course.slug}
                        courseFeaturedImage={course.featured_image}
                        className="text-green-600 hover:text-green-700 p-1"
                        showIcon={false}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                      </CartButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Vous ne trouvez pas la formation qu'il vous faut ?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Contactez-nous pour discuter de vos besoins spécifiques. 
            Nous pouvons créer des formations sur mesure pour votre entreprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Nous contacter
            </Link>
            <Link 
              href="/inscription-des-formateurs-et-formatrices" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Devenir formateur
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
