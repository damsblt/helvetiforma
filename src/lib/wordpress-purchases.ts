import { checkWordPressPurchase, getWordPressUserPurchases } from './wordpress'

export interface WordPressPurchase {
  id: number
  userId: string
  postId: string
  postTitle: string
  amount: number
  status: string
  purchasedAt: string
  orderNumber: string
}

export async function checkUserPurchase(userId: string, postId: string): Promise<boolean> {
  try {
    console.log('🔍 checkUserPurchase WordPress called with:', { userId, postId })
    
    const hasPurchased = await checkWordPressPurchase(userId, postId)
    
    console.log('🔍 checkUserPurchase WordPress result:', { 
      hasPurchased,
      userId,
      postId
    })
    
    return hasPurchased
  } catch (error) {
    console.error('Erreur lors de la vérification des achats WordPress:', error)
    return false
  }
}

export async function checkUserPurchaseWithSession(userId: string, postId: string): Promise<boolean> {
  try {
    if (!userId) {
      console.log('🔍 No user ID provided for purchase check')
      return false
    }
    
    console.log('🔍 checkUserPurchaseWithSession WordPress called with:', { 
      userId, 
      postId
    })
    
    return await checkUserPurchase(userId, postId)
  } catch (error) {
    console.error('Erreur lors de la vérification de session et achat WordPress:', error)
    return false
  }
}

export async function getUserPurchases(userId: string): Promise<WordPressPurchase[]> {
  try {
    const orders = await getWordPressUserPurchases(userId)
    
    // Transformer les commandes WooCommerce en format WordPressPurchase
    const purchases: WordPressPurchase[] = []
    
    for (const order of orders) {
      for (const item of order.line_items || []) {
        // Récupérer le postId depuis les métadonnées du produit
        const postId = item.meta_data?.find((meta: any) => meta.key === '_post_id')?.value
        
        if (postId) {
          purchases.push({
            id: order.id,
            userId: userId,
            postId: postId.toString(),
            postTitle: item.name,
            amount: parseFloat(item.total),
            status: order.status,
            purchasedAt: order.date_created,
            orderNumber: order.number || order.id.toString()
          })
        }
      }
    }
    
    return purchases.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
  } catch (error) {
    console.error('Erreur lors de la récupération des achats WordPress:', error)
    return []
  }
}
