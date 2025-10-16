const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function installAndTestPlugin() {
  console.log('🔧 Installation et test du plugin WordPress...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    
    const testResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=1');
    console.log('✅ Connexion WordPress établie');

    // 2. Vérifier WooCommerce
    console.log('\n2️⃣ Vérification de WooCommerce...');
    
    const wcResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=1');
    console.log('✅ WooCommerce accessible');

    // 3. Vérifier les plugins
    console.log('\n3️⃣ Vérification des plugins...');
    
    try {
      const pluginsResponse = await wpApi.get('/wp-json/wp/v2/plugins');
      const plugins = pluginsResponse.data;
      
      console.log(`✅ ${plugins.length} plugins trouvés`);
      
      // Chercher notre plugin
      const ourPlugin = plugins.find(plugin => 
        plugin.plugin.includes('helvetiforma-premium-automation')
      );
      
      if (ourPlugin) {
        console.log(`✅ Plugin trouvé: ${ourPlugin.name}`);
        console.log(`   Statut: ${ourPlugin.status === 'active' ? '✅ Actif' : '❌ Inactif'}`);
        
        if (ourPlugin.status !== 'active') {
          console.log('⚠️ Le plugin n\'est pas activé !');
          console.log('   Veuillez l\'activer dans l\'admin WordPress');
        }
      } else {
        console.log('❌ Plugin HelvetiForma Premium Automation non trouvé');
        console.log('   Veuillez l\'installer d\'abord');
      }
      
    } catch (error) {
      console.log('⚠️ Impossible d\'accéder aux plugins via API');
    }

    // 4. Créer un article de test avec métadonnées
    console.log('\n4️⃣ Création d\'un article de test...');
    
    const testPost = {
      title: 'Test Article Premium - ' + new Date().toISOString(),
      content: 'Article de test pour vérifier l\'automatisation',
      status: 'draft'
    };

    const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
    const postId = postResponse.data.id;
    console.log(`✅ Article créé (ID: ${postId})`);

    // 5. Essayer d'ajouter les métadonnées via l'API REST
    console.log('\n5️⃣ Test d\'ajout des métadonnées via API REST...');
    
    try {
      // Essayer la méthode standard
      await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
        meta_key: 'access_level',
        meta_value: 'premium'
      });
      console.log('✅ Métadonnée access_level ajoutée');

      await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
        meta_key: 'price',
        meta_value: '29.90'
      });
      console.log('✅ Métadonnée price ajoutée');

    } catch (metaError) {
      console.log('❌ Erreur lors de l\'ajout des métadonnées:', metaError.message);
      console.log('   L\'API des métadonnées n\'est pas accessible');
      console.log('   Cela explique pourquoi l\'automatisation ne fonctionne pas');
    }

    // 6. Vérifier les métadonnées
    console.log('\n6️⃣ Vérification des métadonnées...');
    
    try {
      const metaResponse = await wpApi.get(`/wp-json/wp/v2/posts/${postId}/meta`);
      const metadata = metaResponse.data;
      
      console.log(`✅ ${metadata.length} métadonnées trouvées`);
      
      metadata.forEach(meta => {
        console.log(`   - ${meta.meta_key}: ${meta.meta_value}`);
      });
      
    } catch (metaError) {
      console.log('❌ Impossible de récupérer les métadonnées:', metaError.message);
    }

    // 7. Publier l'article pour tester l'automatisation
    console.log('\n7️⃣ Test de publication...');
    
    try {
      await wpApi.post(`/wp-json/wp/v2/posts/${postId}`, {
        status: 'publish'
      });
      console.log('✅ Article publié');
      
      // Attendre un peu pour que l'automatisation se déclenche
      console.log('   Attente de l\'automatisation (3 secondes)...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log('❌ Erreur lors de la publication:', error.message);
    }

    // 8. Vérifier si un produit a été créé
    console.log('\n8️⃣ Vérification de la création du produit...');
    
    try {
      const productsResponse = await wpApi.get('/wp-json/wc/v3/products', {
        params: {
          search: testPost.title,
          per_page: 10
        }
      });

      const createdProduct = productsResponse.data.find(product => 
        product.meta_data?.some(meta => 
          meta.key === 'article_post_id' && meta.value == postId
        )
      );

      if (createdProduct) {
        console.log('🎉 SUCCÈS ! Produit WooCommerce créé automatiquement :');
        console.log(`   - ID: ${createdProduct.id}`);
        console.log(`   - Nom: ${createdProduct.name}`);
        console.log(`   - Prix: ${createdProduct.regular_price} CHF`);
        console.log(`   - Statut: ${createdProduct.status}`);
      } else {
        console.log('⚠️ Aucun produit créé automatiquement');
        console.log('   Raisons possibles :');
        console.log('   1. Le plugin n\'est pas activé');
        console.log('   2. L\'API des métadonnées n\'est pas accessible');
        console.log('   3. Il y a une erreur dans le plugin');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des produits:', error.message);
    }

    // 9. Nettoyage
    console.log('\n9️⃣ Nettoyage...');
    try {
      await wpApi.delete(`/wp-json/wp/v2/posts/${postId}?force=true`);
      console.log('✅ Article de test supprimé');
    } catch (error) {
      console.log('⚠️ Impossible de supprimer l\'article de test');
    }

    // 10. Recommandations
    console.log('\n🔧 RECOMMANDATIONS :\n');
    
    console.log('1. INSTALLEZ LE PLUGIN :');
    console.log('   - Allez dans l\'admin WordPress');
    console.log('   - Plugins → Ajouter');
    console.log('   - Téléversez le fichier: helvetiforma-premium-automation.zip');
    console.log('   - Activez le plugin');
    console.log('');
    
    console.log('2. VÉRIFIEZ LES PERMISSIONS :');
    console.log('   - L\'utilisateur doit avoir les permissions d\'édition des articles');
    console.log('   - L\'utilisateur doit avoir les permissions de création de produits');
    console.log('');
    
    console.log('3. TESTEZ MANUELLEMENT :');
    console.log('   - Créez un article dans l\'admin WordPress');
    console.log('   - Ajoutez les métadonnées via l\'interface');
    console.log('   - Publiez l\'article');
    console.log('   - Vérifiez que le produit est créé');
    console.log('');
    
    console.log('4. VÉRIFIEZ LES LOGS :');
    console.log('   - Allez dans Outils → Santé du site → Info');
    console.log('   - Cherchez les logs d\'erreur');
    console.log('   - Vérifiez que le plugin fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le test
installAndTestPlugin();
