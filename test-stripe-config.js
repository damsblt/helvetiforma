// Script de test pour vérifier la configuration Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

async function testStripeConfig() {
  try {
    console.log('🔍 Test de la configuration Stripe...');
    
    // Test de la connexion à l'API Stripe
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connexion Stripe réussie!');
    console.log('📧 Email du compte:', account.email);
    console.log('🌍 Pays:', account.country);
    console.log('💰 Devise par défaut:', account.default_currency);
    
    // Test de création d'un produit
    const product = await stripe.products.create({
      name: 'Test Article Premium',
      description: 'Article de test pour HelvetiForma',
    });
    
    console.log('✅ Produit de test créé:', product.id);
    
    // Test de création d'un prix
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 500, // 5 CHF en centimes
      currency: 'chf',
    });
    
    console.log('✅ Prix de test créé:', price.id);
    console.log('💰 Prix:', (price.unit_amount / 100) + ' ' + price.currency.toUpperCase());
    
    // Nettoyage - suppression du produit de test
    await stripe.products.del(product.id);
    console.log('🧹 Produit de test supprimé');
    
    console.log('\n🎉 Configuration Stripe validée!');
    console.log('📋 Prochaines étapes:');
    console.log('1. Récupérez votre clé publique (pk_test_...) dans le Dashboard Stripe');
    console.log('2. Créez le fichier .env.local avec vos clés');
    console.log('3. Configurez le webhook pour /api/payment/webhook');
    
  } catch (error) {
    console.error('❌ Erreur de configuration Stripe:', error.message);
    console.log('\n🔧 Vérifiez:');
    console.log('- Que la clé secrète est correcte');
    console.log('- Que votre compte Stripe est actif');
    console.log('- Que vous êtes en mode test');
  }
}

testStripeConfig();
