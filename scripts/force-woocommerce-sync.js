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
    username: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET || ''
  }
});

async function forceWooCommerceSync() {
  console.log('🔄 Synchronisation forcée avec WooCommerce...');
  console.log('='.repeat(50));
  
  const articleId = 3774;
  const articlePrice = 5.00;
  
  try {
    // 1. Récupérer l'article
    console.log('📄 Récupération de l\'article...');
    const articleResponse = await wordpressClient.get(`/wp/v2/posts/${articleId}`);
    const article = articleResponse.data;
    console.log(`✅ Article trouvé: ${article.title.rendered}`);
    
    // 2. Configurer l'article comme premium
    console.log('\n🔧 Configuration de l\'article comme premium...');
    const configResponse = await wordpressClient.post('/helvetiforma/v1/update-article-acf', {
      post_id: articleId,
      access: 'premium',
      price: articlePrice
    });
    console.log('✅ Article configuré:', configResponse.data);
    
    // 3. Synchroniser avec WooCommerce
    console.log('\n🛒 Synchronisation avec WooCommerce...');
    const syncResponse = await wordpressClient.post('/helvetiforma/v1/sync-article', {
      post_id: articleId
    });
    console.log('✅ Synchronisation:', syncResponse.data);
    
    // 4. Vérifier que le produit a été créé
    console.log('\n🔍 Vérification du produit WooCommerce...');
    const productResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { sku: `article-${articleId}`, per_page: 1 }
    });
    
    if (productResponse.data && productResponse.data.length > 0) {
      const product = productResponse.data[0];
      console.log('✅ Produit WooCommerce créé:');
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Nom: ${product.name}`);
      console.log(`   - Prix: ${product.price} CHF`);
      console.log(`   - SKU: ${product.sku}`);
      console.log(`   - Statut: ${product.status}`);
      
      // 5. Mettre à jour les métadonnées de l'article
      console.log('\n📝 Mise à jour des métadonnées de l\'article...');
      const updateMetaResponse = await wordpressClient.post('/wp/v2/posts', {
        id: articleId,
        meta: {
          woocommerce_product_id: product.id
        }
      });
      console.log('✅ Métadonnées mises à jour');
      
    } else {
      console.log('❌ Produit WooCommerce non trouvé après synchronisation');
    }
    
    // 6. Tester la vérification d'achat
    console.log('\n🔐 Test de la vérification d\'achat...');
    try {
      const checkResponse = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
        params: { postId: articleId, userId: '193' }
      });
      console.log('✅ Vérification d\'achat:', checkResponse.data);
    } catch (error) {
      console.log('⚠️ Vérification d\'achat non disponible:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Synchronisation terminée !');
    console.log('L\'article est maintenant prêt pour les achats.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Vérifiez vos clés WooCommerce dans .env.local');
    }
  }
}

forceWooCommerceSync();
