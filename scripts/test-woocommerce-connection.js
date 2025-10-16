const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

async function testWooCommerceConnection() {
  console.log('🧪 Test de la connexion WooCommerce...');
  console.log('='.repeat(50));
  
  // Vérifier les variables d'environnement
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  
  console.log('🔑 Variables d\'environnement:');
  console.log(`   WOOCOMMERCE_CONSUMER_KEY: ${consumerKey ? '✅ Définie' : '❌ Manquante'}`);
  console.log(`   WOOCOMMERCE_CONSUMER_SECRET: ${consumerSecret ? '✅ Définie' : '❌ Manquante'}`);
  
  if (!consumerKey || !consumerSecret) {
    console.log('\n❌ Variables WooCommerce manquantes !');
    console.log('Exécutez d\'abord: node scripts/setup-woocommerce-env.js');
    console.log('Puis configurez les clés dans .env.local');
    return;
  }
  
  if (consumerKey === 'ck_your_consumer_key_here' || consumerSecret === 'cs_your_consumer_secret_here') {
    console.log('\n⚠️ Variables WooCommerce non configurées !');
    console.log('Remplacez les valeurs par défaut par vos vraies clés WooCommerce');
    return;
  }
  
  // Tester la connexion WooCommerce
  const woocommerceClient = axios.create({
    baseURL: `${WORDPRESS_URL}/wp-json`,
    headers: { 'Content-Type': 'application/json' },
    auth: {
      username: consumerKey,
      password: consumerSecret
    }
  });
  
  try {
    console.log('\n🔌 Test de connexion à l\'API WooCommerce...');
    
    // Test 1: Lister les produits
    console.log('📦 Test 1: Récupération des produits...');
    const productsResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { per_page: 5 }
    });
    
    console.log(`✅ ${productsResponse.data.length} produits trouvés`);
    productsResponse.data.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (ID: ${product.id}, SKU: ${product.sku})`);
    });
    
    // Test 2: Chercher le produit de l'article
    console.log('\n🔍 Test 2: Recherche du produit article-3774...');
    const articleProductResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { sku: 'article-3774', per_page: 1 }
    });
    
    if (articleProductResponse.data && articleProductResponse.data.length > 0) {
      const product = articleProductResponse.data[0];
      console.log('✅ Produit trouvé:');
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Nom: ${product.name}`);
      console.log(`   - Prix: ${product.price} CHF`);
      console.log(`   - SKU: ${product.sku}`);
      console.log(`   - Statut: ${product.status}`);
    } else {
      console.log('❌ Produit article-3774 non trouvé');
      console.log('💡 Le produit doit être créé via la synchronisation WordPress');
    }
    
    // Test 3: Lister les commandes
    console.log('\n📋 Test 3: Récupération des commandes...');
    const ordersResponse = await woocommerceClient.get('/wc/v3/orders', {
      params: { per_page: 5, status: 'completed' }
    });
    
    console.log(`✅ ${ordersResponse.data.length} commandes trouvées`);
    ordersResponse.data.forEach((order, index) => {
      console.log(`   ${index + 1}. Commande ${order.id} - ${order.status} - ${order.total} CHF`);
    });
    
    // Test 4: Tester l'endpoint de vérification d'achat
    console.log('\n🔐 Test 4: Test de l\'endpoint de vérification d\'achat...');
    try {
      const checkPurchaseResponse = await woocommerceClient.get('/helvetiforma/v1/check-purchase', {
        params: { postId: '3774', userId: '193' }
      });
      console.log('✅ Endpoint de vérification d\'achat fonctionne:', checkPurchaseResponse.data);
    } catch (error) {
      console.log('⚠️ Endpoint de vérification d\'achat non disponible:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Test de connexion WooCommerce réussi !');
    console.log('✅ L\'intégration WooCommerce est fonctionnelle');
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion WooCommerce:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solutions possibles:');
      console.log('1. Vérifiez que les clés WooCommerce sont correctes');
      console.log('2. Assurez-vous que l\'utilisateur a les bonnes permissions');
      console.log('3. Vérifiez que l\'API REST WooCommerce est activée');
    }
  }
}

testWooCommerceConnection();
