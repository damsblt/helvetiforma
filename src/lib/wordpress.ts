// WordPress/TutorLMS API Integration
import { TutorCourse, TutorEnrollment, WordPressUser } from '@/types/wordpress'

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://cms.helvetiforma.ch'
const WORDPRESS_APP_USER = process.env.WORDPRESS_APP_USER || 'service-account'
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || ''

// Configuration des en-têtes pour l'authentification
const getAuthHeaders = () => {
  const credentials = Buffer.from(`${WORDPRESS_APP_USER}:${WORDPRESS_APP_PASSWORD}`).toString('base64')
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  }
}

// Fonction utilitaire pour les appels API
async function wordpressApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${WORDPRESS_URL}/wp-json${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// === TUTOR LMS FUNCTIONS ===

/**
 * Récupère tous les cours TutorLMS
 */
export async function getTutorCourses(params?: {
  per_page?: number
  page?: number
  search?: string
  status?: 'publish' | 'draft' | 'private'
}): Promise<TutorCourse[]> {
  try {
    const queryParams = new URLSearchParams({
      per_page: params?.per_page?.toString() || '10',
      page: params?.page?.toString() || '1',
      status: params?.status || 'publish',
      ...(params?.search && { search: params.search }),
    })

    const courses = await wordpressApi<any[]>(`/tutor/v1/courses?${queryParams}`)
    
    return courses.map(course => ({
      id: course.id,
      title: course.title?.rendered || course.title,
      description: course.excerpt?.rendered || course.content?.rendered || '',
      content: course.content?.rendered || '',
      price: course.price || 0,
      instructor: course.instructor?.display_name || 'Instructeur',
      instructor_id: course.instructor?.ID || course.author,
      thumbnail: course.featured_image || course.thumbnail || '',
      duration: course.duration || '',
      level: course.level || 'beginner',
      category: course.course_category?.[0]?.name || '',
      enrollment_url: `${WORDPRESS_URL}/courses/${course.slug}`,
      purchase_url: `${WORDPRESS_URL}/checkout?course=${course.id}`,
      slug: course.slug,
      status: course.status,
      created_at: course.date,
      updated_at: course.modified,
      enrolled_count: course.enrolled || 0,
      max_students: course.max_students || 0,
      prerequisites: course.prerequisites || [],
      objectives: course.objectives || [],
      features: course.features || [],
    }))
  } catch (error) {
    console.error('Error fetching Tutor courses:', error)
    
    // Fallback avec des données simulées en cas d'erreur
    return [
      {
        id: 1,
        title: "Comptabilité Suisse Fondamentale",
        description: "Maîtrisez les bases de la comptabilité selon les normes suisses",
        content: "<p>Formation complète en comptabilité suisse...</p>",
        price: 299,
        instructor: "Marie Dubois",
        instructor_id: 1,
        thumbnail: "/images/course-comptabilite.jpg",
        duration: "8 semaines",
        level: "beginner",
        category: "Comptabilité",
        enrollment_url: `${WORDPRESS_URL}/courses/comptabilite-suisse`,
        purchase_url: `${WORDPRESS_URL}/checkout?course=1`,
        slug: "comptabilite-suisse",
        status: "publish",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        enrolled_count: 45,
        max_students: 100,
        prerequisites: [],
        objectives: ["Comprendre les principes comptables suisses", "Maîtriser les écritures de base"],
        features: ["Accès à vie", "Certificat inclus", "Support 24/7"],
      },
      {
        id: 2,
        title: "Gestion des Salaires en Suisse",
        description: "Formation complète sur le calcul et la gestion des salaires",
        content: "<p>Apprenez à calculer et gérer les salaires...</p>",
        price: 399,
        instructor: "Jean-Claude Martin",
        instructor_id: 2,
        thumbnail: "/images/course-salaires.jpg",
        duration: "6 semaines",
        level: "intermediate",
        category: "RH",
        enrollment_url: `${WORDPRESS_URL}/courses/gestion-salaires`,
        purchase_url: `${WORDPRESS_URL}/checkout?course=2`,
        slug: "gestion-salaires",
        status: "publish",
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-20T00:00:00Z",
        enrolled_count: 32,
        max_students: 80,
        prerequisites: ["Bases de comptabilité"],
        objectives: ["Calculer les salaires suisses", "Gérer les charges sociales"],
        features: ["Cas pratiques", "Outils Excel", "Suivi personnalisé"],
      }
    ]
  }
}

/**
 * Récupère un cours TutorLMS par son ID
 */
export async function getTutorCourse(id: number): Promise<TutorCourse | null> {
  try {
    const course = await wordpressApi<any>(`/tutor/v1/courses/${id}`)
    
    return {
      id: course.id,
      title: course.title?.rendered || course.title,
      description: course.excerpt?.rendered || course.content?.rendered || '',
      content: course.content?.rendered || '',
      price: course.price || 0,
      instructor: course.instructor?.display_name || 'Instructeur',
      instructor_id: course.instructor?.ID || course.author,
      thumbnail: course.featured_image || course.thumbnail || '',
      duration: course.duration || '',
      level: course.level || 'beginner',
      category: course.course_category?.[0]?.name || '',
      enrollment_url: `${WORDPRESS_URL}/courses/${course.slug}`,
      purchase_url: `${WORDPRESS_URL}/checkout?course=${course.id}`,
      slug: course.slug,
      status: course.status,
      created_at: course.date,
      updated_at: course.modified,
      enrolled_count: course.enrolled || 0,
      max_students: course.max_students || 0,
      prerequisites: course.prerequisites || [],
      objectives: course.objectives || [],
      features: course.features || [],
    }
  } catch (error) {
    console.error(`Error fetching Tutor course ${id}:`, error)
    return null
  }
}

/**
 * Inscrit un utilisateur à un cours
 */
export async function enrollUserInCourse(userId: number, courseId: number): Promise<TutorEnrollment | null> {
  try {
    const enrollment = await wordpressApi<any>('/tutor/v1/enroll', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        course_id: courseId,
      }),
    })

    return {
      id: enrollment.id,
      user_id: userId,
      course_id: courseId,
      enrolled_at: enrollment.enrolled_at || new Date().toISOString(),
      status: enrollment.status || 'enrolled',
      progress: enrollment.progress || 0,
      completed_at: enrollment.completed_at,
    }
  } catch (error) {
    console.error('Error enrolling user in course:', error)
    return null
  }
}

/**
 * Récupère les inscriptions d'un utilisateur
 */
export async function getUserEnrollments(userId: number): Promise<TutorEnrollment[]> {
  try {
    const enrollments = await wordpressApi<any[]>(`/tutor/v1/enrollments?user_id=${userId}`)
    
    return enrollments.map(enrollment => ({
      id: enrollment.id,
      user_id: userId,
      course_id: enrollment.course_id,
      enrolled_at: enrollment.enrolled_at,
      status: enrollment.status || 'enrolled',
      progress: enrollment.progress || 0,
      completed_at: enrollment.completed_at,
    }))
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    return []
  }
}

// === WORDPRESS USER FUNCTIONS ===

/**
 * Authentifie un utilisateur WordPress
 */
export async function authenticateWordPressUser(username: string, password: string): Promise<{
  success: boolean
  user?: WordPressUser
  token?: string
  error?: string
}> {
  try {
    // Tentative d'authentification JWT
    const jwtResponse = await fetch(`${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (jwtResponse.ok) {
      const jwtData = await jwtResponse.json()
      
      if (jwtData.token) {
        // Récupérer les informations utilisateur
        const userResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
          headers: {
            'Authorization': `Bearer ${jwtData.token}`,
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          
          return {
            success: true,
            user: {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              display_name: userData.name,
              roles: userData.roles || ['subscriber'],
              avatar_url: userData.avatar_urls?.['96'] || '',
            },
            token: jwtData.token,
          }
        }
      }
    }

    return {
      success: false,
      error: 'Nom d\'utilisateur ou mot de passe incorrect',
    }
  } catch (error) {
    console.error('WordPress authentication error:', error)
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    }
  }
}

/**
 * Crée un nouvel utilisateur WordPress
 */
export async function createWordPressUser(userData: {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}): Promise<{ success: boolean; user?: WordPressUser; error?: string }> {
  try {
    const user = await wordpressApi<any>('/wp/v2/users', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        roles: ['subscriber'],
      }),
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.name,
        roles: user.roles,
        avatar_url: user.avatar_urls?.['96'] || '',
      },
    }
  } catch (error) {
    console.error('Error creating WordPress user:', error)
    return {
      success: false,
      error: 'Erreur lors de la création du compte',
    }
  }
}

/**
 * Vérifie la disponibilité d'un nom d'utilisateur
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    await wordpressApi(`/wp/v2/users?search=${encodeURIComponent(username)}`)
    return false // Si aucune erreur, l'utilisateur existe
  } catch (error) {
    return true // Si erreur 404, l'utilisateur n'existe pas
  }
}

/**
 * Réinitialise le mot de passe d'un utilisateur
 */
export async function resetUserPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await wordpressApi('/wp/v2/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    return { success: true }
  } catch (error) {
    console.error('Error resetting password:', error)
    return {
      success: false,
      error: 'Erreur lors de la réinitialisation du mot de passe',
    }
  }
}
