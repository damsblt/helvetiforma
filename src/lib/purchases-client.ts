'use client'

import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: '2023-05-03'
})

/**
 * Vérifier si un utilisateur a acheté un article (côté client)
 */
export async function checkUserPurchaseClient(
  userId: string,
  postId: string
): Promise<boolean> {
  try {
    console.log('🔍 checkUserPurchaseClient called with:', { userId, postId })
    
    const purchases = await sanityClient.fetch(
      `*[_type == "purchase" && userId == $userId && postId == $postId && status == "completed"]`,
      { userId, postId }
    )
    
    console.log('🔍 checkUserPurchaseClient result:', { 
      found: purchases.length > 0, 
      count: purchases.length,
      purchases: purchases.map((p: any) => ({ id: p._id, status: p.status, postId: p.postId, userId: p.userId }))
    })
    
    return purchases.length > 0
  } catch (error) {
    console.error('Erreur lors de la vérification des achats:', error)
    return false
  }
}

/**
 * Récupérer tous les achats d'un utilisateur (côté client)
 */
export async function getUserPurchasesClient(userId: string) {
  try {
    const purchases = await sanityClient.fetch(
      `*[_type == "purchase" && userId == $userId && status == "completed"] | order(purchasedAt desc)`,
      { userId }
    )
    
    return purchases
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error)
    return []
  }
}
