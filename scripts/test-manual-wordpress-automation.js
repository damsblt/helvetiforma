const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function testManualWordPressAutomation() {
  console.log('🧪 Test manuel de l\'automatisation WordPress...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Créer un article de test
    console.log('1️⃣ Création d\'un article de test...');
    
    const testPost = {
      title: 'Test Article Premium Manuel - ' + new Date().toISOString(),
      content: 'Article de test pour vérifier l\'automatisation manuellement',
      status: 'draft'
    };

    const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
    const postId = postResponse.data.id;
    console.log(`✅ Article créé (ID: ${postId})`);

    // 2. Instructions pour l'utilisateur
    console.log('\n2️⃣ Instructions pour tester manuellement :\n');
    
    console.log('🎯 ÉTAPES À SUIVRE DANS L\'ADMIN WORDPRESS :\n');
    
    console.log('1. Connectez-vous à l\'admin WordPress :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin`);
    console.log(`   Utilisateur: ${WORDPRESS_USER}`);
    console.log('');
    
    console.log('2. Allez dans Articles → Tous les articles');
    console.log(`   Cherchez l\'article: "${testPost.title}"`);
    console.log(`   ID de l\'article: ${postId}`);
    console.log('');
    
    console.log('3. Cliquez sur "Modifier" pour ouvrir l\'article');
    console.log('');
    
    console.log('4. Dans l\'éditeur d\'article, cherchez la boîte "Paramètres Premium" :');
    console.log('   - Elle devrait être visible à droite de l\'éditeur');
    console.log('   - Si elle n\'apparaît pas, le plugin n\'est pas correctement activé');
    console.log('');
    
    console.log('5. Configurez les paramètres premium :');
    console.log('   - Niveau d\'accès: Sélectionnez "Premium"');
    console.log('   - Prix: Entrez "25.00"');
    console.log('');
    
    console.log('6. Cliquez sur "Mettre à jour" pour sauvegarder');
    console.log('');
    
    console.log('7. Vérifiez dans WooCommerce → Produits :');
    console.log('   - Un produit avec le même nom devrait être créé');
    console.log('   - Le prix devrait correspondre');
    console.log('   - Le produit devrait être lié à l\'article');
    console.log('');

    // 3. Vérifier l'état actuel
    console.log('3️⃣ Vérification de l\'état actuel...\n');
    
    try {
      const productsResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=20');
      const products = productsResponse.data;
      
      console.log(`✅ ${products.length} produits WooCommerce trouvés`);
      
      // Chercher les produits liés à des articles
      const linkedProducts = products.filter(product => 
        product.meta_data?.some(meta => meta.key === 'article_post_id')
      );
      
      if (linkedProducts.length > 0) {
        console.log(`✅ ${linkedProducts.length} produits liés à des articles trouvés :`);
        linkedProducts.forEach(product => {
          const articleId = product.meta_data.find(meta => meta.key === 'article_post_id')?.value;
          console.log(`   - "${product.name}" (ID: ${product.id}) → Article ${articleId}`);
        });
      } else {
        console.log('⚠️ Aucun produit lié à des articles trouvé');
        console.log('   Cela confirme que l\'automatisation ne fonctionne pas encore');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des produits:', error.message);
    }

    // 4. Dépannage
    console.log('\n4️⃣ Dépannage...\n');
    
    console.log('🔧 SI L\'AUTOMATISATION NE FONCTIONNE PAS :\n');
    
    console.log('1. Vérifiez que le plugin est activé :');
    console.log('   - Allez dans Plugins → Plugins installés');
    console.log('   - Cherchez "HelvetiForma Premium Automation"');
    console.log('   - Vérifiez qu\'il est activé');
    console.log('');
    
    console.log('2. Vérifiez les logs WordPress :');
    console.log('   - Allez dans Outils → Santé du site → Info');
    console.log('   - Cherchez les logs d\'erreur');
    console.log('   - Cherchez les messages du plugin');
    console.log('');
    
    console.log('3. Vérifiez les permissions :');
    console.log('   - L\'utilisateur doit avoir les permissions d\'édition des articles');
    console.log('   - L\'utilisateur doit avoir les permissions de création de produits');
    console.log('');
    
    console.log('4. Testez avec un autre article :');
    console.log('   - Créez un nouvel article');
    console.log('   - Ajoutez les métadonnées premium');
    console.log('   - Publiez l\'article');
    console.log('');
    
    console.log('5. Redémarrez le plugin :');
    console.log('   - Désactivez le plugin');
    console.log('   - Réactivez le plugin');
    console.log('   - Testez à nouveau');
    console.log('');

    // 5. Résumé
    console.log('5️⃣ Résumé du problème...\n');
    
    console.log('🎯 PROBLÈME IDENTIFIÉ :');
    console.log('   L\'API REST WordPress ne peut pas accéder aux métadonnées des articles');
    console.log('   Cela empêche l\'automatisation de fonctionner correctement');
    console.log('');
    
    console.log('💡 SOLUTIONS :');
    console.log('   1. Testez manuellement via l\'interface WordPress');
    console.log('   2. Vérifiez les permissions et la configuration');
    console.log('   3. Consultez les logs WordPress pour plus d\'informations');
    console.log('');
    
    console.log('📝 ARTICLE DE TEST CRÉÉ :');
    console.log(`   Titre: "${testPost.title}"`);
    console.log(`   ID: ${postId}`);
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin/post.php?post=${postId}&action=edit`);
    console.log('');
    
    console.log('🎯 L\'automatisation devrait fonctionner via l\'interface WordPress !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testManualWordPressAutomation();
