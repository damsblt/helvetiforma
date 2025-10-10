'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useSessionCache } from '@/hooks/useSessionCache'
import type { User } from '@supabase/supabase-js'

const supabase = getSupabaseClient()

interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface Profile {
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { getCachedSession, setCachedSession, clearCachedSession } = useSessionCache()

  // Fonction helper pour récupérer le profil utilisateur avec cache
  const fetchUserProfile = async (userId: string) => {
    const cacheKey = `profile_${userId}`
    
    // Vérifier le cache d'abord
    const cachedProfile = getCachedSession(cacheKey)
    if (cachedProfile) {
      return cachedProfile
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const profileData = profile as Profile | null
      
      // Mettre en cache le profil
      if (profileData) {
        setCachedSession(cacheKey, profileData, 5 * 60 * 1000) // 5 minutes
      }

      return profileData
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Fonction helper pour créer l'objet utilisateur
  const createUserObject = (sessionUser: any, profileData: Profile | null) => ({
    id: sessionUser.id,
    email: sessionUser.email!,
    first_name: profileData?.first_name,
    last_name: profileData?.last_name,
    avatar_url: profileData?.avatar_url,
  })

  useEffect(() => {
    let isMounted = true

    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (isMounted) {
          if (session?.user) {
            const profileData = await fetchUserProfile(session.user.id)
            setUser(createUserObject(session.user, profileData))
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        try {
          if (session?.user) {
            const profileData = await fetchUserProfile(session.user.id)
            setUser(createUserObject(session.user, profileData))
          } else {
            setUser(null)
          }
          setLoading(false)
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    // Nettoyer le cache lors de la déconnexion
    clearCachedSession(`profile_${user?.id}`)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
