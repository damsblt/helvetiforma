const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const PREMIUM_POST_ID = '040b76b6-4718-4b2c-a11f-c6277c9f937c';
const TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User'
};

async function testPaymentFlow() {
  console.log('🧪 Test du flux de paiement complet');
  console.log('=====================================\n');

  try {
    // 1. Test de l'article premium
    console.log('1️⃣ Test de l\'article premium...');
    const articleResponse = await fetch(`${BASE_URL}/posts/test-2`);
    if (articleResponse.ok) {
      console.log('✅ Article premium accessible');
    } else {
      console.log('❌ Erreur article premium:', articleResponse.status);
    }

    // 2. Test de la page de checkout
    console.log('\n2️⃣ Test de la page de checkout...');
    const checkoutResponse = await fetch(`${BASE_URL}/checkout/${PREMIUM_POST_ID}`);
    if (checkoutResponse.ok) {
      console.log('✅ Page de checkout accessible');
    } else {
      console.log('❌ Erreur page checkout:', checkoutResponse.status);
    }

    // 3. Test de l'API de paiement
    console.log('\n3️⃣ Test de l\'API de paiement...');
    const paymentResponse = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: PREMIUM_POST_ID,
        user: TEST_USER
      })
    });

    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ API de paiement fonctionne');
      console.log(`   Session ID: ${paymentData.sessionId}`);
      console.log(`   URL Stripe: ${paymentData.url.substring(0, 50)}...`);
    } else {
      const error = await paymentResponse.text();
      console.log('❌ Erreur API paiement:', error);
    }

    // 4. Test de l'API d'enregistrement d'achat
    console.log('\n4️⃣ Test de l\'API d\'enregistrement d\'achat...');
    const recordResponse = await fetch(`${BASE_URL}/api/payment/record-purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER.id,
        postId: PREMIUM_POST_ID,
        postTitle: 'test 2',
        amount: 500, // 5 CHF en centimes
        stripeSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123'
      })
    });

    if (recordResponse.ok) {
      console.log('✅ API d\'enregistrement d\'achat fonctionne');
    } else {
      const error = await recordResponse.text();
      console.log('❌ Erreur enregistrement achat:', error);
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Instructions pour tester manuellement:');
    console.log(`1. Ouvrez ${BASE_URL}/posts/test-2`);
    console.log('2. Cliquez sur "Acheter pour 5 CHF"');
    console.log('3. Sur la page de checkout, connectez-vous si nécessaire');
    console.log('4. Cliquez sur "Acheter l\'article"');
    console.log('5. Vous serez redirigé vers Stripe Checkout');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testPaymentFlow();
