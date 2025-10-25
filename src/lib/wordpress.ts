import axios from 'axios';
import { decodeHtmlEntitiesServer } from '@/utils/htmlDecode';
import { cleanWordPressContent } from '@/utils/wordpressContent';
import { getWooCommerceCoursePrices, wooCommercePricesCache } from './tutor-lms';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

// Types pour les articles WordPress
export interface WordPressPost {
  _id: number;
  title: string;
  slug: string | { current: string };
  excerpt: string;
  body: string;
  publishedAt: string;
  accessLevel: 'public' | 'members' | 'premium';
  price: number;
  image: string | null;
  category: string | null;
  tags: string[];
  // Propriétés additionnelles pour compatibilité
  created_at?: string;
  updated_at?: string;
  featured_image?: string;
  content?: string;
  // Métadonnées ACF et WordPress
  acf?: any;
  meta?: any;
  // Données WooCommerce
  woocommerce?: any;
}

// Client WordPress standard (avec cookies pour les sessions)
export const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: permet l'envoi des cookies de session
});

// Client WooCommerce (avec authentification)
export const woocommerceClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET || ''
  }
});

// Client authentifié
export const wordpressAuthClient = (token: string) => axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});

// Récupérer tous les articles
export async function getWordPressPosts(): Promise<WordPressPost[]> {
  try {
    console.log('🔍 Récupération des articles WordPress...');
    
    // Utiliser l'API WordPress standard au lieu de l'endpoint personnalisé
    const response = await wordpressClient.get('/wp/v2/posts', {
      params: {
        per_page: 100, // Récupérer jusqu'à 100 articles
        status: 'publish' // Seulement les articles publiés
      }
    });
    
    console.log(`✅ ${response.data.length} articles récupérés depuis WordPress`);
    
    // Formater les articles selon notre interface
    const formattedPosts = await Promise.all(
      response.data.map((post: any) => formatWordPressPost(post))
    );
    
    console.log(`✅ ${formattedPosts.length} articles formatés avec succès`);
    return formattedPosts;
  } catch (error) {
    console.error('❌ Erreur récupération articles WordPress:', error);
    return [];
  }
}

// Formater un article WordPress selon notre interface
async function formatWordPressPost(post: any): Promise<WordPressPost> {
  console.log('🔍 formatWordPressPost - Début traitement article:', post.id, post.title?.rendered);
  
  // Déterminer le prix depuis ACF d'abord
  let price = 0;
  if (post.acf?.price) {
    price = parseFloat(post.acf.price);
    console.log('🔍 Prix ACF trouvé:', price);
  }

  // Récupérer l'image featured
  let featuredImageUrl = null;
  if (post.featured_media) {
    try {
      featuredImageUrl = await getFeaturedImageUrl(post.featured_media);
      console.log('🔍 Image featured récupérée:', featuredImageUrl);
    } catch (error) {
      console.error('❌ Erreur récupération image featured:', error);
    }
  }

  // Formater l'article selon notre interface (sans WooCommerce pour l'instant)
  const decodedBody = decodeHtmlEntitiesServer(post.content.rendered)
  console.log('🔍 Contenu avant nettoyage (premiers 200 caractères):', decodedBody.substring(0, 200));
  
  const cleanedBody = cleanWordPressContent(decodedBody)
  console.log('🔍 Contenu après nettoyage (premiers 200 caractères):', cleanedBody.substring(0, 200));
  
  // Récupérer les PDFs depuis le champ ACF
  const pdfAttachments = await extractPdfsFromACF(post.acf);
  console.log('🔍 PDFs récupérés depuis ACF:', pdfAttachments.length);
  
  // Nettoyer aussi l'extrait pour supprimer les balises <p>
  const decodedExcerpt = decodeHtmlEntitiesServer(post.excerpt.rendered);
  const cleanedExcerpt = cleanWordPressContent(decodedExcerpt);
  
  const formattedPost = {
    _id: post.id,
    title: decodeHtmlEntitiesServer(post.title.rendered),
    slug: post.slug,
    excerpt: cleanedExcerpt,
    body: cleanedBody,
    publishedAt: post.date,
    accessLevel: post.acf?.access_level || post.acf?.access || 'public',
    price: price,
    image: featuredImageUrl,
    featured_image: featuredImageUrl || undefined,
    category: post.categories?.[0] ? 'Category' : null,
    tags: post.tags || [],
    pdfAttachments: pdfAttachments, // Ajouter les PDFs extraits
    // Ajouter les métadonnées ACF et meta
    acf: post.acf || {},
    meta: post.meta || {},
    // WooCommerce sera ajouté plus tard si nécessaire
    woocommerce: null
  };

  console.log('✅ formatWordPressPost - Article formaté:', formattedPost.title, 'Prix:', formattedPost.price, 'Image:', formattedPost.image, 'PDFs:', pdfAttachments.length);
  return formattedPost;
}

// Fonction pour extraire les PDFs depuis le champ ACF
async function extractPdfsFromACF(acf: any): Promise<Array<{
  title: string;
  url: string;
  isPremium: boolean;
  fileSize?: string;
  description?: string;
}>> {
  if (!acf) {
    console.log('🔍 Aucune donnée ACF trouvée');
    return [];
  }

  const pdfs: Array<{
    title: string;
    url: string;
    isPremium: boolean;
    fileSize?: string;
    description?: string;
  }> = [];

  // Vérifier le champ pdf (ID du fichier)
  if (acf.pdf && typeof acf.pdf === 'number') {
    console.log('🔍 PDF ID trouvé dans ACF:', acf.pdf);
    
    try {
      // Récupérer les détails du fichier depuis l'API WordPress
      const response = await wordpressClient.get(`/wp/v2/media/${acf.pdf}`);
      const mediaData = response.data;
      
      if (mediaData && mediaData.source_url) {
        const filename = mediaData.filename || mediaData.title?.rendered || 'Document PDF';
        const title = filename.replace(/\.pdf$/i, '');
        
        // Calculer la taille du fichier
        let fileSize = '';
        if (mediaData.media_details && mediaData.media_details.filesize) {
          const bytes = mediaData.media_details.filesize;
          if (bytes > 1024 * 1024) {
            fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          } else if (bytes > 1024) {
            fileSize = `${(bytes / 1024).toFixed(1)} KB`;
          } else {
            fileSize = `${bytes} B`;
          }
        }
        
        pdfs.push({
          title: title,
          url: mediaData.source_url,
          isPremium: true, // Par défaut, tous les PDFs ACF sont premium
          fileSize: fileSize,
          description: `Document PDF: ${title}`
        });
        
        console.log('🔍 PDF ACF ajouté:', { title, url: mediaData.source_url, fileSize });
      }
    } catch (error) {
      console.error('❌ Erreur récupération détails PDF:', error);
    }
  }

  // Vérifier le champ pdf_attachments (nouveau format)
  if (acf.pdf_attachments && Array.isArray(acf.pdf_attachments)) {
    console.log('🔍 Champ pdf_attachments trouvé:', acf.pdf_attachments.length, 'éléments');
    
    for (const pdf of acf.pdf_attachments) {
      if (pdf.pdf_file && pdf.pdf_file.url) {
        const title = pdf.pdf_title || pdf.title || 'Document PDF';
        const description = pdf.pdf_description || pdf.description || `Document PDF: ${title}`;
        
        let fileSize = '';
        if (pdf.pdf_file.filesize) {
          const bytes = pdf.pdf_file.filesize;
          if (bytes > 1024 * 1024) {
            fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          } else if (bytes > 1024) {
            fileSize = `${(bytes / 1024).toFixed(1)} KB`;
          } else {
            fileSize = `${bytes} B`;
          }
        }
        
        const isPremium = pdf.is_premium === true || pdf.is_premium === '1' || pdf.is_premium === 1;
        
        pdfs.push({
          title: title,
          url: pdf.pdf_file.url,
          isPremium: isPremium,
          fileSize: fileSize,
          description: description
        });
        
        console.log('🔍 PDF ACF ajouté:', { title, url: pdf.pdf_file.url, isPremium, fileSize });
      }
    }
  }

  console.log('🔍 PDFs ACF extraits:', pdfs.length, pdfs.map(p => p.title));
  return pdfs;
}

// Récupérer un article par slug
export async function getWordPressPost(slug: string): Promise<WordPressPost | null> {
  try {
    // D'abord, essayer de récupérer par slug via l'API WordPress standard
    const response = await wordpressClient.get(`/wp/v2/posts`, {
      params: {
        slug: slug,
        per_page: 1
      }
    });
    
    if (response.data && response.data.length > 0) {
      const post = response.data[0];
      return await formatWordPressPost(post);
    }
    
    return null;
  } catch (error) {
    console.error('Erreur récupération article WordPress:', error);
    return null;
  }
}

// Récupérer un article par ID
export async function getWordPressPostById(id: string | number): Promise<WordPressPost | null> {
  try {
    console.log('🔍 Récupération article WordPress par ID:', id, typeof id);
    
    // Validation de l'ID
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      console.error('❌ ID invalide fourni:', id);
      return null;
    }
    
    // Vérifier si c'est un ID numérique ou un slug
    const isNumericId = !isNaN(Number(id)) && Number(id) > 0;
    
    if (isNumericId) {
      // Essayer par ID numérique avec l'API WordPress native
      try {
        console.log('🔄 Tentative par ID numérique...');
        const url = `/wp/v2/posts/${id}`;
        console.log('🔍 URL de requête:', url);
        console.log('🔍 Base URL:', wordpressClient.defaults.baseURL);
        console.log('🔍 URL complète:', `${wordpressClient.defaults.baseURL}${url}`);
        
        const response = await wordpressClient.get(url);
        const post = response.data;
        
        console.log('🔍 Réponse WordPress:', {
          status: response.status,
          data: post,
          title: post?.title?.rendered
        });
        
        if (post) {
          console.log('✅ Article WordPress trouvé par ID:', post.title?.rendered || 'Sans titre');
          return await formatWordPressPost(post);
        }
      } catch (idError: any) {
        console.log('⚠️ Article non trouvé par ID numérique, tentative par slug...', {
          message: idError.message,
          status: idError.response?.status,
          data: idError.response?.data,
          url: idError.config?.url
        });
      }
    }
    
    // Essayer par slug avec l'API WordPress native
    try {
      console.log('🔄 Tentative par slug...');
      const slugResponse = await wordpressClient.get('/wp/v2/posts', {
        params: { slug: id, per_page: 1 }
      });
      
      console.log('🔍 Slug response:', {
        status: slugResponse.status,
        dataLength: slugResponse.data?.length,
        data: slugResponse.data
      });
      
      if (slugResponse.data && slugResponse.data.length > 0) {
        console.log('✅ Article trouvé par slug:', slugResponse.data[0].title?.rendered);
        const formattedPost = await formatWordPressPost(slugResponse.data[0]);
        console.log('🔍 Formatted post:', formattedPost);
        return formattedPost;
      } else {
        console.log('⚠️ Aucun article trouvé par slug dans la réponse');
      }
    } catch (slugError: any) {
      console.log('⚠️ Erreur lors de la recherche par slug:', {
        message: slugError.message,
        status: slugError.response?.status,
        data: slugError.response?.data
      });
    }
    
    // Dernière tentative: récupérer tous les articles et chercher localement
    try {
      console.log('🔄 Tentative avec récupération de tous les articles...');
      const response = await wordpressClient.get('/wp/v2/posts', {
        params: { per_page: 100, status: 'publish' }
      });
      const posts = response.data;
      
      if (posts && Array.isArray(posts)) {
        // Chercher par ID numérique ou par slug
        const isNumericId = !isNaN(Number(id)) && Number(id) > 0;
        let foundPost = null;
        
        if (isNumericId) {
          foundPost = posts.find((post: any) => post.id === Number(id));
        } else {
          foundPost = posts.find((post: any) => post.slug === id);
        }
        
        if (foundPost) {
          console.log('✅ Article trouvé via recherche globale:', foundPost.title?.rendered || 'Sans titre');
          return await formatWordPressPost(foundPost);
        }
      }
    } catch (globalError: any) {
      console.log('⚠️ Recherche globale échouée:', {
        message: globalError.message,
        status: globalError.response?.status
      });
    }
    
    console.error('❌ Article non trouvé ni par ID ni par slug:', id);
    return null;
    
  } catch (error: any) {
    console.error('❌ Erreur récupération article WordPress:', {
      id,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullError: error
    });
    return null;
  }
}

// Alias pour compatibilité
export const getWordPressPostBySlug = getWordPressPost;

// Helper function to get featured image URL
async function getFeaturedImageUrl(mediaId: number): Promise<string | null> {
  try {
    const response = await wordpressClient.get(`/wp/v2/media/${mediaId}`);
    if (response.data && response.data.source_url) {
      // Use proxy-image API to avoid CORS issues
      const imageUrl = response.data.source_url;
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
  } catch (error) {
    console.error('❌ Erreur récupération image featured:', error);
  }
  return null;
}

// Helper function to get slug string from WordPress post
export function getPostSlug(post: WordPressPost): string {
  return typeof post.slug === 'string' ? post.slug : post.slug?.current || '';
}

// Vérifier achat utilisateur via WooCommerce
export async function checkWordPressPurchase(userId: string, postId: string): Promise<boolean> {
  try {
    console.log('🔍 checkWordPressPurchase called with:', { userId, postId })
    
    // Récupérer les commandes de l'utilisateur
    const orders = await getWordPressUserPurchases(userId);
    console.log('🔍 WooCommerce orders found:', orders.length);
    
    // Vérifier si une commande contient l'article spécifique
    const hasPurchased = orders.some((order: any) =>
      order.line_items.some((item: any) => {
        // Vérifier si l'ID de l'article est dans les métadonnées de la ligne de commande
        const postIdMeta = item.meta_data?.find((meta: any) => meta.key === '_post_id')
        if (postIdMeta && postIdMeta.value === postId) {
          return true
        }
        // Vérifier si l'ID de l'article est dans le SKU (format: article-{id})
        if (item.sku === `article-${postId}`) {
          return true
        }
        return false
      })
    );
    
    console.log('🔍 Purchase check result:', { hasPurchased, userId, postId });
    return hasPurchased;
  } catch (error) {
    console.error('Erreur vérification achat WordPress:', error);
    return false;
  }
}

// Récupérer les achats d'un utilisateur via WooCommerce
export async function getWordPressUserPurchases(userId: string): Promise<any[]> {
  try {
    console.log('🔍 Récupération des achats pour l\'utilisateur:', userId);
    
    // Récupérer toutes les commandes complétées
    const response = await woocommerceClient.get('/wc/v3/orders', {
      params: {
        status: 'completed',
        per_page: 100
      }
    });
    
    const allOrders = response.data || [];
    console.log(`📦 ${allOrders.length} commandes totales trouvées`);
    
    // Filtrer les commandes qui appartiennent à cet utilisateur
    const userOrders = allOrders.filter((order: any) => {
      // Vérifier par customer_id si c'est un ID numérique
      if (!isNaN(Number(userId)) && order.customer_id === Number(userId)) {
        return true;
      }
      
      // Vérifier par email dans billing
      if (order.billing?.email === userId) {
        return true;
      }
      
      // Vérifier par _user_id dans les métadonnées
      const userIdMeta = order.meta_data?.find((meta: any) => meta.key === '_user_id');
      if (userIdMeta && userIdMeta.value === userId) {
        return true;
      }
      
      return false;
    });
    
    console.log(`✅ ${userOrders.length} commandes trouvées pour l'utilisateur ${userId}`);
    
    return userOrders;
  } catch (error) {
    console.error('❌ Erreur récupération achats WordPress:', error);
    return [];
  }
}

// Récupérer les articles achetés par un utilisateur avec détails
export async function getUserPurchasedArticles(userId: string): Promise<WordPressPost[]> {
  try {
    console.log('🔍 Récupération des articles achetés pour l\'utilisateur:', userId);
    
    // Récupérer les commandes de l'utilisateur
    const orders = await getWordPressUserPurchases(userId);
    
    if (orders.length === 0) {
      console.log('ℹ️ Aucune commande trouvée pour l\'utilisateur');
      return [];
    }
    
    // Extraire les IDs d'articles des commandes
    const articleIds = new Set<string>();
    
    for (const order of orders) {
      if (order.line_items && Array.isArray(order.line_items)) {
        for (const item of order.line_items) {
          // Chercher dans les métadonnées pour l'ID de l'article
          if (item.meta_data) {
            const postIdMeta = item.meta_data.find((meta: any) => meta.key === '_post_id');
            if (postIdMeta && postIdMeta.value) {
              articleIds.add(postIdMeta.value.toString());
            }
          }
          
          // Aussi vérifier le SKU pour les articles (format: article-{id})
          if (item.sku && item.sku.startsWith('article-')) {
            const postId = item.sku.replace('article-', '');
            articleIds.add(postId);
          }
        }
      }
    }
    
    console.log(`📚 ${articleIds.size} articles uniques trouvés dans les commandes`);
    
    // Récupérer les détails de chaque article
    const articles: WordPressPost[] = [];
    
    for (const articleId of articleIds) {
      try {
        const article = await getWordPressPostById(articleId);
        if (article) {
          articles.push(article);
        }
      } catch (error) {
        console.error(`❌ Erreur récupération article ${articleId}:`, error);
      }
    }
    
    console.log(`✅ ${articles.length} articles récupérés avec succès`);
    return articles;
    
  } catch (error) {
    console.error('❌ Erreur récupération articles achetés:', error);
    return [];
  }
}

// WordPress Courses API Functions
export async function getWordPressCourses(params: {
  per_page?: number;
  page?: number;
  search?: string;
  category?: string;
  level?: string;
  status?: 'publish' | 'draft' | 'private';
  featured?: boolean;
} = {}): Promise<any[]> {
  try {
    console.log('🔍 Fetching courses from WordPress API...');
    
    const response = await wordpressClient.get('/wp/v2/courses', {
      params: {
        per_page: params.per_page || 50,
        page: params.page || 1,
        search: params.search,
        status: params.status || 'publish',
        _embed: true, // Include embedded resources like featured images
        ...(params.category && { 'course-category': params.category }),
        ...(params.level && { 'course-tag': params.level }),
        ...(params.featured && { featured: true })
      }
    });
    
    console.log('✅ WordPress API response:', response.status, response.data?.length || 0, 'courses');
    return response.data || [];
    
  } catch (error) {
    console.error('❌ Error fetching WordPress courses:', error);
    return [];
  }
}

// Format WordPress course data to match TutorCourse interface
export function formatWordPressCourse(course: any): any {
  // Get featured image URL from embedded media
  let featuredImage = '';
  if (course._embedded && course._embedded['wp:featuredmedia'] && course._embedded['wp:featuredmedia'][0]) {
    const media = course._embedded['wp:featuredmedia'][0];
    featuredImage = media.source_url || media.media_details?.sizes?.large?.source_url || media.media_details?.sizes?.medium?.source_url || '';
  }

  // Get categories from embedded terms
  let categories: any[] = [];
  if (course._embedded && course._embedded['wp:term']) {
    const terms = course._embedded['wp:term'];
    categories = terms.flat().filter((term: any) => term.taxonomy === 'course-category');
  }

  // Get tags from embedded terms
  let tags: any[] = [];
  if (course._embedded && course._embedded['wp:term']) {
    const terms = course._embedded['wp:term'];
    tags = terms.flat().filter((term: any) => term.taxonomy === 'course-tag');
  }

  // Clean HTML from text fields
  const cleanHtmlText = (text: string) => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  };

  return {
    id: course.id,
    title: cleanHtmlText(course.title?.rendered || course.title || ''),
    content: course.content?.rendered || course.content || '',
    excerpt: cleanHtmlText(course.excerpt?.rendered || course.excerpt || ''),
    slug: course.slug,
    status: course.status || 'publish',
    author: course.author || 0,
    featured_image: featuredImage,
    course_price: 0, // Will be set by WooCommerce integration
    course_level: 'beginner', // Default level
    course_duration: '',
    course_benefits: [],
    course_requirements: [],
    course_curriculum: [],
    course_instructors: [],
    enrolled_count: 0,
    rating: 0,
    reviews_count: 0,
    is_enrolled: false,
    is_completed: false,
    progress_percentage: 0,
    created_at: course.date || new Date().toISOString(),
    updated_at: course.modified || new Date().toISOString(),
    categories: categories,
    tags: tags,
  };
}

export async function getWordPressCourse(courseId: string | number): Promise<any | null> {
  try {
    console.log('🔍 Fetching course from WordPress API:', courseId);
    
    const response = await wordpressClient.get(`/wp/v2/courses/${courseId}`, {
      params: { _embed: true }
    });
    
    console.log('✅ WordPress API course response:', response.status);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error fetching WordPress course:', error);
    return null;
  }
}

// Complete WordPress courses function with WooCommerce integration
export async function getWordPressCoursesWithPrices(params: {
  per_page?: number;
  page?: number;
  search?: string;
  category?: string;
  level?: string;
  status?: 'publish' | 'draft' | 'private';
  featured?: boolean;
} = {}): Promise<any[]> {
  try {
    console.log('🔍 Fetching courses from WordPress API with prices...');
    
    // Fetch courses from WordPress
    const courses = await getWordPressCourses(params);
    
    if (courses.length === 0) {
      console.log('📚 No courses found from WordPress API');
      return [];
    }
    
    // Fetch WooCommerce prices
    console.log('💰 Fetching WooCommerce prices...');
    await getWooCommerceCoursePrices();
    
    // Format courses with prices
    console.log('🔄 Processing courses with prices...');
    const formattedCourses = courses.map(course => {
      const formatted = formatWordPressCourse(course);
      
      // Add WooCommerce price if available
      const title = formatted.title.toLowerCase();
      const slug = formatted.slug;
      
      if (wooCommercePricesCache[title]) {
        formatted.course_price = wooCommercePricesCache[title];
      } else if (wooCommercePricesCache[slug]) {
        formatted.course_price = wooCommercePricesCache[slug];
      }
      
      return formatted;
    });
    
    console.log('✅ WordPress courses processed:', formattedCourses.length);
    return formattedCourses;
    
  } catch (error) {
    console.error('❌ Error fetching WordPress courses with prices:', error);
    return [];
  }
}

// Fonctions TutorLMS (placeholders - kept for compatibility)
export async function getTutorCourses() {
  try {
    const response = await wordpressClient.get('/tutor/v1/courses');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération cours TutorLMS:', error);
    return [];
  }
}

export async function getTutorCourse(courseId: string) {
  try {
    const response = await wordpressClient.get(`/tutor/v1/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération cours TutorLMS:', error);
    return null;
  }
}