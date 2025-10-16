import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface CourseAccess {
  isEnrolled: boolean
  hasAccess: boolean
  isLoading: boolean
  error: string | null
}

export function useCourseAccess(courseId: string | number): CourseAccess {
  const { user } = useAuth()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !courseId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Check if user is enrolled in the course using the same endpoint as course page
        const response = await fetch(`/api/check-course-access?userId=${user.id}&courseId=${courseId}`)
        const data = await response.json()

        if (data.hasAccess !== undefined) {
          setIsEnrolled(data.hasAccess)
          setHasAccess(data.hasAccess)
        } else {
          setError(data.error || 'Failed to check course access')
        }
      } catch (err) {
        console.error('Error checking course access:', err)
        setError('Failed to check course access')
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [user, courseId])

  return {
    isEnrolled,
    hasAccess,
    isLoading,
    error
  }
}

