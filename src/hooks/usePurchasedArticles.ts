import { useState, useEffect } from 'react'
import { WordPressPost } from '@/lib/wordpress'

interface UsePurchasedArticlesReturn {
  articles: WordPressPost[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePurchasedArticles(userId: string | null): UsePurchasedArticlesReturn {
  const [articles, setArticles] = useState<WordPressPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async () => {
    if (!userId) {
      setArticles([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user/purchased-articles?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.articles || [])
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des articles')
      }
    } catch (err) {
      setError('Erreur lors du chargement de vos articles achetés')
      console.error('Error fetching purchased articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [userId])

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles
  }
}
