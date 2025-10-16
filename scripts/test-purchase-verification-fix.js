const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'https://helvetiforma.ch';

const nextjsClient = axios.create({
  baseURL: NEXTJS_URL,
  headers: { 'Content-Type': 'application/json' },
});

const wordpressClient = axios.create({
  baseURL: WORDPRESS_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function testPurchaseVerificationFix() {
  console.log('🔧 Test de la correction de vérification d\'achat...');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Récupérer l'article "test test test"
    console.log('📄 Test 1: Récupération de l\'article...');
    const articleResponse = await wordpressClient.get('/wp/v2/posts', {
      params: {
        slug: 'test-test-test',
        per_page: 1
      }
    });
    
    if (articleResponse.data.length === 0) {
      console.log('❌ Article "test-test-test" non trouvé');
      return;
    }
    
    const article = articleResponse.data[0];
    console.log('✅ Article trouvé:', {
      id: article.id,
      title: article.title.rendered,
      slug: article.slug,
      accessLevel: article.acf?.access_level || article.acf?.access || 'public'
    });
    
    // Test 2: Vérifier l'API de vérification d'achat
    console.log('\n🔍 Test 2: API de vérification d\'achat...');
    try {
      const checkResponse = await nextjsClient.get(`/api/check-purchase?postId=${article.id}`);
      console.log('✅ API Check Purchase:', checkResponse.data);
    } catch (error) {
      console.log('⚠️ API Check Purchase:', error.response?.status, error.response?.data?.error);
    }
    
    // Test 3: Vérifier la fonction WordPress directement
    console.log('\n🔍 Test 3: Fonction WordPress check_user_purchase...');
    try {
      const wpResponse = await wordpressClient.get(`/helvetiforma/v1/check-purchase`, {
        params: {
          post_id: article.id,
          user_id: 54 // ID de l'utilisateur qui a acheté
        }
      });
      console.log('✅ Fonction WordPress:', wpResponse.data);
    } catch (error) {
      console.log('⚠️ Fonction WordPress:', error.response?.status, error.response?.data);
    }
    
    // Test 4: Vérifier les commandes WooCommerce
    console.log('\n🛒 Test 4: Commandes WooCommerce...');
    try {
      const ordersResponse = await wordpressClient.get('/wc/v3/orders', {
        params: {
          customer: 54,
          status: 'completed',
          per_page: 10
        },
        auth: {
          username: process.env.WOOCOMMERCE_CONSUMER_KEY,
          password: process.env.WOOCOMMERCE_CONSUMER_SECRET
        }
      });
      
      console.log('✅ Commandes WooCommerce trouvées:', ordersResponse.data.length);
      
      // Chercher les commandes contenant l'article
      const relevantOrders = ordersResponse.data.filter(order => 
        order.line_items.some(item => 
          item.sku === `article-${article.id}` || 
          item.meta_data?.some(meta => meta.key === '_post_id' && meta.value == article.id)
        )
      );
      
      console.log('📦 Commandes contenant l\'article:', relevantOrders.length);
      if (relevantOrders.length > 0) {
        console.log('✅ Détails de la commande:', {
          orderId: relevantOrders[0].id,
          status: relevantOrders[0].status,
          items: relevantOrders[0].line_items.map(item => ({
            name: item.name,
            sku: item.sku,
            total: item.total
          }))
        });
      }
    } catch (error) {
      console.log('⚠️ Erreur WooCommerce:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n📋 Instructions pour tester:');
    console.log('1. Allez sur: http://localhost:3000/posts/test-test-test?payment=success');
    console.log('2. Connectez-vous avec l\'utilisateur qui a acheté l\'article');
    console.log('3. L\'article devrait maintenant être débloqué');
    console.log('4. Vérifiez que le contenu premium s\'affiche correctement');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testPurchaseVerificationFix();
