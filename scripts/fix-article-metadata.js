const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: process.env.WORDPRESS_USER || 'contact@helvetiforma.ch',
    password: process.env.WORDPRESS_PASSWORD || 'RWnb nSO6 6TMX yWd0 HWFl HBYh',
  },
});

const woocommerceClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET
  }
});

async function fixArticleMetadata() {
  console.log('🔧 Correction des métadonnées de l\'article...');
  console.log('='.repeat(50));
  
  const articleId = 3774;
  
  try {
    // 1. Récupérer le produit WooCommerce
    console.log('🛒 Récupération du produit WooCommerce...');
    const productResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { sku: `article-${articleId}`, per_page: 1 }
    });
    
    if (!productResponse.data || productResponse.data.length === 0) {
      console.log('❌ Produit WooCommerce non trouvé');
      return;
    }
    
    const product = productResponse.data[0];
    console.log('✅ Produit trouvé:', {
      id: product.id,
      name: product.name,
      sku: product.sku
    });
    
    // 2. Mettre à jour les métadonnées de l'article
    console.log('\n📝 Mise à jour des métadonnées de l\'article...');
    
    // Utiliser l'endpoint WordPress pour mettre à jour les métadonnées
    const updateResponse = await wordpressClient.post('/wp/v2/posts', {
      id: articleId,
      meta: {
        woocommerce_product_id: product.id.toString()
      }
    });
    
    console.log('✅ Métadonnées mises à jour');
    
    // 3. Vérifier que les métadonnées ont été mises à jour
    console.log('\n🔍 Vérification des métadonnées...');
    const articleResponse = await wordpressClient.get(`/wp/v2/posts/${articleId}`);
    console.log('📊 Meta fields:', articleResponse.data.meta);
    
    // 4. Tester la vérification d'achat
    console.log('\n🔐 Test de la vérification d\'achat...');
    const checkResponse = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
      params: { postId: articleId.toString(), userId: '193' }
    });
    console.log('✅ Vérification d\'achat:', checkResponse.data);
    
    if (checkResponse.data.hasPurchased) {
      console.log('\n🎉 Succès ! La vérification d\'achat fonctionne maintenant !');
    } else {
      console.log('\n⚠️ La vérification d\'achat ne fonctionne toujours pas');
      console.log('💡 Vérifiez la fonction check_user_purchase dans WordPress');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

fixArticleMetadata();
