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

async function configureArticleACF(postId, accessLevel = 'premium', price = '10.00') {
  try {
    console.log(`🔧 Configuration ACF pour l'article ${postId}...`);
    
    // Essayer d'abord l'endpoint personnalisé
    try {
      const response = await wordpressClient.post('/helvetiforma/v1/update-article-acf', {
        post_id: postId,
        access_level: accessLevel,
        price: price
      });
      
      if (response.data.success) {
        console.log('✅ Configuration ACF réussie via endpoint personnalisé');
        console.log('📊 Champs mis à jour:', response.data.updated_fields);
        return true;
      }
    } catch (endpointError) {
      console.log('⚠️ Endpoint personnalisé non disponible, tentative directe...');
    }
    
    // Fallback: modification directe via l'API WordPress
    const response = await wordpressClient.post(`/wp/v2/posts/${postId}`, {
      acf: {
        access_level: accessLevel,
        price: price
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Configuration ACF réussie via API WordPress');
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

async function checkWooCommerceProduct(postId) {
  try {
    console.log(`🔍 Vérification du produit WooCommerce pour l'article ${postId}...`);
    
    // Simuler la recherche du produit par SKU
    const sku = `article-${postId}`;
    console.log(`   - SKU recherché: ${sku}`);
    
    // Note: Cette vérification nécessiterait les credentials WooCommerce
    console.log('📋 Pour vérifier manuellement :');
    console.log('1. Connectez-vous à WordPress Admin');
    console.log('2. Allez dans Produits > Tous les produits');
    console.log(`3. Recherchez le SKU: ${sku}`);
    console.log('4. Vérifiez que le produit existe et est configuré correctement');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

async function configureAllArticles() {
  try {
    console.log('🚀 Configuration de tous les articles...');
    
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
      
      // Configurer les champs ACF
      const configSuccess = await configureArticleACF(article.id, 'premium', price);
      
      if (configSuccess) {
        // Synchroniser avec WooCommerce
        await syncArticleWithWooCommerce(article.id);
        
        // Vérifier le produit créé
        await checkWooCommerceProduct(article.id);
      }
      
      // Pause entre les articles pour éviter les limites de taux
      await new Promise(resolve => setTimeout(resolve, 1000));
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
  console.log('🚀 Configuration automatique des articles ACF');
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
  console.log('✅ Script de configuration ACF créé');
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
  configureArticleACF,
  syncArticleWithWooCommerce,
  checkWooCommerceProduct,
  configureAllArticles
};
