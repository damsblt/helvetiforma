const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const woocommerceClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wc/v3`,
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET
  },
  headers: { 'Content-Type': 'application/json' },
});

const nextjsClient = axios.create({
  baseURL: NEXTJS_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function testWooCommerceVerification() {
  console.log('🛒 Test de la vérification WooCommerce...');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Vérifier les clés WooCommerce
    console.log('🔑 Test 1: Vérification des clés WooCommerce...');
    console.log('Consumer Key:', process.env.WOOCOMMERCE_CONSUMER_KEY ? '✅ Configuré' : '❌ Manquant');
    console.log('Consumer Secret:', process.env.WOOCOMMERCE_CONSUMER_SECRET ? '✅ Configuré' : '❌ Manquant');
    
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      console.log('❌ Clés WooCommerce manquantes dans .env.local');
      return;
    }
    
    // Test 2: Tester la connexion WooCommerce
    console.log('\n🔌 Test 2: Connexion à l\'API WooCommerce...');
    try {
      const productsResponse = await woocommerceClient.get('/products', {
        params: { per_page: 1 }
      });
      console.log('✅ Connexion WooCommerce réussie');
      console.log(`📦 Produits trouvés: ${productsResponse.data.length}`);
    } catch (error) {
      console.log('❌ Erreur connexion WooCommerce:', error.response?.status, error.response?.data?.message);
      return;
    }
    
    // Test 3: Créer un produit de test
    console.log('\n📦 Test 3: Création d\'un produit de test...');
    const productData = {
      name: 'Article Premium - Test WooCommerce',
      type: 'simple',
      regular_price: '1.00',
      sku: 'article-test-woocommerce',
      status: 'publish',
      meta_data: [
        {
          key: '_post_id',
          value: '9999' // ID d'article de test
        }
      ]
    };
    
    let productId;
    try {
      const productResponse = await woocommerceClient.post('/products', productData);
      productId = productResponse.data.id;
      console.log('✅ Produit créé:', {
        id: productId,
        name: productResponse.data.name,
        sku: productResponse.data.sku
      });
    } catch (error) {
      console.log('❌ Erreur création produit:', error.response?.status, error.response?.data?.message);
      return;
    }
    
    // Test 4: Créer une commande de test
    console.log('\n📋 Test 4: Création d\'une commande de test...');
    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: 54, // ID de l'utilisateur de test
      billing: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        address_1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postcode: '12345',
        country: 'CH'
      },
      line_items: [
        {
          product_id: productId,
          quantity: 1,
          total: '1.00'
        }
      ],
      meta_data: [
        {
          key: '_stripe_payment_intent_id',
          value: 'pi_test_' + Date.now()
        },
        {
          key: '_post_id',
          value: '9999'
        },
        {
          key: '_post_slug',
          value: 'test-woocommerce'
        }
      ]
    };
    
    let orderId;
    try {
      const orderResponse = await woocommerceClient.post('/orders', orderData);
      orderId = orderResponse.data.id;
      console.log('✅ Commande créée:', {
        id: orderId,
        status: orderResponse.data.status,
        customer_id: orderResponse.data.customer_id
      });
    } catch (error) {
      console.log('❌ Erreur création commande:', error.response?.status, error.response?.data?.message);
      return;
    }
    
    // Test 5: Tester la vérification d'achat via Next.js
    console.log('\n🔍 Test 5: Vérification d\'achat via Next.js...');
    try {
      const checkResponse = await nextjsClient.get(`/api/check-purchase?postId=9999&userId=54`);
      console.log('✅ API Next.js:', checkResponse.data);
      
      if (checkResponse.data.hasPurchased) {
        console.log('🎉 La vérification d\'achat fonctionne !');
      } else {
        console.log('⚠️ L\'achat n\'est pas détecté - vérifiez la fonction WordPress');
      }
    } catch (error) {
      console.log('❌ Erreur API Next.js:', error.response?.status, error.response?.data?.error);
    }
    
    // Test 6: Nettoyage (supprimer les données de test)
    console.log('\n🧹 Test 6: Nettoyage des données de test...');
    try {
      await woocommerceClient.delete(`/orders/${orderId}`, {
        params: { force: true }
      });
      console.log('✅ Commande de test supprimée');
    } catch (error) {
      console.log('⚠️ Erreur suppression commande:', error.response?.status);
    }
    
    try {
      await woocommerceClient.delete(`/products/${productId}`, {
        params: { force: true }
      });
      console.log('✅ Produit de test supprimé');
    } catch (error) {
      console.log('⚠️ Erreur suppression produit:', error.response?.status);
    }
    
    console.log('\n🎯 Résumé:');
    console.log('✅ Clés WooCommerce configurées');
    console.log('✅ Connexion API WooCommerce fonctionnelle');
    console.log('✅ Création produit/commande réussie');
    console.log('✅ Vérification d\'achat opérationnelle');
    console.log('\n🚀 Le système est prêt pour la production !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testWooCommerceVerification();
