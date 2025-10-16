// Unified Payment and Access Management System
// Handles both Tutor LMS courses and WordPress articles

import { TutorCourse } from './tutor-lms';
import { WordPressPost } from './wordpress';

export type ContentType = 'article' | 'course';
export type AccessLevel = 'public' | 'members' | 'premium' | 'enrolled';

export interface UnifiedContent {
  id: string | number;
  type: ContentType;
  title: string;
  slug: string;
  description: string;
  price: number;
  accessLevel: AccessLevel;
  image?: string;
  author?: string;
  duration?: string;
  level?: string;
  categories?: string[];
  tags?: string[];
  createdAt?: string;
  // Course specific
  isEnrolled?: boolean;
  isCompleted?: boolean;
  progressPercentage?: number;
  // Article specific
  isPurchased?: boolean;
  previewContent?: string;
}

export interface PurchaseData {
  contentId: string | number;
  contentType: ContentType;
  userId: string | number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface UserAccess {
  userId: string | number;
  contentId: string | number;
  contentType: ContentType;
  accessLevel: AccessLevel;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

// Convert Tutor Course to Unified Content
export function tutorCourseToUnified(course: TutorCourse): UnifiedContent {
  return {
    id: course.id,
    type: 'course',
    title: course.title,
    slug: course.slug,
    description: course.excerpt,
    price: course.course_price || 0,
    accessLevel: course.is_enrolled ? 'enrolled' : (course.course_price && course.course_price > 0 ? 'premium' : 'public'),
    image: course.featured_image,
    author: course.course_instructors?.[0]?.display_name || 'Formateur',
    duration: course.course_duration,
    level: course.course_level,
    categories: course.categories?.map(cat => cat.name) || [],
    tags: course.tags?.map(tag => tag.name) || [],
    createdAt: course.created_at,
    isEnrolled: course.is_enrolled,
    isCompleted: course.is_completed,
    progressPercentage: course.progress_percentage,
  };
}

// Convert WordPress Post to Unified Content
export function wordPressPostToUnified(post: WordPressPost): UnifiedContent {
  return {
    id: post._id || (post as any).id,
    type: 'article',
    title: post.title,
    slug: typeof post.slug === 'string' ? post.slug : post.slug?.current || '',
    description: post.excerpt,
    price: post.price || 0,
    accessLevel: post.accessLevel || 'public',
    image: post.image || undefined,
    author: 'Auteur',
    categories: post.category ? [post.category] : [],
    tags: post.tags || [],
    createdAt: post.publishedAt || post.created_at,
    isPurchased: false, // Will be set by access check
    previewContent: post.excerpt,
  };
}

// Check user access to content
export async function checkUserAccess(
  userId: string | number,
  contentId: string | number,
  contentType: ContentType
): Promise<boolean> {
  try {
    if (contentType === 'course') {
      // Check course enrollment
      const response = await fetch(`/api/tutor-lms/enrollments?userId=${userId}&courseId=${contentId}`);
      const data = await response.json();
      return data.isEnrolled || false;
    } else if (contentType === 'article') {
      // Check article purchase
      const response = await fetch(`/api/check-purchase?postId=${contentId}&userId=${userId}`);
      const data = await response.json();
      return data.hasPurchased || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

// Get user's purchased content
export async function getUserPurchasedContent(userId: string | number): Promise<UnifiedContent[]> {
  try {
    const [articlesResponse, coursesResponse] = await Promise.all([
      fetch(`/api/user/purchased-articles?userId=${userId}`),
      fetch(`/api/tutor-lms/user-courses?userId=${userId}`)
    ]);

    const articles = await articlesResponse.json();
    const courses = await coursesResponse.json();

    const unifiedArticles = articles.data?.map((article: WordPressPost) => 
      wordPressPostToUnified({ ...article, isPurchased: true } as any)
    ) || [];

    const unifiedCourses = courses.data?.map((course: TutorCourse) => 
      tutorCourseToUnified({ ...course, is_enrolled: true })
    ) || [];

    return [...unifiedArticles, ...unifiedCourses];
  } catch (error) {
    console.error('Error fetching user purchased content:', error);
    return [];
  }
}

// Process payment for content
export async function processContentPayment(
  contentId: string | number,
  contentType: ContentType,
  userId: string | number,
  amount: number,
  paymentMethod: string = 'stripe'
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
  try {
    if (contentType === 'course') {
      // Process course enrollment payment
      const response = await fetch('/api/tutor-lms/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: contentId,
          userId,
          amount,
          paymentMethod
        })
      });

      const data = await response.json();
      return data;
    } else if (contentType === 'article') {
      // Process article purchase payment
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: contentId,
          userId,
          amount,
          paymentMethod
        })
      });

      const data = await response.json();
      return data;
    }

    return { success: false, error: 'Unsupported content type' };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: 'Payment processing failed' };
  }
}

// Get content access level based on user status
export function getContentAccessLevel(
  content: UnifiedContent,
  user: any,
  hasPurchased: boolean = false
): AccessLevel {
  if (content.accessLevel === 'public') return 'public';
  
  if (!user) return 'premium'; // Requires authentication
  
  if (content.type === 'course') {
    return content.isEnrolled ? 'enrolled' : 'premium';
  } else if (content.type === 'article') {
    if (content.accessLevel === 'members') return 'members';
    return hasPurchased ? 'enrolled' : 'premium';
  }
  
  return 'premium';
}

// Check if user can access content
export function canUserAccessContent(
  content: UnifiedContent,
  user: any,
  hasPurchased: boolean = false
): boolean {
  const accessLevel = getContentAccessLevel(content, user, hasPurchased);
  
  switch (accessLevel) {
    case 'public':
      return true;
    case 'members':
      return !!user;
    case 'enrolled':
      return true;
    case 'premium':
      return false;
    default:
      return false;
  }
}

// Get content pricing display
export function getContentPricing(content: UnifiedContent): {
  price: number;
  currency: string;
  displayPrice: string;
  isFree: boolean;
} {
  const price = content.price || 0;
  const currency = 'CHF';
  const isFree = price === 0;
  
  const displayPrice = isFree 
    ? 'Gratuit' 
    : new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
      }).format(price);

  return {
    price,
    currency,
    displayPrice,
    isFree
  };
}

// Get content action button text and type
export function getContentAction(
  content: UnifiedContent,
  user: any,
  hasPurchased: boolean = false
): {
  text: string;
  type: 'enroll' | 'purchase' | 'continue' | 'view' | 'login';
  href?: string;
  requiresPayment: boolean;
} {
  if (!user) {
    return {
      text: 'Se connecter',
      type: 'login',
      href: '/login',
      requiresPayment: false
    };
  }

  if (content.type === 'course') {
    if (content.isEnrolled) {
      if (content.isCompleted) {
        return {
          text: 'Voir le certificat',
          type: 'view',
          href: `/courses/${content.slug}/certificate`,
          requiresPayment: false
        };
      } else {
        return {
          text: 'Continuer la formation',
          type: 'continue',
          href: `/courses/${content.slug}/learn`,
          requiresPayment: false
        };
      }
    } else {
      return {
        text: content.price > 0 ? `S'inscrire - ${getContentPricing(content).displayPrice}` : 'Commencer gratuitement',
        type: 'enroll',
        href: `/courses/${content.slug}`,
        requiresPayment: content.price > 0
      };
    }
  } else if (content.type === 'article') {
    if (hasPurchased) {
      return {
        text: 'Lire l\'article',
        type: 'view',
        href: `/posts/${content.slug}`,
        requiresPayment: false
      };
    } else {
      return {
        text: content.price > 0 ? `Acheter - ${getContentPricing(content).displayPrice}` : 'Lire l\'article',
        type: 'purchase',
        href: `/posts/${content.slug}`,
        requiresPayment: content.price > 0
      };
    }
  }

  return {
    text: 'Voir le contenu',
    type: 'view',
    requiresPayment: false
  };
}
