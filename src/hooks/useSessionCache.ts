'use client'

import { useCallback, useRef } from 'react'

interface CachedSession {
  user: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function useSessionCache() {
  const cacheRef = useRef<Map<string, CachedSession>>(new Map())

  const getCachedSession = useCallback((key: string): any | null => {
    const cached = cacheRef.current.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      cacheRef.current.delete(key)
      return null
    }

    return cached.user
  }, [])

  const setCachedSession = useCallback((key: string, user: any, ttl: number = DEFAULT_TTL) => {
    cacheRef.current.set(key, {
      user,
      timestamp: Date.now(),
      ttl
    })
  }, [])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const clearCachedSession = useCallback((key: string) => {
    cacheRef.current.delete(key)
  }, [])

  return {
    getCachedSession,
    setCachedSession,
    clearCache,
    clearCachedSession
  }
}
