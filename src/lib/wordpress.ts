import axios from 'axios';

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

  // Formater l'article selon notre interface (sans WooCommerce pour l'instant)
  const formattedPost = {
    _id: post.id,
    title: post.title.rendered,
    slug: post.slug,
    excerpt: post.excerpt.rendered,
    body: post.content.rendered,
    publishedAt: post.date,
    accessLevel: post.acf?.access_level || post.acf?.access || 'public',
    price: price,
    image: post.featured_media ? `${WORDPRESS_URL}/wp-content/uploads/` : null,
    category: post.categories?.[0] ? 'Category' : null,
    tags: post.tags || [],
    // Ajouter les métadonnées ACF et meta
    acf: post.acf || {},
    meta: post.meta || {},
    // WooCommerce sera ajouté plus tard si nécessaire
    woocommerce: null
  };

  console.log('✅ formatWordPressPost - Article formaté:', formattedPost.title, 'Prix:', formattedPost.price);
  return formattedPost;
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

// Fonctions TutorLMS (placeholders)
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