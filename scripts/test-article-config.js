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
      
      // Tester la récupération via notre fonction getWordPressPostById
      await testGetWordPressPostById(postId);
      
    } else {
      console.log('❌ Article non configuré comme premium');
      console.log('\n📋 Configuration nécessaire :');
      console.log('   1. Connectez-vous à WordPress Admin');
      console.log('   2. Allez dans Articles > Tous les articles');
      console.log('   3. Trouvez l\'article "test new-new" (ID: 3736)');
      console.log('   4. Cliquez sur "Modifier"');
      console.log('   5. Dans les champs personnalisés ACF :');
      console.log('      - Access: premium');
      console.log('      - Price: 1.00');
      console.log('   6. Sauvegardez l\'article');
    }
    
    return {
      isConfigured: accessLevel === 'premium' && price && parseFloat(price) > 0,
      accessLevel,
      price
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    return null;
  }
}

async function testGetWordPressPostById(postId) {
  try {
    console.log('\n🔍 Test de la fonction getWordPressPostById...');
    
    // Simuler la logique de getWordPressPostById
    const response = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = response.data;
    
    // Déterminer le prix
    let price = 0;
    if (post.acf?.price) {
      price = parseFloat(post.acf.price);
    }
    
    const accessLevel = post.acf?.access_level || post.acf?.access || 'public';
    
    const result = {
      _id: post.id,
      title: post.title.rendered,
      accessLevel: accessLevel,
      price: price,
      acf: post.acf
    };
    
    console.log('📊 Résultat getWordPressPostById:', result);
    
    if (accessLevel === 'premium' && price > 0) {
      console.log('✅ Article correctement identifié comme premium avec prix');
      return result;
    } else {
      console.log('❌ Article non identifié comme premium ou sans prix');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erreur dans getWordPressPostById:', error.message);
    return null;
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
    } else {
      const errorData = await paymentResponse.json();
      console.log('❌ Erreur API create-payment-intent:', errorData);
    }
    
  } catch (error) {
    console.log('⚠️ Test de checkout non disponible (serveur Next.js non démarré)');
  }
}

async function main() {
  const postId = '3736';
  
  console.log('🚀 Test complet de la configuration de l\'article');
  console.log('='.repeat(60));
  
  // Test 1: Configuration de l'article
  const config = await testArticleConfiguration(postId);
  
  if (config && config.isConfigured) {
    // Test 2: Flux de checkout
    await testCheckoutFlow(postId);
  }
  
  console.log('\n🎯 Résumé :');
  if (config && config.isConfigured) {
    console.log('✅ Article correctement configuré - prêt pour le checkout');
  } else {
    console.log('❌ Article nécessite une configuration manuelle');
    console.log('   Suivez les instructions ci-dessus pour configurer l\'article');
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  testArticleConfiguration,
  testGetWordPressPostById,
  testCheckoutFlow
};
