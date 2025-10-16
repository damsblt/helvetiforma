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

async function createTestPurchase() {
  console.log('🛒 Création d\'un achat de test pour l\'article 3774...');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Créer un produit pour l'article 3774
    console.log('📦 Test 1: Création du produit pour l\'article 3774...');
    const productData = {
      name: 'Article Premium - Test Test Test',
      type: 'simple',
      regular_price: '5.00',
      sku: 'article-3774',
      status: 'publish',
      meta_data: [
        {
          key: '_post_id',
          value: '3774'
        },
        {
          key: '_helvetiforma_article',
          value: 'yes'
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
        sku: productResponse.data.sku,
        price: productResponse.data.price
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('SKU already exists')) {
        console.log('⚠️ Produit avec SKU article-3774 existe déjà, recherche...');
        const existingProducts = await woocommerceClient.get('/products', {
          params: { sku: 'article-3774' }
        });
        if (existingProducts.data.length > 0) {
          productId = existingProducts.data[0].id;
          console.log('✅ Produit existant trouvé:', {
            id: productId,
            name: existingProducts.data[0].name,
            sku: existingProducts.data[0].sku
          });
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    // Test 2: Créer une commande pour l'utilisateur 54
    console.log('\n📋 Test 2: Création de la commande...');
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
    
    // Test 3: Vérifier la commande
    console.log('\n🔍 Test 3: Vérification de la commande...');
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
    
    console.log('\n🎉 Achat de test créé avec succès !');
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
    console.error('❌ Erreur lors de la création de l\'achat:', error.response?.data || error.message);
  }
}

createTestPurchase();
