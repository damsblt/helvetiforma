import { supabase } from './supabase'
import type { Purchase } from './supabase'

/**
 * Vérifier si un utilisateur a acheté un article
 */
export async function checkUserPurchase(
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
 * Récupérer tous les achats d'un utilisateur
 */
export async function getUserPurchases(userId: string): Promise<Purchase[]> {
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

/**
 * Enregistrer un achat
 */
export async function recordPurchase({
  userId,
  postId,
  postTitle,
  amount,
  stripeSessionId,
  stripePaymentIntentId,
}: {
  userId: string
  postId: string
  postTitle: string
  amount: number
  stripeSessionId: string
  stripePaymentIntentId?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        post_id: postId,
        post_title: postTitle,
        amount: amount,
        stripe_session_id: stripeSessionId,
        stripe_payment_intent_id: stripePaymentIntentId,
        status: 'completed',
        purchased_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Erreur lors de l\'enregistrement de l\'achat:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'achat:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'enregistrement',
    }
  }
}

/**
 * Mettre à jour le statut d'un achat
 */
export async function updatePurchaseStatus(
  stripeSessionId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  stripePaymentIntentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = { status }
    if (stripePaymentIntentId) {
      updateData.stripe_payment_intent_id = stripePaymentIntentId
    }

    const { error } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('stripe_session_id', stripeSessionId)

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'achat:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'achat:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la mise à jour',
    }
  }
}

/**
 * Récupérer les statistiques d'achat d'un utilisateur
 */
export async function getUserPurchaseStats(userId: string): Promise<{
  totalPurchases: number
  totalAmount: number
  lastPurchase?: string
}> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('amount, purchased_at')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { totalPurchases: 0, totalAmount: 0 }
    }

    const totalPurchases = data?.length || 0
    const totalAmount = data?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0
    const lastPurchase = data?.sort((a, b) => 
      new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
    )[0]?.purchased_at

    return {
      totalPurchases,
      totalAmount,
      lastPurchase,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return { totalPurchases: 0, totalAmount: 0 }
  }
}
