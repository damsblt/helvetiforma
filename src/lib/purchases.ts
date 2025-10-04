import { sanityClient } from './sanity'

export interface Purchase {
  _id: string
  userId: string
  postId: string
  postTitle: string
  amount: number
  stripeSessionId: string
  purchasedAt: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
}

export async function checkUserPurchase(userId: string, postId: string): Promise<boolean> {
  try {
    console.log('🔍 checkUserPurchase called with:', { userId, postId })
    
    const purchases = await sanityClient.fetch(
      `*[_type == "purchase" && userId == $userId && postId == $postId && status == "completed"]`,
      { userId, postId }
    )
    
    console.log('🔍 checkUserPurchase result:', { 
      found: purchases.length > 0, 
      count: purchases.length,
      purchases: purchases.map(p => ({ id: p._id, status: p.status, postId: p.postId, userId: p.userId }))
    })
    
    return purchases.length > 0
  } catch (error) {
    console.error('Erreur lors de la vérification des achats:', error)
    return false
  }
}

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
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
