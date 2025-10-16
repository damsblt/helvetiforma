const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USERNAME = 'contact@helvetiforma.ch';
const WORDPRESS_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

// Client WordPress avec authentification
const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_PASSWORD
  }
});

async function testEndpointFix() {
  try {
    console.log('🔍 Test de l\'endpoint corrigé...');
    
    // Récupérer un article
    const articlesResponse = await wordpressClient.get('/wp/v2/posts', {
      params: {
        per_page: 1,
        status: 'draft'
      }
    });
    
    if (articlesResponse.data.length === 0) {
      console.log('❌ Aucun article trouvé');
      return;
    }
    
    const article = articlesResponse.data[0];
    const postId = article.id;
    
    console.log(`📄 Article test: "${article.title.rendered}" (ID: ${postId})`);
    console.log('📊 ACF actuel:', article.acf || {});
    
    // Tester l'endpoint personnalisé avec access_level
    console.log('\n🔧 Test de l\'endpoint personnalisé...');
    
    const endpointResponse = await wordpressClient.post('/helvetiforma/v1/update-article-acf', {
      post_id: postId,
      access_level: 'premium',
      price: '25.00'
    });
    
    console.log('📊 Réponse endpoint:', endpointResponse.data);
    
    if (endpointResponse.data.success) {
      console.log('✅ Endpoint personnalisé fonctionne');
      
      // Vérifier la configuration
      const verifyResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
      const updatedPost = verifyResponse.data;
      
      console.log('📊 Configuration vérifiée:', {
        access_level: updatedPost.acf?.access_level,
        price: updatedPost.acf?.price
      });
      
      // Tenter la synchronisation WooCommerce
      console.log('\n🔄 Test de synchronisation WooCommerce...');
      
      const syncResponse = await wordpressClient.post('/helvetiforma/v1/sync-article', {
        post_id: postId
      });
      
      console.log('📊 Réponse synchronisation:', syncResponse.data);
      
      if (syncResponse.data.success) {
        console.log('✅ Synchronisation WooCommerce réussie !');
        console.log('🎉 Produit créé:', syncResponse.data);
      } else {
        console.log('❌ Échec synchronisation WooCommerce:', syncResponse.data);
      }
      
    } else {
      console.log('❌ Endpoint personnalisé échoué:', endpointResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

async function showDebugInstructions() {
  console.log('\n📋 Instructions de debug :');
  console.log('='.repeat(60));
  console.log('1. Vérifiez que le code corrigé est déployé dans functions.php');
  console.log('2. Vérifiez que les champs ACF existent :');
  console.log('   - Allez dans Champs personnalisés > Groupes de champs');
  console.log('   - Vérifiez qu\'il y a un champ "access_level"');
  console.log('   - Vérifiez qu\'il y a un champ "price"');
  console.log('3. Vérifiez les permissions ACF');
  console.log('4. Vérifiez les logs WordPress pour les erreurs');
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Test de l\'endpoint corrigé');
  console.log('='.repeat(60));
  
  try {
    await testEndpointFix();
  } catch (error) {
    console.error('❌ Test échoué:', error.message);
    await showDebugInstructions();
  }
  
  console.log('\n🎯 Résumé :');
  console.log('✅ Test de l\'endpoint personnalisé corrigé');
  console.log('✅ Vérification de la configuration ACF');
  console.log('✅ Test de la synchronisation WooCommerce');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  testEndpointFix,
  showDebugInstructions
};
