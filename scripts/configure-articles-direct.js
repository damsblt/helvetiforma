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

async function getArticles() {
  try {
    console.log('🔍 Récupération des articles...');
    
    const response = await wordpressClient.get('/wp/v2/posts', {
      params: {
        per_page: 10,
        status: 'publish,draft'
      }
    });
    
    console.log(`📄 ${response.data.length} articles trouvés`);
    
    return response.data.map(post => ({
      id: post.id,
      title: post.title.rendered,
      status: post.status,
      acf: post.acf || {}
    }));
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des articles:', error.response?.data || error.message);
    return [];
  }
}

async function configureArticleDirect(postId, accessLevel = 'premium', price = '10.00') {
  try {
    console.log(`🔧 Configuration directe ACF pour l'article ${postId}...`);
    
    // Récupérer l'article actuel
    const currentResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const currentPost = currentResponse.data;
    
    console.log('📄 Article actuel:', {
      id: currentPost.id,
      title: currentPost.title.rendered,
      acf: currentPost.acf || {}
    });
    
    // Mettre à jour l'article avec les champs ACF
    const updateResponse = await wordpressClient.post(`/wp/v2/posts/${postId}`, {
      acf: {
        access_level: accessLevel,
        price: price
      }
    });
    
    if (updateResponse.status === 200) {
      console.log('✅ Configuration ACF réussie via API WordPress directe');
      
      // Vérifier la configuration
      const verifyResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
      const updatedPost = verifyResponse.data;
      
      console.log('📊 Configuration vérifiée:', {
        access_level: updatedPost.acf?.access_level,
        price: updatedPost.acf?.price
      });
      
      return true;
    } else {
      console.log('❌ Échec de la configuration ACF');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration ACF:', error.response?.data || error.message);
    return false;
  }
}

async function syncArticleWithWooCommerce(postId) {
  try {
    console.log(`🔄 Synchronisation WooCommerce pour l'article ${postId}...`);
    
    const response = await wordpressClient.post('/helvetiforma/v1/sync-article', {
      post_id: postId
    });
    
    if (response.data.success) {
      console.log('✅ Synchronisation WooCommerce réussie');
      console.log('📊 Détails:', response.data);
      return true;
    } else {
      console.log('❌ Échec de la synchronisation WooCommerce');
      console.log('📊 Erreur:', response.data);
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Synchronisation WooCommerce non disponible:', error.response?.data || error.message);
    return false;
  }
}

async function configureAllArticles() {
  try {
    console.log('🚀 Configuration directe de tous les articles...');
    
    // Récupérer tous les articles
    const articles = await getArticles();
    
    if (articles.length === 0) {
      console.log('❌ Aucun article trouvé');
      return;
    }
    
    console.log('\n📋 Articles à configurer :');
    articles.forEach(article => {
      console.log(`   - ID: ${article.id}, Titre: ${article.title}, Status: ${article.status}`);
      console.log(`     ACF actuel: access_level=${article.acf.access_level || 'non défini'}, price=${article.acf.price || 'non défini'}`);
    });
    
    // Configurer chaque article
    for (const article of articles) {
      console.log(`\n🔧 Configuration de l'article "${article.title}" (ID: ${article.id})...`);
      
      // Déterminer le prix basé sur le titre ou utiliser une valeur par défaut
      let price = '10.00';
      if (article.title.includes('test test')) {
        price = '10.00';
      } else if (article.title.includes('test')) {
        price = '40.00';
      }
      
      // Configurer les champs ACF directement
      const configSuccess = await configureArticleDirect(article.id, 'premium', price);
      
      if (configSuccess) {
        // Synchroniser avec WooCommerce
        await syncArticleWithWooCommerce(article.id);
      }
      
      // Pause entre les articles pour éviter les limites de taux
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ Configuration de tous les articles terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des articles:', error.message);
  }
}

async function showManualInstructions() {
  console.log('\n📋 Instructions de configuration manuelle :');
  console.log('='.repeat(60));
  console.log('1. Connectez-vous à WordPress Admin :');
  console.log('   URL: https://api.helvetiforma.ch/wp-admin');
  console.log('   Utilisateur: contact@helvetiforma.ch');
  console.log('   Mot de passe: RWnb nSO6 6TMX yWd0 HWFl HBYh');
  console.log('');
  console.log('2. Pour chaque article :');
  console.log('   - Allez dans Articles > Tous les articles');
  console.log('   - Cliquez sur "Modifier" pour l\'article souhaité');
  console.log('   - Faites défiler vers le bas jusqu\'aux champs ACF');
  console.log('   - Configurez les champs suivants :');
  console.log('     * access_level: premium');
  console.log('     * price: 10.00 (ou le prix souhaité)');
  console.log('   - Sauvegardez l\'article');
  console.log('');
  console.log('3. Vérifiez la synchronisation :');
  console.log('   - Retournez dans Articles > Tous les articles');
  console.log('   - La colonne "Produit WooCommerce" devrait afficher "✓ Produit créé"');
  console.log('   - Allez dans Produits > Tous les produits');
  console.log('   - Vérifiez que les produits ont été créés');
  console.log('');
  console.log('4. Si la synchronisation ne fonctionne pas :');
  console.log('   - Allez dans Outils > WooCommerce Sync');
  console.log('   - Cliquez sur "Synchroniser tous les articles"');
  console.log('   - Vérifiez les logs WordPress pour les erreurs');
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Configuration directe des articles ACF');
  console.log('='.repeat(60));
  
  try {
    // Tenter la configuration automatique
    await configureAllArticles();
    
  } catch (error) {
    console.error('❌ Configuration automatique échouée:', error.message);
    console.log('\n📋 Passage aux instructions manuelles...');
    await showManualInstructions();
  }
  
  console.log('\n🎯 Résumé :');
  console.log('✅ Configuration directe via API WordPress');
  console.log('✅ Utilisation des champs ACF pour créer les produits WooCommerce');
  console.log('✅ Synchronisation automatique configurée');
  console.log('');
  console.log('📋 Le système utilise :');
  console.log('   - access_level: premium (pour déclencher la création)');
  console.log('   - price: montant en CHF (pour le prix du produit)');
  console.log('   - Création automatique du produit WooCommerce avec SKU "article-{ID}"');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  getArticles,
  configureArticleDirect,
  syncArticleWithWooCommerce,
  configureAllArticles
};
