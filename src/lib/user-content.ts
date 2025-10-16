import { wordpressClient, woocommerceClient } from './wordpress'

export interface UserPurchase {
  id: string
  postId: string
  postTitle: string
  postSlug: string
  amount: number
  purchasedAt: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  orderId: string
}

export interface TutorCourse {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  enrolledAt: string
  progress: number
  status: 'enrolled' | 'completed' | 'in_progress'
}

export interface UserContent {
  purchases: UserPurchase[]
  courses: TutorCourse[]
  totalSpent: number
  totalCourses: number
  lastActivity: string | null
}

/**
 * Récupère tous les achats d'un utilisateur depuis WooCommerce
 */
export async function getUserPurchases(userId: string): Promise<UserPurchase[]> {
  try {
    const response = await woocommerceClient.get('/wc/v3/orders', {
      params: {
        customer: userId,
        status: 'completed',
        per_page: 100
      }
    })

    const orders = response.data || []
    const purchases: UserPurchase[] = []

    for (const order of orders) {
      for (const item of order.line_items) {
        // Vérifier si c'est un article (SKU commence par "article-")
        if (item.sku && item.sku.startsWith('article-')) {
          const postId = item.sku.replace('article-', '')
          
          // Récupérer les détails de l'article
          try {
            const postResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`)
            const post = postResponse.data
            
            purchases.push({
              id: `${order.id}-${item.id}`,
              postId: postId,
              postTitle: post.title.rendered,
              postSlug: post.slug,
              amount: parseFloat(item.total),
              purchasedAt: order.date_created,
              status: order.status === 'completed' ? 'completed' : 'pending',
              orderId: order.id.toString()
            })
          } catch (error) {
            console.error(`Erreur récupération article ${postId}:`, error)
            // Ajouter quand même l'achat avec les infos disponibles
            purchases.push({
              id: `${order.id}-${item.id}`,
              postId: postId,
              postTitle: item.name || 'Article supprimé',
              postSlug: '',
              amount: parseFloat(item.total),
              purchasedAt: order.date_created,
              status: order.status === 'completed' ? 'completed' : 'pending',
              orderId: order.id.toString()
            })
          }
        }
      }
    }

    return purchases
  } catch (error) {
    console.error('Erreur récupération achats utilisateur:', error)
    return []
  }
}

/**
 * Récupère tous les cours Tutor LMS d'un utilisateur
 */
export async function getUserTutorCourses(userId: string): Promise<TutorCourse[]> {
  try {
    // Utiliser l'API Tutor LMS pour récupérer les cours de l'utilisateur
    const response = await wordpressClient.get('/tutor/v1/student-courses', {
      params: {
        student_id: userId,
        per_page: 100
      }
    })

    const courses = response.data || []
    
    return courses.map((course: any) => ({
      id: course.ID.toString(),
      title: course.post_title,
      slug: course.post_name,
      description: course.post_excerpt || '',
      thumbnail: course.thumbnail_url || '',
      enrolledAt: course.enrolled_date || course.post_date,
      progress: course.progress_percent || 0,
      status: course.is_completed ? 'completed' : 
              course.progress_percent > 0 ? 'in_progress' : 'enrolled'
    }))
  } catch (error) {
    console.error('Erreur récupération cours Tutor LMS:', error)
    return []
  }
}

/**
 * Récupère tout le contenu d'un utilisateur (achats + cours)
 */
export async function getUserContent(userId: string): Promise<UserContent> {
  try {
    const [purchases, courses] = await Promise.all([
      getUserPurchases(userId),
      getUserTutorCourses(userId)
    ])

    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)
    const totalCourses = courses.length
    
    // Trouver la dernière activité
    const allActivities = [
      ...purchases.map(p => p.purchasedAt),
      ...courses.map(c => c.enrolledAt)
    ].filter(Boolean)
    
    const lastActivity = allActivities.length > 0 
      ? new Date(Math.max(...allActivities.map(d => new Date(d).getTime()))).toISOString()
      : null

    return {
      purchases,
      courses,
      totalSpent,
      totalCourses,
      lastActivity
    }
  } catch (error) {
    console.error('Erreur récupération contenu utilisateur:', error)
    return {
      purchases: [],
      courses: [],
      totalSpent: 0,
      totalCourses: 0,
      lastActivity: null
    }
  }
}

/**
 * Vérifie si un utilisateur a acheté un article spécifique
 */
export async function hasUserPurchasedArticle(userId: string, postId: string): Promise<boolean> {
  try {
    const purchases = await getUserPurchases(userId)
    return purchases.some(purchase => purchase.postId === postId.toString())
  } catch (error) {
    console.error('Erreur vérification achat article:', error)
    return false
  }
}

/**
 * Vérifie si un utilisateur est inscrit à un cours spécifique
 */
export async function isUserEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    const courses = await getUserTutorCourses(userId)
    return courses.some(course => course.id === courseId.toString())
  } catch (error) {
    console.error('Erreur vérification inscription cours:', error)
    return false
  }
}
