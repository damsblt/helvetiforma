const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.WORDPRESS_URL || 'https://helvetiforma.ch';

const woocommerceClient = axios.create({
  baseURL: WORDPRESS_URL,
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET
  },
  headers: { 'Content-Type': 'application/json' },
});

async function simulatePurchase() {
  console.log('🛒 Simulation d\'un achat...');
  console.log('='.repeat(50));
  
  try {
    // Créer une commande WooCommerce de test
    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: 54, // ID de l'utilisateur
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
          product_id: 0, // Sera défini après création du produit
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
          value: '3774' // ID de l'article
        },
        {
          key: '_post_slug',
          value: 'test-test-test'
        }
      ]
    };

    // D'abord, créer un produit WooCommerce pour l'article 3774
    console.log('📦 Création du produit WooCommerce...');
    const productData = {
      name: 'Article Premium - Test Test Test',
      type: 'simple',
      regular_price: '1.00',
      sku: 'article-3774',
      status: 'publish',
      meta_data: [
        {
          key: '_post_id',
          value: '3774'
        }
      ]
    };

    const productResponse = await woocommerceClient.post('/wc/v3/products', productData);
    console.log('✅ Produit créé:', {
      id: productResponse.data.id,
      name: productResponse.data.name,
      sku: productResponse.data.sku
    });

    // Mettre à jour la commande avec l'ID du produit
    orderData.line_items[0].product_id = productResponse.data.id;

    // Créer la commande
    console.log('📋 Création de la commande...');
    const orderResponse = await woocommerceClient.post('/wc/v3/orders', orderData);
    console.log('✅ Commande créée:', {
      id: orderResponse.data.id,
      status: orderResponse.data.status,
      customer_id: orderResponse.data.customer_id
    });

    console.log('\n🎉 Achat simulé avec succès !');
    console.log('📋 Détails:');
    console.log(`- Utilisateur ID: 54`);
    console.log(`- Article ID: 3774`);
    console.log(`- Produit WooCommerce ID: ${productResponse.data.id}`);
    console.log(`- Commande ID: ${orderResponse.data.id}`);
    console.log(`- Montant: 1.00 CHF`);
    console.log(`- Statut: ${orderResponse.data.status}`);

    console.log('\n🧪 Test de vérification:');
    console.log('Allez sur: http://localhost:3000/posts/test-test-test?payment=success');
    console.log('Connectez-vous avec l\'utilisateur ID 54');
    console.log('L\'article devrait maintenant être débloqué !');

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error.response?.data || error.message);
  }
}

simulatePurchase();
