import { createClient } from '@supabase/supabase-js'
import type { Profile } from './supabase'

// Créer une instance Supabase pour l'authentification côté client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function registerUser(data: RegisterData): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
      }
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'inscription',
    }
  }
}

/**
 * Connexion d'un utilisateur
 */
export async function loginUser(credentials: LoginCredentials): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erreur lors de la connexion',
      }
    }

    // Récupérer le profil complet
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError)
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        avatar_url: profile?.avatar_url,
      },
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la connexion',
    }
  }
}

/**
 * Déconnexion
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion',
    }
  }
}

/**
 * Récupérer l'utilisateur actuel
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Récupérer le profil complet
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      avatar_url: profile?.avatar_url,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la mise à jour',
    }
  }
}

/**
 * Demander une réinitialisation de mot de passe
 */
export async function resetPassword(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la réinitialisation',
    }
  }
}
