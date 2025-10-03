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
    const purchases = await sanityClient.fetch(
      `*[_type == "purchase" && userId == $userId && postId == $postId && status == "completed"]`,
      { userId, postId }
    )
    
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
