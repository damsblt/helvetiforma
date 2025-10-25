'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Clock, PlayCircle, CheckCircle } from 'lucide-react'

interface EnrolledCoursesProps {
  userId: string
}

interface EnrolledCourse {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image?: string
  progress_percentage?: number
  enrolled_at?: string
  course_level?: string
}

export default function EnrolledCourses({ userId }: EnrolledCoursesProps) {
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!userId) {
          console.error('❌ EnrolledCourses: No userId provided')
          setError('ID utilisateur non fourni')
          return
        }
        
        console.log('🔍 EnrolledCourses: Fetching courses for userId:', userId)
        const response = await fetch(`/api/tutor-lms/student-courses?userId=${userId}`)
        
        console.log('🔍 EnrolledCourses: Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('❌ EnrolledCourses: API error:', errorData)
          throw new Error(errorData.message || errorData.error || 'Failed to fetch enrolled courses')
        }

        const data = await response.json()
        console.log('✅ EnrolledCourses: Received data:', data)
        setCourses(data.courses || [])
      } catch (err) {
        console.error('❌ EnrolledCourses: Error fetching courses:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des cours')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchEnrolledCourses()
    } else {
      console.warn('⚠️ EnrolledCourses: No userId provided, skipping fetch')
      setLoading(false)
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Erreur de chargement</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune formation inscrite</h3>
        <p className="text-gray-500 mb-6">Vous n'êtes inscrit à aucune formation pour le moment.</p>
        <Link
          href="/e-learning"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Découvrir les formations
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Course Image */}
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
            {course.featured_image ? (
              <>
                <img
                  src={course.featured_image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white/30" />
              </div>
            )}
            {course.course_level && (
              <span className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                {course.course_level === 'beginner' ? 'Débutant' : 
                 course.course_level === 'intermediate' ? 'Intermédiaire' : 
                 'Avancé'}
              </span>
            )}
          </div>

          {/* Course Content */}
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {course.title}
            </h3>
            {course.excerpt && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.excerpt}
              </p>
            )}

            {/* Progress Bar */}
            {course.progress_percentage !== undefined && course.progress_percentage > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progression</span>
                  <span className="font-medium">{course.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Link
              href={`/e-learning/${course.slug}/learn`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {course.progress_percentage && course.progress_percentage > 0 ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Continuer la formation
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Commencer la formation
                </>
              )}
            </Link>

            {/* Enrolled Date */}
            {course.enrolled_at && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                Inscrit le {new Date(course.enrolled_at).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

