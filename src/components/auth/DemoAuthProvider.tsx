'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, first_name?: string, last_name?: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signOut: async () => {},
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
})

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)

  // Vérifier si on est en mode démo
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

  useEffect(() => {
    if (isDemoMode) {
      // En mode démo, vérifier s'il y a un utilisateur stocké localement
      const storedUser = localStorage.getItem('demo-user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [isDemoMode])

  const signIn = async (email: string, password: string) => {
    if (!isDemoMode) {
      return { success: false, error: 'Mode démo non disponible' }
    }

    setLoading(true)
    
    // Simulation d'une connexion
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const demoUser: AuthUser = {
      id: 'demo-user-1',
      email: email,
      first_name: 'Demo',
      last_name: 'User',
    }
    
    setUser(demoUser)
    localStorage.setItem('demo-user', JSON.stringify(demoUser))
    setLoading(false)
    
    return { success: true }
  }

  const signUp = async (email: string, password: string, first_name?: string, last_name?: string) => {
    if (!isDemoMode) {
      return { success: false, error: 'Mode démo non disponible' }
    }

    setLoading(true)
    
    // Simulation d'une inscription
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const demoUser: AuthUser = {
      id: 'demo-user-1',
      email: email,
      first_name: first_name || 'Demo',
      last_name: last_name || 'User',
    }
    
    setUser(demoUser)
    localStorage.setItem('demo-user', JSON.stringify(demoUser))
    setLoading(false)
    
    return { success: true }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('demo-user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn, signUp }}>
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
