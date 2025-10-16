const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

const woocommerceClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wc/v3`,
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET
  },
  headers: { 'Content-Type': 'application/json' },
});

async function createOrderFor3774() {
  console.log('🛒 Création d\'une commande pour l\'article 3774...');
  console.log('='.repeat(60));
  
  try {
    // Le produit existe déjà (ID 3777)
    const productId = 3777;
    
    // Créer une commande pour l'utilisateur 54
    console.log('📋 Création de la commande...');
    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: true,
      status: 'completed',
      customer_id: 54,
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
          total: '5.00'
        }
      ],
      meta_data: [
        {
          key: '_stripe_payment_intent_id',
          value: 'pi_test_' + Date.now()
        },
        {
          key: '_post_id',
          value: '3774'
        },
        {
          key: '_post_slug',
          value: 'test-test-test'
        }
      ]
    };
    
    const orderResponse = await woocommerceClient.post('/orders', orderData);
    const orderId = orderResponse.data.id;
    console.log('✅ Commande créée:', {
      id: orderId,
      status: orderResponse.data.status,
      customer_id: orderResponse.data.customer_id,
      total: orderResponse.data.total
    });
    
    // Vérifier la commande
    console.log('\n🔍 Vérification de la commande...');
    const orderDetails = await woocommerceClient.get(`/orders/${orderId}`);
    console.log('📋 Détails de la commande:', {
      id: orderDetails.data.id,
      status: orderDetails.data.status,
      customer_id: orderDetails.data.customer_id,
      line_items: orderDetails.data.line_items.map(item => ({
        name: item.name,
        sku: item.sku,
        total: item.total
      }))
    });
    
    console.log('\n🎉 Commande créée avec succès !');
    console.log('📋 Détails:');
    console.log(`- Utilisateur ID: 54`);
    console.log(`- Article ID: 3774`);
    console.log(`- Produit WooCommerce ID: ${productId}`);
    console.log(`- Commande ID: ${orderId}`);
    console.log(`- Montant: 5.00 CHF`);
    console.log(`- Statut: ${orderResponse.data.status}`);
    
    console.log('\n🧪 Test de vérification:');
    console.log('Allez sur: http://localhost:3000/posts/test-test-test?payment=success');
    console.log('Connectez-vous avec l\'utilisateur ID 54');
    console.log('L\'article devrait maintenant être débloqué !');
    
    console.log('\n🔧 Pour tester l\'API:');
    console.log(`curl "http://localhost:3000/api/check-purchase?postId=3774&userId=54"`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error.response?.data || error.message);
  }
}

createOrderFor3774();
