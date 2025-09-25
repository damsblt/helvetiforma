'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Course {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  date: string;
  modified: string;
  author: { name: string };
  guid: string;
  thumbnail_url: string | null;
  wooCommerceProductId: number;
  meta: {
    course_duration: string;
    course_level: string;
    course_price: string;
    course_rating: number;
    course_rating_count: number;
    course_students_count: number;
    course_thumbnail: string | null;
    course_categories: string[];
    course_tags: string[];
    course_benefits: string[];
    course_requirements: string[];
    course_target_audience: string[];
    course_material_includes: string[];
    course_settings: any;
    course_price_type: string[];
  };
}

export default function CourseDetailsPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch course data from WooCommerce
        const response = await fetch('/api/woocommerce/courses-with-content');
        const result = await response.json();

        if (!result.success || !result.data) {
          setError('Erreur lors du chargement des formations');
          setIsLoading(false);
          return;
        }
        const idOrSlug = String(params.id);
        const isNumeric = /^\d+$/.test(idOrSlug);

        let wooCommerceProduct = null;
        if (isNumeric) {
          const courseId = parseInt(idOrSlug);
          wooCommerceProduct = result.data.find((p: any) => 
            p?.tutor_course_id == courseId || p?.id == courseId || p?.product_id == courseId
          );
        } else {
          const slug = idOrSlug.toLowerCase();
          wooCommerceProduct = result.data.find((p: any) => {
            const candidateSlug = (p?.course_slug || p?.slug || (p?.permalink ? String(p.permalink).split('/').filter(Boolean).pop() : null) || '')
              .toLowerCase();
            const nameAsSlug = (p?.name || '')
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');
            return candidateSlug === slug || nameAsSlug === slug;
          });
        }

        if (!wooCommerceProduct) {
          setError('Formation non trouvée');
          setIsLoading(false);
          return;
        }

        // Create course object from WooCommerce data
        const resolvedCourseId: number = (wooCommerceProduct.tutor_course_id ?? wooCommerceProduct.id ?? 0) as number;

        const courseData: Course = {
          id: resolvedCourseId,
          title: wooCommerceProduct.name,
          content: wooCommerceProduct.description || '',
          excerpt: wooCommerceProduct.short_description || '',
          slug: (wooCommerceProduct.course_slug || wooCommerceProduct.slug || (wooCommerceProduct.permalink ? String(wooCommerceProduct.permalink).split('/').filter(Boolean).pop() : null) || wooCommerceProduct.name.toLowerCase().replace(/\s+/g, '-')),
          status: 'publish',
          date: new Date().toISOString(),
          modified: new Date().toISOString(),
          author: { name: 'HelvetiForma' },
          guid: '',
          thumbnail_url: wooCommerceProduct.images?.[0]?.src || null,
          wooCommerceProductId: wooCommerceProduct.id,
          meta: {
            course_duration: wooCommerceProduct.course_duration || '3 jours',
            course_level: wooCommerceProduct.course_level || 'Intermédiaire',
            course_price: wooCommerceProduct.price ? `${wooCommerceProduct.price} CHF` : 'Gratuit',
            course_rating: 4.5,
            course_rating_count: 0,
            course_students_count: 0,
            course_thumbnail: wooCommerceProduct.images?.[0]?.src || null,
            course_categories: ['Formations'],
            course_tags: [],
            course_benefits: [],
            course_requirements: [],
            course_target_audience: [],
            course_material_includes: [],
            course_settings: {},
            course_price_type: wooCommerceProduct.price === '0' || wooCommerceProduct.price === 0 ? ['free'] : ['paid']
          }
        };

        setCourse(courseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError('Impossible de charger les détails du cours. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [params.id]);

  const handleAddToCart = () => {
    console.log('Course details page - handleAddToCart called with:', {
      courseId: course?.id,
      courseTitle: course?.title,
      wooCommerceProductId: course?.wooCommerceProductId,
      type: typeof course?.wooCommerceProductId
    });
    
    if (course?.wooCommerceProductId) {
      console.log('Calling addToCart with product ID:', course.wooCommerceProductId);
      addToCart(course.wooCommerceProductId, 1);
    } else {
      console.error('No WooCommerce product ID found for course:', course);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails du cours...</p>
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
          <Link 
            href="/formations" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Formation non trouvée</h1>
          <p className="text-gray-600 mb-4">Cette formation n'existe pas ou a été supprimée.</p>
          <Link 
            href="/formations" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/formations" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Retour aux formations
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            {course.thumbnail_url && (
              <div className="mb-8">
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description du cours</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: (course.content || course.excerpt || 'Aucune description disponible.')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\[embed\][^[]*\[\/embed\]/g, '')
                    .replace(/<p[^>]*>/g, '')
                    .replace(/<\/p>/g, '')
                    .replace(/<p>\s*<\/p>/g, '')
                }}
              />
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Détails du cours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Informations générales</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li><span className="font-medium">Durée:</span> {course.meta.course_duration}</li>
                    <li><span className="font-medium">Niveau:</span> {course.meta.course_level}</li>
                    <li><span className="font-medium">Prix:</span> {course.meta.course_price}</li>
                    <li><span className="font-medium">Type:</span> {course.meta.course_price_type.includes('free') ? 'Gratuit' : 'Payant'}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Évaluation</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(course.meta.course_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.meta.course_rating} ({course.meta.course_rating_count} avis)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {course.meta.course_students_count} étudiants inscrits
                  </p>
                </div>
              </div>
            </div>

            {/* Course Categories */}
            {course.meta.course_categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Catégories</h2>
                <div className="flex flex-wrap gap-2">
                  {course.meta.course_categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Course Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Durée</span>
                  <p className="text-lg font-semibold text-gray-900">{course.meta.course_duration}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Niveau</span>
                  <p className="text-lg font-semibold text-gray-900">{course.meta.course_level}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Prix</span>
                  <p className="text-2xl font-bold text-blue-600">{course.meta.course_price}</p>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
              >
                Ajouter au panier
              </button>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}