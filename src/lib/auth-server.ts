// Fonctions d'authentification côté serveur
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

/**
 * Récupérer l'utilisateur actuel côté serveur
 * Note: Cette fonction ne peut pas récupérer l'utilisateur connecté côté serveur
 * car les cookies d'authentification ne sont pas accessibles avec la clé service role
 */
export async function getCurrentUserServer(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('🔍 getCurrentUserServer: Aucun utilisateur connecté')
      return null
    }

    console.log('🔍 getCurrentUserServer: Utilisateur trouvé:', user.email)

    // Récupérer le profil complet
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('🔍 getCurrentUserServer: Profil récupéré:', profile?.email)

    return {
      id: user.id,
      email: user.email!,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      avatar_url: profile?.avatar_url,
    }
  } catch (error) {
    console.error('❌ Erreur getCurrentUserServer:', error)
    return null
  }
}
