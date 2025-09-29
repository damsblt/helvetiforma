'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Course {
  id: number
  title: string
  description: string
  price: number
  instructor: string
  image?: string
  level?: string
  duration?: string
}

interface PopularCoursesSectionProps {
  title?: string
  subtitle?: string
  limit?: number
}

export default function PopularCoursesSection({ title, subtitle, limit = 3 }: PopularCoursesSectionProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des cours populaires depuis TutorLMS
    // En production, ceci sera remplacé par un appel API réel
    const fetchPopularCourses = async () => {
      try {
        // Données simulées - à remplacer par l'API TutorLMS
        const mockCourses: Course[] = [
          {
            id: 1,
            title: "Comptabilité Suisse Fondamentale",
            description: "Maîtrisez les bases de la comptabilité selon les normes suisses",
            price: 299,
            instructor: "Marie Dubois",
            image: "/images/course-comptabilite.jpg",
            level: "Débutant",
            duration: "8 semaines"
          },
          {
            id: 2,
            title: "Gestion des Salaires en Suisse",
            description: "Formation complète sur le calcul et la gestion des salaires",
            price: 399,
            instructor: "Jean-Claude Martin",
            image: "/images/course-salaires.jpg",
            level: "Intermédiaire",
            duration: "6 semaines"
          },
          {
            id: 3,
            title: "Impôt à la Source",
            description: "Tout savoir sur l'impôt à la source en Suisse",
            price: 249,
            instructor: "Sophie Lenoir",
            image: "/images/course-impot.jpg",
            level: "Intermédiaire",
            duration: "4 semaines"
          }
        ]
        
        await new Promise(resolve => setTimeout(resolve, 500)) // Simuler le délai réseau
        setCourses(mockCourses.slice(0, limit))
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularCourses()
  }, [limit])

  if (loading) {
    return (
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-4 bg-muted animate-pulse rounded max-w-lg mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="bg-background rounded-xl shadow-sm p-6">
                <div className="h-48 bg-muted animate-pulse rounded-lg mb-4" />
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded mb-4" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (courses.length === 0) return null

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              {title}
            </motion.h2>
          )}
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                    📚
                  </div>
                )}
                
                {/* Level Badge */}
                {course.level && (
                  <div className="absolute top-4 left-4 bg-white/90 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    {course.level}
                  </div>
                )}
                
                {/* Duration Badge */}
                {course.duration && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    {course.duration}
                  </div>
                )}
              </div>
              
              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Par {course.instructor}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {course.price === 0 ? 'Gratuit' : `${course.price} CHF`}
                  </span>
                </div>
                
                <Link
                  href={`/courses/${course.id}`}
                  className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {course.price === 0 ? 'Accéder gratuitement' : 'En savoir plus'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-lg transition-colors"
          >
            Voir toutes nos formations
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
