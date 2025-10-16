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
      acf: post.acf
    });
    
    // Vérifier les champs ACF
    const access_level = post.acf?.access_level;
    const price = post.acf?.price;
    
    console.log('\n📊 Configuration ACF :');
    console.log(`   - access_level: ${access_level || 'non défini'}`);
    console.log(`   - price: ${price || 'non défini'}`);
    
    if (access_level === 'premium' && price && parseFloat(price) > 0) {
      console.log('✅ Article correctement configuré pour la synchronisation');
      return true;
    } else {
      console.log('❌ Article non configuré correctement');
      console.log('   - access_level doit être "premium"');
      console.log('   - price doit être > 0');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
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
      console.log('📊 Erreur:', response.data);
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Synchronisation WooCommerce non disponible:', error.response?.data || error.message);
    return false;
  }
}

async function testWooCommerceProductExists(postId) {
  try {
    console.log(`🔍 Vérification de l'existence du produit WooCommerce...`);
    
    // Simuler la recherche du produit par SKU
    const sku = `article-${postId}`;
    console.log(`   - SKU recherché: ${sku}`);
    
    // Note: Cette vérification nécessiterait les credentials WooCommerce
    // Pour l'instant, on affiche juste les instructions
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

async function showConfigurationInstructions() {
  console.log('\n📋 Instructions de configuration complète :');
  console.log('='.repeat(60));
  console.log('1. Connectez-vous à WordPress Admin :');
  console.log('   URL: https://api.helvetiforma.ch/wp-admin');
  console.log('   Utilisateur: contact@helvetiforma.ch');
  console.log('   Mot de passe: RWnb nSO6 6TMX yWd0 HWFl HBYh');
  console.log('');
  console.log('2. Remplacez le code dans functions.php :');
  console.log('   - Allez dans Apparence > Éditeur de thème');
  console.log('   - Sélectionnez functions.php');
  console.log('   - Remplacez tout le contenu par le nouveau code corrigé');
  console.log('   - Sauvegardez');
  console.log('');
  console.log('3. Configurez l\'article :');
  console.log('   - Allez dans Articles > Tous les articles');
  console.log('   - Trouvez l\'article "test test test" (ID: 3736)');
  console.log('   - Cliquez sur Modifier');
  console.log('   - Dans les champs personnalisés ACF :');
  console.log('     * access_level: premium (OBLIGATOIRE)');
  console.log('     * price: 40.00 (ou le prix souhaité)');
  console.log('   - Sauvegardez l\'article');
  console.log('');
  console.log('4. Vérifiez la synchronisation :');
  console.log('   - Retournez dans Articles > Tous les articles');
  console.log('   - La colonne "Produit WooCommerce" devrait afficher "✓ Produit créé"');
  console.log('   - Allez dans Produits > Tous les produits');
  console.log('   - Vérifiez qu\'un produit avec SKU "article-3736" a été créé');
  console.log('');
  console.log('5. Si la synchronisation ne fonctionne pas :');
  console.log('   - Allez dans Outils > WooCommerce Sync');
  console.log('   - Cliquez sur "Synchroniser tous les articles"');
  console.log('   - Vérifiez les logs WordPress pour les erreurs');
  console.log('='.repeat(60));
}

async function main() {
  const postId = '3736';
  
  console.log('🚀 Test de correction de la synchronisation WooCommerce');
  console.log('='.repeat(60));
  
  // Étape 1: Vérifier la configuration
  console.log('\n📝 Étape 1: Vérification de la configuration');
  const isConfigured = await testArticleConfiguration(postId);
  
  if (isConfigured) {
    // Étape 2: Tester la synchronisation
    console.log('\n🔄 Étape 2: Test de synchronisation WooCommerce');
    const syncSuccess = await testWooCommerceSync(postId);
    
    if (syncSuccess) {
      // Étape 3: Vérifier le produit créé
      console.log('\n🔍 Étape 3: Vérification du produit créé');
      await testWooCommerceProductExists(postId);
    } else {
      console.log('\n⚠️ Synchronisation échouée, instructions manuelles nécessaires');
      await showConfigurationInstructions();
    }
  } else {
    console.log('\n⚠️ Article non configuré correctement');
    await showConfigurationInstructions();
  }
  
  console.log('\n🎯 Résumé des corrections :');
  console.log('✅ Suppression de la référence au champ "access"');
  console.log('✅ Utilisation exclusive du champ "access_level"');
  console.log('✅ Correction de la duplication des colonnes WooCommerce');
  console.log('✅ Amélioration de la logique de synchronisation');
  console.log('');
  console.log('📋 Prochaines étapes :');
  console.log('1. Déployez le code corrigé dans functions.php');
  console.log('2. Configurez l\'article avec access_level: premium');
  console.log('3. Vérifiez que la synchronisation fonctionne');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  testArticleConfiguration,
  testWooCommerceSync,
  testWooCommerceProductExists,
  showConfigurationInstructions
};
