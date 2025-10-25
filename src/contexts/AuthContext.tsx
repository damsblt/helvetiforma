'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, authenticateUser, registerUser, getCurrentUser, getCurrentUserFromWordPress, setCurrentUser, logoutUser } from '@/lib/wordpress-auth-simple'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session WordPress au chargement
    const checkUserAuth = async () => {
      console.log('🔄 AuthContext: Starting auth check...')
      try {
        // Check localStorage first to avoid unnecessary API calls
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('helvetiforma_user')
          if (storedUser) {
            console.log('✅ AuthContext: Found stored user, setting user')
            const user = JSON.parse(storedUser)
            setUser(user)
            return
          }
        }
        
        // For non-logged-in users, don't call the API
        // The API call will only happen when user explicitly tries to log in
        console.log('ℹ️ AuthContext: No stored user found, user is not logged in')
      } catch (error) {
        console.log('❌ AuthContext: Error checking user auth:', error)
      } finally {
        // ALWAYS set loading to false, regardless of success or error
        console.log('✅ AuthContext: Setting loading to false')
        setLoading(false)
      }
    }
    
    checkUserAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const result = await authenticateUser(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        // Store user in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('helvetiforma_user', JSON.stringify(result.user))
        }
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Erreur de connexion' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true)
    
    try {
      const result = await registerUser(email, password, firstName, lastName)
      
      if (result.success && result.user) {
        setUser(result.user)
        // Store user in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('helvetiforma_user', JSON.stringify(result.user))
        }
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Erreur lors de l\'inscription' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Erreur lors de l\'inscription' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('helvetiforma_user')
    }
    await logoutUser()
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
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
