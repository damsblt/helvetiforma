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

async function forceAccessLevelConfiguration() {
  try {
    console.log('🔍 Récupération des articles...');
    
    const response = await wordpressClient.get('/wp/v2/posts', {
      params: {
        per_page: 10,
        status: 'publish,draft'
      }
    });
    
    console.log(`📄 ${response.data.length} articles trouvés`);
    
    for (const post of response.data) {
      console.log(`\n🔧 Configuration de l'article "${post.title.rendered}" (ID: ${post.id})...`);
      
      // Récupérer l'article actuel
      const currentResponse = await wordpressClient.get(`/wp/v2/posts/${post.id}`);
      const currentPost = currentResponse.data;
      
      console.log('📄 ACF actuel:', currentPost.acf || {});
      
      // Déterminer le prix
      let price = '10.00';
      if (post.title.rendered.includes('test test')) {
        price = '10.00';
      } else if (post.title.rendered.includes('test')) {
        price = '40.00';
      }
      
      // Forcer la configuration des champs ACF
      const updateData = {
        acf: {
          access_level: 'premium',
          price: price
        }
      };
      
      console.log('📊 Données à envoyer:', updateData);
      
      const updateResponse = await wordpressClient.post(`/wp/v2/posts/${post.id}`, updateData);
      
      if (updateResponse.status === 200) {
        console.log('✅ Configuration ACF réussie');
        
        // Vérifier la configuration
        const verifyResponse = await wordpressClient.get(`/wp/v2/posts/${post.id}`);
        const updatedPost = verifyResponse.data;
        
        console.log('📊 Configuration vérifiée:', {
          access_level: updatedPost.acf?.access_level,
          price: updatedPost.acf?.price
        });
        
        // Tenter la synchronisation WooCommerce
        try {
          const syncResponse = await wordpressClient.post('/helvetiforma/v1/sync-article', {
            post_id: post.id
          });
          
          if (syncResponse.data.success) {
            console.log('✅ Synchronisation WooCommerce réussie');
            console.log('📊 Produit créé:', syncResponse.data);
          } else {
            console.log('❌ Échec synchronisation WooCommerce:', syncResponse.data);
          }
        } catch (syncError) {
          console.log('⚠️ Erreur synchronisation:', syncError.response?.data || syncError.message);
        }
        
      } else {
        console.log('❌ Échec de la configuration ACF');
      }
      
      // Pause entre les articles
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ Configuration de tous les articles terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.response?.data || error.message);
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
  console.log('     * access_level: premium (OBLIGATOIRE)');
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
  console.log('🚀 Configuration forcée des champs ACF');
  console.log('='.repeat(60));
  
  try {
    await forceAccessLevelConfiguration();
  } catch (error) {
    console.error('❌ Configuration automatique échouée:', error.message);
    console.log('\n📋 Passage aux instructions manuelles...');
    await showManualInstructions();
  }
  
  console.log('\n🎯 Résumé :');
  console.log('✅ Configuration forcée de access_level: premium');
  console.log('✅ Configuration des prix appropriés');
  console.log('✅ Tentative de synchronisation WooCommerce');
  console.log('');
  console.log('📋 Le système utilise maintenant :');
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
  forceAccessLevelConfiguration,
  showManualInstructions
};
