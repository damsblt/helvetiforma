'use client';

import { motion } from 'framer-motion';
import { Star, Clock, Users, Play, Lock, CheckCircle } from 'lucide-react';
import { TutorCourse } from '@/lib/tutor-lms';
import Link from 'next/link';
import Image from 'next/image';

interface CourseCardProps {
  course: TutorCourse;
}

export default function CourseCard({ course }: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return 'Durée non spécifiée';
    return duration;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return level;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {course.featured_image ? (
          <Image
            src={course.featured_image}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Course Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.course_level || 'beginner')}`}>
            {getLevelLabel(course.course_level || 'beginner')}
          </span>
        </div>

        {/* Price Badge */}
        {course.course_price && course.course_price > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
              {formatPrice(course.course_price)}
            </span>
          </div>
        )}

        {/* Enrollment Status */}
        {course.is_enrolled && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Inscrit
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {course.is_enrolled && course.progress_percentage && course.progress_percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progression</span>
              <span>{course.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${course.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Categories */}
        {course.categories && course.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.categories.slice(0, 2).map((category) => (
              <span
                key={category.id}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Course Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {typeof course.title === 'string' ? course.title : (course.title as any)?.rendered || 'Titre non disponible'}
        </h3>

        {/* Course Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {typeof course.excerpt === 'string' ? course.excerpt : (course.excerpt as any)?.rendered || 'Description non disponible'}
        </p>

        {/* Course Meta */}
        {(course.course_duration || (course.enrolled_count && course.enrolled_count > 0)) && (
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {course.course_duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.course_duration)}</span>
              </div>
            )}
            
            {course.enrolled_count && course.enrolled_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolled_count} inscrits</span>
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {course.rating && course.rating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(course.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {course.rating.toFixed(1)} ({course.reviews_count || 0} avis)
            </span>
          </div>
        )}

        {/* Course Benefits */}
        {course.course_benefits && course.course_benefits.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-1">
              {course.course_benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100">
          {course.is_enrolled ? (
            <Link
              href={`/e-learning/${course.slug}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Continuer la formation
            </Link>
          ) : course.course_price && course.course_price > 0 ? (
            <Link
              href={`/e-learning/${course.slug}/checkout`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Acheter la formation
            </Link>
          ) : (
            <Link
              href={`/e-learning/${course.slug}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Commencer gratuitement
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
