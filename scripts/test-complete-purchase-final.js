const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

const nextjsClient = axios.create({
  baseURL: NEXTJS_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function testCompletePurchaseFinal() {
  console.log('🧪 Test final du parcours d\'achat complet...');
  console.log('='.repeat(60));
  
  const articleId = 3774;
  const userId = 193; // Utilisateur qui a acheté
  
  try {
    // 1. Vérifier l'état actuel
    console.log('📋 Étape 1: Vérification de l\'état actuel...');
    
    const productResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { sku: `article-${articleId}`, per_page: 1 }
    });
    
    if (productResponse.data && productResponse.data.length > 0) {
      const product = productResponse.data[0];
      console.log('✅ Produit WooCommerce trouvé:', {
        id: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku
      });
    }
    
    // 2. Vérifier les commandes de l'utilisateur
    console.log('\n📦 Étape 2: Vérification des commandes...');
    
    const ordersResponse = await woocommerceClient.get('/wc/v3/orders', {
      params: { customer: userId, per_page: 10 }
    });
    
    console.log(`   ${ordersResponse.data.length} commande(s) trouvée(s):`);
    let hasPurchased = false;
    ordersResponse.data.forEach((order, index) => {
      console.log(`   ${index + 1}. Commande ${order.id} - ${order.status} - ${order.total} CHF`);
      order.line_items.forEach(item => {
        console.log(`      - ${item.name} (Produit ID: ${item.product_id})`);
        if (item.product_id == productResponse.data[0].id) {
          hasPurchased = true;
          console.log(`      ✅ ACHAT CONFIRMÉ !`);
        }
      });
    });
    
    // 3. Test de l'API Next.js
    console.log('\n🌐 Étape 3: Test de l\'API Next.js...');
    
    try {
      const nextjsResponse = await nextjsClient.get(`/api/check-purchase?postId=${articleId}`);
      console.log('✅ API Next.js:', nextjsResponse.data);
    } catch (error) {
      console.log('⚠️ API Next.js non disponible (serveur non démarré)');
    }
    
    // 4. Test de l'API WordPress
    console.log('\n🔐 Étape 4: Test de l\'API WordPress...');
    
    try {
      const wpResponse = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
        params: { postId: articleId, userId: userId }
      });
      console.log('✅ API WordPress:', wpResponse.data);
    } catch (error) {
      console.log('❌ Erreur API WordPress:', error.response?.data || error.message);
    }
    
    // 5. Résumé final
    console.log('\n🎯 Résumé final:');
    console.log('='.repeat(40));
    console.log(`📄 Article ID: ${articleId}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🛒 Produit WooCommerce: ${productResponse.data[0].id}`);
    console.log(`📦 A acheté: ${hasPurchased ? 'OUI' : 'NON'}`);
    console.log(`🔐 Vérification WordPress: ${wpResponse?.data?.hasPurchased ? 'FONCTIONNE' : 'NE FONCTIONNE PAS'}`);
    
    if (hasPurchased) {
      console.log('\n✅ L\'utilisateur a bien acheté le produit !');
      console.log('✅ Le système de commandes WooCommerce fonctionne !');
      
      if (wpResponse?.data?.hasPurchased) {
        console.log('✅ La vérification d\'achat fonctionne !');
        console.log('\n🎉 PARCOURS D\'ACHAT COMPLET FONCTIONNEL !');
      } else {
        console.log('⚠️ La vérification d\'achat ne fonctionne pas encore');
        console.log('💡 Il faut mettre à jour le fichier functions.php sur le serveur');
      }
    } else {
      console.log('\n❌ L\'utilisateur n\'a pas acheté le produit');
    }
    
    console.log('\n📋 Instructions finales:');
    console.log('1. Copiez le contenu de wordpress-functions-integrated.php');
    console.log('2. Remplacez le contenu de functions.php sur le serveur WordPress');
    console.log('3. Testez à nouveau la vérification d\'achat');
    console.log('4. Le parcours d\'achat sera alors 100% fonctionnel !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testCompletePurchaseFinal();
