const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function fixWordPressPluginIssue() {
  console.log('🔧 Diagnostic et correction du problème du plugin WordPress...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Vérifier l'état du plugin
    console.log('1️⃣ Vérification du plugin...');
    
    try {
      const pluginsResponse = await wpApi.get('/wp-json/wp/v2/plugins');
      const plugins = pluginsResponse.data;
      
      const ourPlugin = plugins.find(plugin => 
        plugin.plugin.includes('helvetiforma-premium-automation')
      );
      
      if (ourPlugin) {
        console.log(`✅ Plugin trouvé: ${ourPlugin.name}`);
        console.log(`   Statut: ${ourPlugin.status === 'active' ? '✅ Actif' : '❌ Inactif'}`);
        console.log(`   Version: ${ourPlugin.version}`);
        
        if (ourPlugin.status !== 'active') {
          console.log('⚠️ Le plugin n\'est pas activé !');
          console.log('   Veuillez l\'activer dans l\'admin WordPress');
          return;
        }
      } else {
        console.log('❌ Plugin HelvetiForma Premium Automation non trouvé');
        console.log('   Veuillez l\'installer d\'abord');
        return;
      }
      
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux plugins via API');
      return;
    }

    // 2. Vérifier WooCommerce
    console.log('\n2️⃣ Vérification de WooCommerce...');
    
    try {
      const wcResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=1');
      console.log('✅ WooCommerce accessible');
    } catch (error) {
      console.log('❌ WooCommerce non accessible:', error.message);
      return;
    }

    // 3. Créer un article de test pour forcer l'automatisation
    console.log('\n3️⃣ Création d\'un article de test pour forcer l\'automatisation...');
    
    const testPost = {
      title: 'Test Forcé Premium - ' + new Date().toISOString(),
      content: 'Article de test pour forcer l\'automatisation',
      status: 'draft'
    };

    const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
    const postId = postResponse.data.id;
    console.log(`✅ Article créé (ID: ${postId})`);

    // 4. Instructions pour forcer l'automatisation
    console.log('\n4️⃣ Instructions pour forcer l\'automatisation...\n');
    
    console.log('🎯 ÉTAPES POUR FORCER L\'AUTOMATISATION :\n');
    
    console.log('1. Allez dans l\'admin WordPress :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin`);
    console.log('');
    
    console.log('2. Trouvez l\'article de test :');
    console.log(`   Titre: "${testPost.title}"`);
    console.log(`   ID: ${postId}`);
    console.log('');
    
    console.log('3. Ouvrez l\'article en mode édition');
    console.log('');
    
    console.log('4. Dans la boîte "Paramètres Premium" (à droite) :');
    console.log('   - Niveau d\'accès: Premium');
    console.log('   - Prix: 50.00 CHF');
    console.log('');
    
    console.log('5. Cliquez sur "Mettre à jour" pour sauvegarder');
    console.log('');
    
    console.log('6. Vérifiez immédiatement dans WooCommerce → Produits');
    console.log('   - Un produit devrait être créé automatiquement');
    console.log('   - Le nom devrait correspondre au titre de l\'article');
    console.log('   - Le prix devrait être 50.00 CHF');
    console.log('');

    // 5. Vérifier les produits existants
    console.log('5️⃣ Vérification des produits existants...\n');
    
    try {
      const productsResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=20');
      const products = productsResponse.data;
      
      console.log(`✅ ${products.length} produits WooCommerce trouvés`);
      
      // Chercher les produits liés à des articles
      const linkedProducts = products.filter(product => 
        product.meta_data?.some(meta => meta.key === 'article_post_id')
      );
      
      if (linkedProducts.length > 0) {
        console.log(`✅ ${linkedProducts.length} produits liés à des articles :`);
        linkedProducts.forEach(product => {
          const articleId = product.meta_data.find(meta => meta.key === 'article_post_id')?.value;
          console.log(`   - "${product.name}" (ID: ${product.id}) → Article ${articleId}`);
        });
      } else {
        console.log('⚠️ Aucun produit lié à des articles trouvé');
        console.log('   Cela confirme que l\'automatisation ne fonctionne pas');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des produits:', error.message);
    }

    // 6. Dépannage avancé
    console.log('\n6️⃣ Dépannage avancé...\n');
    
    console.log('🔧 SOLUTIONS POUR CORRIGER LE PROBLÈME :\n');
    
    console.log('1. VÉRIFIEZ LES LOGS WORDPRESS :');
    console.log('   - Allez dans Outils → Santé du site → Info');
    console.log('   - Cherchez les logs d\'erreur');
    console.log('   - Cherchez les messages du plugin "HelvetiForma Premium Automation"');
    console.log('');
    
    console.log('2. VÉRIFIEZ LES PERMISSIONS :');
    console.log('   - L\'utilisateur doit avoir les permissions d\'édition des articles');
    console.log('   - L\'utilisateur doit avoir les permissions de création de produits');
    console.log('   - Vérifiez dans Utilisateurs → Votre profil → Rôles');
    console.log('');
    
    console.log('3. REDÉMARREZ LE PLUGIN :');
    console.log('   - Allez dans Plugins → Plugins installés');
    console.log('   - Désactivez "HelvetiForma Premium Automation"');
    console.log('   - Attendez 5 secondes');
    console.log('   - Réactivez le plugin');
    console.log('   - Testez à nouveau');
    console.log('');
    
    console.log('4. VÉRIFIEZ LA CONFIGURATION WOOCOMMERCE :');
    console.log('   - Allez dans WooCommerce → Paramètres');
    console.log('   - Vérifiez que WooCommerce est correctement configuré');
    console.log('   - Vérifiez que les produits peuvent être créés');
    console.log('');
    
    console.log('5. TESTEZ AVEC UN AUTRE UTILISATEUR :');
    console.log('   - Créez un utilisateur administrateur');
    console.log('   - Testez l\'automatisation avec ce nouvel utilisateur');
    console.log('');

    // 7. Script de test automatique
    console.log('7️⃣ Test automatique de l\'automatisation...\n');
    
    console.log('🧪 TEST AUTOMATIQUE :');
    console.log('');
    console.log('1. Modifiez l\'article de test :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin/post.php?post=${postId}&action=edit`);
    console.log('');
    console.log('2. Configurez les paramètres premium :');
    console.log('   - Niveau d\'accès: Premium');
    console.log('   - Prix: 75.00 CHF');
    console.log('');
    console.log('3. Sauvegardez l\'article');
    console.log('');
    console.log('4. Vérifiez immédiatement dans WooCommerce → Produits');
    console.log('');
    console.log('5. Si aucun produit n\'est créé, consultez les logs WordPress');
    console.log('');

    // 8. Nettoyage
    console.log('8️⃣ Nettoyage...\n');
    
    console.log('📝 ARTICLE DE TEST CRÉÉ :');
    console.log(`   Titre: "${testPost.title}"`);
    console.log(`   ID: ${postId}`);
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin/post.php?post=${postId}&action=edit`);
    console.log('');
    console.log('   Vous pouvez supprimer cet article après le test');
    console.log('');

    console.log('🎯 Le problème principal est que le plugin ne se déclenche pas automatiquement');
    console.log('   Suivez les étapes de dépannage ci-dessus pour le corriger');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le diagnostic
fixWordPressPluginIssue();
