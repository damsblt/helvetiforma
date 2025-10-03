// Script de test pour vérifier le système de paiement complet
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

async function testPaymentSystem() {
  try {
    console.log('🔍 Test du système de paiement HelvetiForma...\n');
    
    // 1. Test de la connexion Stripe
    console.log('1️⃣ Test de la connexion Stripe...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connexion réussie - Compte:', account.email);
    
    // 2. Test de création d'une session de paiement
    console.log('\n2️⃣ Test de création d\'une session de paiement...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Article Premium Test',
              description: 'Test d\'article premium HelvetiForma',
            },
            unit_amount: 500, // 5 CHF
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/posts/test-2?payment=success',
      cancel_url: 'http://localhost:3000/posts/test-2?payment=cancelled',
      customer_email: 'test@helvetiforma.ch',
      metadata: {
        postId: 'test-post-id',
        userId: 'test-user-id',
        postTitle: 'Article Premium Test',
      },
    });
    
    console.log('✅ Session de paiement créée:', session.id);
    console.log('🔗 URL de paiement:', session.url);
    
    // 3. Test de récupération de la session
    console.log('\n3️⃣ Test de récupération de la session...');
    const retrievedSession = await stripe.checkout.sessions.retrieve(session.id);
    console.log('✅ Session récupérée:', retrievedSession.id);
    console.log('💰 Montant:', (retrievedSession.amount_total / 100) + ' ' + retrievedSession.currency.toUpperCase());
    console.log('📧 Email client:', retrievedSession.customer_email);
    
    // 4. Test des métadonnées
    console.log('\n4️⃣ Test des métadonnées...');
    console.log('📄 Post ID:', retrievedSession.metadata.postId);
    console.log('👤 User ID:', retrievedSession.metadata.userId);
    console.log('📝 Post Title:', retrievedSession.metadata.postTitle);
    
    console.log('\n🎉 Système de paiement validé!');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Créez le fichier .env.local avec vos clés');
    console.log('2. Démarrez le serveur: npm run dev');
    console.log('3. Allez sur http://localhost:3000/posts/test-2');
    console.log('4. Connectez-vous et testez le bouton de paiement');
    console.log('5. Utilisez la carte test: 4242 4242 4242 4242');
    
    console.log('\n🔧 Configuration webhook:');
    console.log('URL: http://localhost:3000/api/payment/webhook');
    console.log('Événements: checkout.session.completed');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testPaymentSystem();
