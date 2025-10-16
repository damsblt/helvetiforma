const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_PASSWORD = 'Contactformation2025*';

async function testWordPressAdminCredentials() {
  console.log('🔍 Test de connexion WordPress avec les credentials admin...\n');

  console.log('📋 Configuration :');
  console.log(`   URL: ${WORDPRESS_URL}`);
  console.log(`   User: ${WORDPRESS_USER}`);
  console.log(`   Password: ${WORDPRESS_PASSWORD.substring(0, 10)}...`);

  try {
    // Test 1: Connexion WordPress
    console.log('\n1️⃣ Test de connexion WordPress...');
    
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_PASSWORD
      }
    });

    const postsResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=1');
    console.log('✅ Connexion WordPress réussie');
    console.log(`   Status: ${postsResponse.status}`);
    console.log(`   Articles trouvés: ${postsResponse.data.length}`);

    // Test 2: Test WooCommerce
    console.log('\n2️⃣ Test de WooCommerce...');
    
    const wcResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=1');
    console.log('✅ WooCommerce accessible');
    console.log(`   Status: ${wcResponse.status}`);
    console.log(`   Produits trouvés: ${wcResponse.data.length}`);

    // Test 3: Vérifier les plugins
    console.log('\n3️⃣ Vérification des plugins...');
    
    try {
      const pluginsResponse = await wpApi.get('/wp-json/wp/v2/plugins');
      console.log('✅ Plugins accessibles');
      console.log(`   Plugins trouvés: ${pluginsResponse.data.length}`);
      
      // Chercher WooCommerce
      const woocommerce = pluginsResponse.data.find(plugin => 
        plugin.plugin.includes('woocommerce')
      );
      
      if (woocommerce) {
        console.log(`   WooCommerce: ${woocommerce.status === 'active' ? '✅ Actif' : '❌ Inactif'}`);
      } else {
        console.log('   WooCommerce: ❌ Non trouvé');
      }
      
    } catch (error) {
      console.log('⚠️ Plugins non accessibles via API');
    }

    // Test 4: Créer un article de test
    console.log('\n4️⃣ Test de création d\'article...');
    
    const testPost = {
      title: 'Test Article Premium Admin - ' + new Date().toISOString(),
      content: 'Article de test pour vérifier l\'automatisation avec les credentials admin',
      status: 'draft'
    };

    const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
    const postId = postResponse.data.id;
    console.log(`✅ Article créé (ID: ${postId})`);

    // Test 5: Ajouter les métadonnées premium
    console.log('\n5️⃣ Test d\'ajout des métadonnées premium...');
    
    await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
      meta_key: 'access_level',
      meta_value: 'premium'
    });

    await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
      meta_key: 'price',
      meta_value: '39.90'
    });

    console.log('✅ Métadonnées premium ajoutées');

    // Test 6: Publier l'article
    console.log('\n6️⃣ Test de publication...');
    
    await wpApi.post(`/wp-json/wp/v2/posts/${postId}`, {
      status: 'publish'
    });

    console.log('✅ Article publié');

    // Test 7: Vérifier si un produit WooCommerce a été créé
    console.log('\n7️⃣ Vérification de la création du produit WooCommerce...');
    
    // Attendre un peu pour que l'automatisation se déclenche
    await new Promise(resolve => setTimeout(resolve, 3000));

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
      console.log(`   - Type: ${createdProduct.type}`);
    } else {
      console.log('⚠️ Aucun produit créé automatiquement');
      console.log('   Le plugin WordPress n\'est peut-être pas encore installé/activé');
    }

    // Test 8: Installer le plugin automatiquement
    console.log('\n8️⃣ Tentative d\'installation automatique du plugin...');
    
    try {
      // Lire le fichier du plugin
      const fs = require('fs');
      const path = require('path');
      
      const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation.php');
      const pluginContent = fs.readFileSync(pluginPath, 'utf8');
      
      // Créer le plugin via l'API WordPress
      const pluginData = {
        title: 'HelvetiForma Premium Automation',
        content: pluginContent,
        status: 'publish',
        type: 'plugin'
      };
      
      // Note: L'installation de plugins via API nécessite des permissions spéciales
      console.log('⚠️ Installation automatique non disponible via API');
      console.log('📋 Installation manuelle requise');
      
    } catch (error) {
      console.log('⚠️ Erreur lors de la préparation du plugin:', error.message);
    }

    // Nettoyage
    console.log('\n9️⃣ Nettoyage...');
    await wpApi.delete(`/wp-json/wp/v2/posts/${postId}?force=true`);
    console.log('✅ Article de test supprimé');

    console.log('\n🎯 Test terminé avec succès !');
    console.log('   Les credentials admin WordPress fonctionnent correctement.');
    console.log('   Vous pouvez maintenant installer le plugin manuellement.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testWordPressAdminCredentials();
