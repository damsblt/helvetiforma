'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Vérifier si un utilisateur a acheté un article (côté client)
 */
export async function checkUserPurchaseClient(
  userId: string,
  postId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('status', 'completed')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Erreur lors de la vérification de l\'achat:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'achat:', error)
    return false
  }
}

/**
 * Récupérer tous les achats d'un utilisateur (côté client)
 */
export async function getUserPurchasesClient(userId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des achats:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error)
    return []
  }
}
