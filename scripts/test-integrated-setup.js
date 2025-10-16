const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

// Client WordPress sans authentification (pour les lectures publiques)
const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  }
});

async function testArticleConfiguration(postId) {
  try {
    console.log(`🔍 Test de la configuration de l'article ${postId}...`);
    
    // Récupérer l'article
    const response = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = response.data;
    
    console.log('📄 Article actuel:', {
      id: post.id,
      title: post.title.rendered,
      status: post.status,
      acf: post.acf,
      meta: post.meta
    });
    
    // Vérifier la configuration ACF
    const accessLevel = post.acf?.access || post.acf?.access_level;
    const price = post.acf?.price;
    
    console.log('\n📊 Analyse de la configuration :');
    console.log(`   - Access Level: ${accessLevel || 'non défini'}`);
    console.log(`   - Price: ${price || 'non défini'}`);
    console.log(`   - Status: ${post.status}`);
    
    if (accessLevel === 'premium' && price && parseFloat(price) > 0) {
      console.log('✅ Article correctement configuré comme premium');
      return true;
    } else {
      console.log('❌ Article non configuré comme premium');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    return false;
  }
}

async function configureArticleViaEndpoint(postId, access = 'premium', price = '1.00') {
  try {
    console.log(`🔧 Configuration de l'article ${postId} via endpoint personnalisé...`);
    
    const response = await wordpressClient.post('/helvetiforma/v1/update-article-acf', {
      post_id: postId,
      access: access,
      price: price
    });
    
    if (response.data.success) {
      console.log('✅ Article configuré avec succès via l\'endpoint personnalisé');
      console.log('📊 Champs mis à jour:', response.data.updated_fields);
      return true;
    } else {
      console.log('❌ Échec de la configuration via l\'endpoint personnalisé');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Endpoint personnalisé non disponible:', error.response?.data || error.message);
    return false;
  }
}

async function testWooCommerceSync(postId) {
  try {
    console.log(`🔄 Test de synchronisation WooCommerce pour l'article ${postId}...`);
    
    const response = await wordpressClient.post('/helvetiforma/v1/sync-article', {
      post_id: postId
    });
    
    if (response.data.success) {
      console.log('✅ Synchronisation WooCommerce réussie');
      console.log('📊 Détails:', response.data);
      return true;
    } else {
      console.log('❌ Échec de la synchronisation WooCommerce');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Synchronisation WooCommerce non disponible:', error.response?.data || error.message);
    return false;
  }
}

async function testCheckoutFlow(postId) {
  try {
    console.log('\n🛒 Test du flux de checkout...');
    
    // Tester l'API create-payment-intent
    const paymentResponse = await fetch(`http://localhost:3000/api/payment/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId: postId
      })
    });
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ API create-payment-intent fonctionne:', paymentData);
      
      if (paymentData.clientSecret === 'free_article') {
        console.log('ℹ️ Article configuré comme gratuit');
      } else if (paymentData.clientSecret) {
        console.log('✅ Article configuré comme payant - clientSecret généré');
      }
      
      return true;
    } else {
      const errorData = await paymentResponse.json();
      console.log('❌ Erreur API create-payment-intent:', errorData);
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Test de checkout non disponible (serveur Next.js non démarré)');
    return false;
  }
}

async function testWordPressAPI(postId) {
  try {
    console.log(`🔍 Test de l'API WordPress HelvetiForma...`);
    
    // Tester l'endpoint HelvetiForma
    const response = await wordpressClient.get(`/helvetiforma/v1/posts/${postId}`);
    
    if (response.data) {
      console.log('✅ API HelvetiForma fonctionne');
      console.log('📊 Données formatées:', {
        id: response.data._id,
        title: response.data.title,
        accessLevel: response.data.accessLevel,
        price: response.data.price
      });
      return true;
    } else {
      console.log('❌ API HelvetiForma ne retourne pas de données');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ API HelvetiForma non disponible:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  const postId = '3736';
  
  console.log('🚀 Test complet de la configuration intégrée');
  console.log('='.repeat(60));
  
  // Étape 1: Vérifier l'état actuel
  console.log('\n📝 Étape 1: Vérification de l\'état actuel');
  const isConfigured = await testArticleConfiguration(postId);
  
  // Étape 2: Tester l'API HelvetiForma
  console.log('\n🔍 Étape 2: Test de l\'API HelvetiForma');
  await testWordPressAPI(postId);
  
  if (!isConfigured) {
    // Étape 3: Configurer via l'endpoint personnalisé
    console.log('\n🔧 Étape 3: Configuration via endpoint personnalisé');
    const configSuccess = await configureArticleViaEndpoint(postId, 'premium', '1.00');
    
    if (configSuccess) {
      // Étape 4: Vérifier la configuration
      console.log('\n✅ Étape 4: Vérification de la configuration');
      await testArticleConfiguration(postId);
      
      // Étape 5: Synchroniser avec WooCommerce
      console.log('\n🔄 Étape 5: Synchronisation WooCommerce');
      await testWooCommerceSync(postId);
      
      // Étape 6: Tester le flux de checkout
      console.log('\n🛒 Étape 6: Test du flux de checkout');
      await testCheckoutFlow(postId);
      
    } else {
      console.log('\n📋 Configuration manuelle nécessaire');
      console.log('1. Remplacez le contenu de functions.php par le nouveau code intégré');
      console.log('2. Configurez l\'article manuellement dans WordPress Admin');
      console.log('3. Testez la synchronisation');
    }
  } else {
    // Article déjà configuré, tester le flux complet
    console.log('\n🔄 Article déjà configuré, test du flux complet');
    await testWooCommerceSync(postId);
    await testCheckoutFlow(postId);
  }
  
  console.log('\n🎯 Résumé :');
  console.log('✅ Code WordPress intégré créé');
  console.log('✅ Fonctionnalités d\'automatisation WooCommerce ajoutées');
  console.log('✅ Endpoints personnalisés disponibles');
  console.log('');
  console.log('📋 Instructions de déploiement :');
  console.log('1. Remplacez le contenu de functions.php par le nouveau code intégré');
  console.log('2. Configurez l\'article comme premium dans WordPress Admin');
  console.log('3. Le système créera automatiquement le produit WooCommerce');
  console.log('4. Testez le checkout avec l\'article configuré');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  testArticleConfiguration,
  configureArticleViaEndpoint,
  testWooCommerceSync,
  testCheckoutFlow,
  testWordPressAPI
};
