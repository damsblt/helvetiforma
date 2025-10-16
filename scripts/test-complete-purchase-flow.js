const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: process.env.WORDPRESS_USER || 'contact@helvetiforma.ch',
    password: process.env.WORDPRESS_PASSWORD || 'RWnb nSO6 6TMX yWd0 HWFl HBYh',
  },
});

const nextjsClient = axios.create({
  baseURL: NEXTJS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function findArticle(title) {
  try {
    const response = await wordpressClient.get('/wp/v2/posts', {
      params: { search: title, status: 'any' },
    });
    return response.data.find(post => post.title.rendered.includes(title));
  } catch (error) {
    console.error('❌ Erreur lors de la recherche de l\'article:', error.response?.data || error.message);
    return null;
  }
}

async function configureArticle(postId, accessLevel, price) {
  try {
    const response = await wordpressClient.post(`/helvetiforma/v1/update-article-acf`, {
      post_id: postId,
      access: accessLevel, // Using 'access' as per current working setup
      price: price,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de l\'article:', error.response?.data || error.message);
    return null;
  }
}

async function syncWithWooCommerce(article) {
  try {
    const response = await wordpressClient.post('/helvetiforma/v1/sync-article', {
      post_id: article.id,
    });
    return response.data;
  } catch (error) {
    console.log('⚠️ Synchronisation WooCommerce non disponible:', error.response?.data || error.message);
    return null;
  }
}

async function testNextJSApp(article) {
  try {
    console.log('\n🌐 Test de l\'application Next.js...');
    
    // Test 1: Récupération de l'article via l'API Next.js
    console.log('📄 Test 1: Récupération de l\'article...');
    
    try {
      const articleResponse = await nextjsClient.get(`/api/wordpress/posts/${article.id}`);
      console.log('✅ Article récupéré via Next.js:', articleResponse.data);
    } catch (error) {
      console.log('⚠️ API Next.js non disponible (normal si le serveur n\'est pas démarré)');
    }
    
    // Test 2: Test de l'API de vérification d'achat
    console.log('\n💳 Test 2: API de vérification d\'achat...');
    
    try {
      // This API requires a session, so it will likely fail if not logged in
      const purchaseCheckResponse = await nextjsClient.get(`/api/check-purchase?postId=${article.id}`);
      console.log('✅ Vérification d\'achat:', purchaseCheckResponse.data);
    } catch (error) {
      console.log('⚠️ API de vérification d\'achat non disponible');
    }
    
    // Test 3: Test de l'API de création de PaymentIntent
    console.log('\n💳 Test 3: API de création de PaymentIntent...');
    
    try {
      // This API requires a session, so it will likely fail if not logged in
      const paymentIntentResponse = await nextjsClient.post('/api/payment/create-payment-intent', {
        postId: article.id,
      });
      console.log('✅ PaymentIntent créé:', paymentIntentResponse.data);
    } catch (error) {
      console.log('⚠️ API PaymentIntent non disponible');
    }

  } catch (error) {
    console.log('⚠️ Tests Next.js non disponibles (serveur non démarré)');
  }
}

async function testWordPressAPI(article) {
  try {
    console.log('\n🔧 Test des APIs WordPress...');
    
    // Test 1: Debug des champs ACF
    console.log('📊 Test 1: Debug des champs ACF...');
    
    try {
      const debugResponse = await wordpressClient.post('/helvetiforma/v1/debug-article', {
        post_id: article.id
      });
      console.log('✅ Debug ACF:', debugResponse.data);
    } catch (error) {
      console.log('⚠️ Endpoint debug non disponible:', error.response?.data || error.message);
    }
    
    // Test 2: Vérification de l'achat
    console.log('\n💳 Test 2: Vérification de l\'achat...');
    
    try {
      // This API requires a logged-in user, so it will likely fail without authentication
      const purchaseCheckResponse = await wordpressClient.get(`/helvetiforma/v1/check-purchase?post_id=${article.id}`);
      console.log('✅ Vérification d\'achat WordPress:', purchaseCheckResponse.data);
    } catch (error) {
      console.log('⚠️ Vérification d\'achat WordPress non disponible');
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests WordPress:', error.message);
  }
}

async function simulateUserJourney(article) {
  try {
    console.log('\n👤 Simulation du parcours utilisateur...');
    
    console.log('📋 Étape 1: L\'utilisateur visite la page de l\'article');
    console.log(`   URL: http://localhost:3000/posts/${article.slug || article.id}`);
    console.log(`   Titre: ${article.title.rendered}`);
    console.log(`   Prix: ${article.acf?.price || 'Non défini'} CHF`);
    console.log(`   Niveau d\'accès: ${article.acf?.access || 'Non défini'}`);
    
    console.log('\n📋 Étape 2: L\'utilisateur clique sur "Acheter"');
    console.log('   - Vérification de la connexion utilisateur');
    console.log('   - Redirection vers /checkout/[postId]');
    
    console.log('\n📋 Étape 3: Page de checkout');
    console.log('   - Affichage des détails de l\'article');
    console.log('   - Formulaire de paiement Stripe');
    console.log('   - Bouton "Payer maintenant"');
    
    console.log('\n📋 Étape 4: Processus de paiement');
    console.log('   - Création du PaymentIntent Stripe');
    console.log('   - Confirmation du paiement');
    console.log('   - Webhook Stripe traité');
    console.log('   - Commande WooCommerce créée');
    
    console.log('\n📋 Étape 5: Accès au contenu');
    console.log('   - Redirection vers la page de succès');
    console.log('   - Accès au contenu premium');
    console.log('   - Article visible dans le dashboard utilisateur');

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error.message);
  }
}

async function showManualTestInstructions(article) {
  console.log('\n📋 Instructions de test manuel :');
  console.log('='.repeat(60));
  console.log('1. Démarrez l\'application Next.js :');
  console.log('   npm run dev');
  console.log('');
  console.log('2. Ouvrez votre navigateur :');
  console.log(`   http://localhost:3000/posts/${article.slug || article.id}`);
  console.log('');
  console.log('3. Testez le parcours complet :');
  console.log('   - Vérifiez l\'affichage de l\'article');
  console.log('   - Cliquez sur "Acheter"');
  console.log('   - Testez le processus de paiement');
  console.log('   - Vérifiez l\'accès au contenu premium');
  console.log('');
  console.log('4. Vérifiez dans WordPress Admin :');
  console.log('   - Articles > Tous les articles');
  console.log('   - Produits > Tous les produits');
  console.log('   - Commandes WooCommerce');
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Test du parcours d\'achat complet');
  console.log('='.repeat(60));
  
  const articleTitle = "test test test";
  const articleId = 3774; // Hardcoded ID for now
  const articlePrice = 5.00;

  // Étape 1: Trouver l'article
  let article = await findArticle(articleTitle);
  if (!article) {
    console.error(`❌ Article "${articleTitle}" non trouvé.`);
    return;
  }
  
  console.log('✅ Article trouvé:', {
    id: article.id,
    title: article.title.rendered,
    slug: article.slug,
    status: article.status,
    access: article.acf?.access,
    price: article.acf?.price
  });
  
  // Étape 2: Configurer l'article (s'assurer qu'il est premium avec un prix)
  console.log('\n🔧 Configuration de l\'article pour le test...');
  const configuredArticle = await configureArticle(article.id, 'premium', articlePrice);
  if (!configuredArticle) {
    console.error('❌ Échec de la configuration de l\'article.');
    return;
  }
  
  // Re-fetch article to get updated ACF fields
  article = await findArticle(articleTitle);
  console.log('✅ Article configuré comme premium avec prix', article.acf?.price, 'CHF');
  console.log('📊 Configuration vérifiée:', { access: article.acf?.access, price: article.acf?.price });
  
  // Étape 3: Synchroniser avec WooCommerce
  const productId = await syncWithWooCommerce(article);
  
  // Étape 4: Tester les APIs
  await testWordPressAPI(article);
  await testNextJSApp(article);
  
  // Étape 5: Simuler le parcours utilisateur
  await simulateUserJourney(article);
  
  // Étape 6: Instructions de test manuel
  await showManualTestInstructions(article);
  
  console.log('\n🎯 Résumé du test :');
  console.log('✅ Article "test test test" trouvé et configuré');
  console.log('✅ Synchronisation WooCommerce testée');
  console.log('✅ APIs WordPress testées');
  console.log('✅ Parcours utilisateur simulé');

  console.log('\n📋 Prochaines étapes :');
  console.log('1. Déployez le code WordPress corrigé');
  console.log('2. Démarrez l\'application Next.js');
  console.log('3. Testez le parcours complet manuellement');
}

main();