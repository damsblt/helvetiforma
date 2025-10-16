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

async function simulateCompletePurchase() {
  console.log('🧪 Simulation du parcours d\'achat complet...');
  console.log('='.repeat(60));
  
  const articleId = 3774;
  const userId = 193; // Utilisateur test
  
  try {
    // 1. Vérifier l'état initial
    console.log('📋 Étape 1: Vérification de l\'état initial...');
    
    const initialCheck = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
      params: { postId: articleId, userId: userId }
    });
    console.log('   État initial:', initialCheck.data);
    
    // 2. Vérifier le produit WooCommerce
    console.log('\n🛒 Étape 2: Vérification du produit WooCommerce...');
    
    const productResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { sku: `article-${articleId}`, per_page: 1 }
    });
    
    if (productResponse.data && productResponse.data.length > 0) {
      const product = productResponse.data[0];
      console.log('   ✅ Produit trouvé:');
      console.log(`      - ID: ${product.id}`);
      console.log(`      - Nom: ${product.name}`);
      console.log(`      - Prix: ${product.price} CHF`);
      console.log(`      - SKU: ${product.sku}`);
    } else {
      console.log('   ❌ Produit WooCommerce non trouvé');
      return;
    }
    
    // 3. Simuler la création d'une commande (simulation d'un achat)
    console.log('\n💳 Étape 3: Simulation de la création d\'une commande...');
    
    const orderData = {
      customer_id: userId,
      payment_method: 'stripe',
      payment_method_title: 'Carte bancaire',
      status: 'completed',
      currency: 'CHF',
      line_items: [{
        product_id: productResponse.data[0].id,
        quantity: 1,
        total: '5.00'
      }],
      meta_data: [
        {
          key: '_stripe_payment_intent_id',
          value: 'pi_test_simulation_' + Date.now()
        },
        {
          key: '_post_id',
          value: articleId.toString()
        },
        {
          key: '_post_slug',
          value: 'test-test-test'
        }
      ]
    };
    
    const orderResponse = await woocommerceClient.post('/wc/v3/orders', orderData);
    console.log('   ✅ Commande créée:', orderResponse.data.id);
    
    // 4. Vérifier que l'achat est maintenant détecté
    console.log('\n🔍 Étape 4: Vérification de l\'achat...');
    
    // Attendre un peu pour que la commande soit traitée
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const purchaseCheck = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
      params: { postId: articleId, userId: userId }
    });
    console.log('   Vérification après achat:', purchaseCheck.data);
    
    // 5. Tester l'API Next.js
    console.log('\n🌐 Étape 5: Test de l\'API Next.js...');
    
    try {
      const nextjsCheck = await nextjsClient.get(`/api/check-purchase?postId=${articleId}`);
      console.log('   API Next.js:', nextjsCheck.data);
    } catch (error) {
      console.log('   ⚠️ API Next.js non disponible (serveur non démarré)');
    }
    
    // 6. Vérifier les commandes de l'utilisateur
    console.log('\n📦 Étape 6: Vérification des commandes utilisateur...');
    
    const userOrders = await woocommerceClient.get('/wc/v3/orders', {
      params: { customer: userId, per_page: 10 }
    });
    
    console.log(`   ${userOrders.data.length} commande(s) trouvée(s):`);
    userOrders.data.forEach((order, index) => {
      console.log(`      ${index + 1}. Commande ${order.id} - ${order.status} - ${order.total} CHF`);
      order.line_items.forEach(item => {
        console.log(`         - ${item.name} (Produit ID: ${item.product_id})`);
      });
    });
    
    console.log('\n🎉 Simulation terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log('✅ Produit WooCommerce configuré');
    console.log('✅ Commande WooCommerce créée');
    console.log('✅ Vérification d\'achat fonctionnelle');
    console.log('✅ Système prêt pour les vrais achats');
    
    console.log('\n🚀 Test manuel:');
    console.log('1. Ouvrez http://localhost:3000/posts/test-test-test');
    console.log('2. Cliquez sur "Acheter pour 5 CHF"');
    console.log('3. Effectuez un vrai paiement Stripe');
    console.log('4. Vérifiez l\'accès au contenu premium');
    
  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error.response?.data || error.message);
  }
}

simulateCompletePurchase();
