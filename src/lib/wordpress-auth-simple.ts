import { wordpressClient } from './wordpress'

export interface User {
  id: string
  email: string
  name: string
  display_name?: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

/**
 * Authentifie un utilisateur avec WordPress via API interne
 * Since you're already logged in via WordPress, we'll just check the existing session
 */
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('🔍 WordPress Auth - Authenticating user:', email)
    
    // Use internal login API directly
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.user) {
      console.log('✅ WordPress Auth - Authentication successful')
      return {
        success: true,
        user: data.user
      }
    } else {
      console.log('❌ WordPress Auth - Authentication failed')
      return {
        success: false,
        error: data.error || 'Email ou mot de passe incorrect'
      }
    }
  } catch (error) {
    console.error('❌ WordPress Auth - Error:', error)
    return {
      success: false,
      error: 'Erreur de connexion'
    }
  }
}

/**
 * Vérifie si un utilisateur est connecté (via session/cookie)
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('helvetiforma_user')
    if (userData) {
      return JSON.parse(userData)
    }
  } catch (error) {
    console.error('Error getting current user:', error)
  }
  
  return null
}

/**
 * Vérifie si un utilisateur est connecté via WordPress session
 */
export async function getCurrentUserFromWordPress(): Promise<User | null> {
  try {
    // Check localStorage first for immediate response
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('helvetiforma_user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        console.log('✅ WordPress Auth - User found in localStorage:', user.email)
        return user
      }
    }
    
    // Fallback to API check
    const response = await fetch('/api/wordpress-user', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const user = await response.json()
      // Store in localStorage for faster future access
      if (typeof window !== 'undefined') {
        localStorage.setItem('helvetiforma_user', JSON.stringify(user))
      }
      return user
    }
  } catch (error) {
    console.log('No WordPress session found')
  }
  
  return null
}

/**
 * Sauvegarde l'utilisateur connecté
 */
export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('helvetiforma_user', JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

/**
 * Inscrit un nouvel utilisateur via API interne
 * First checks if user is already logged in
 */
export async function registerUser(email: string, password: string, firstName: string, lastName: string): Promise<AuthResult> {
  try {
    console.log('🔍 WordPress Auth - Registering user:', email)
    
    // First, check if there's already a WordPress session
    const sessionResponse = await fetch('/api/wordpress-user', {
      credentials: 'include'
    })
    
    if (sessionResponse.ok) {
      const user = await sessionResponse.json()
      console.log('✅ WordPress Auth - User already logged in:', user.email)
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          display_name: user.display_name
        }
      }
    }
    
    // If no session, try to register
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.user) {
      console.log('✅ WordPress Auth - Registration successful')
      return {
        success: true,
        user: data.user
      }
    } else {
      console.log('❌ WordPress Auth - Registration failed')
      return {
        success: false,
        error: data.error || 'Erreur lors de l\'inscription'
      }
    }
  } catch (error) {
    console.error('❌ WordPress Auth - Registration error:', error)
    return {
      success: false,
      error: 'Erreur lors de l\'inscription'
    }
  }
}

/**
 * Déconnecte l'utilisateur via API interne
 */
export async function logoutUser(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.ok) {
      console.log('✅ WordPress Auth - Logout successful')
      // Reload the page to clear any client-side state
      window.location.reload()
    }
  } catch (error) {
    console.error('Error logging out user:', error)
  }
}
