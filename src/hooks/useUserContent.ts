'use client'

import { useState, useEffect } from 'react'
import { UserContent, UserPurchase, TutorCourse } from '@/lib/user-content'

export function useUserContent() {
  const [content, setContent] = useState<UserContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserContent() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/content')
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Non authentifié')
            return
          }
          throw new Error('Erreur lors de la récupération du contenu')
        }

        const data = await response.json()
        
        if (data.success) {
          setContent(data.content)
        } else {
          setError(data.error || 'Erreur inconnue')
        }
      } catch (err) {
        console.error('Erreur fetchUserContent:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchUserContent()
  }, [])

  return { content, loading, error, refetch: () => {
    setContent(null)
    setLoading(true)
    setError(null)
  }}
}

export function useUserPurchases() {
  const [purchases, setPurchases] = useState<UserPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserPurchases() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/purchases')
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Non authentifié')
            return
          }
          throw new Error('Erreur lors de la récupération des achats')
        }

        const data = await response.json()
        
        if (data.success) {
          setPurchases(data.purchases)
        } else {
          setError(data.error || 'Erreur inconnue')
        }
      } catch (err) {
        console.error('Erreur fetchUserPurchases:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchUserPurchases()
  }, [])

  return { purchases, loading, error, refetch: () => {
    setPurchases([])
    setLoading(true)
    setError(null)
  }}
}

export function useUserCourses() {
  const [courses, setCourses] = useState<TutorCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserCourses() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/courses')
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Non authentifié')
            return
          }
          throw new Error('Erreur lors de la récupération des cours')
        }

        const data = await response.json()
        
        if (data.success) {
          setCourses(data.courses)
        } else {
          setError(data.error || 'Erreur inconnue')
        }
      } catch (err) {
        console.error('Erreur fetchUserCourses:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchUserCourses()
  }, [])

  return { courses, loading, error, refetch: () => {
    setCourses([])
    setLoading(true)
    setError(null)
  }}
}
