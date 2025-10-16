const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

// Client WordPress sans authentification (pour les lectures publiques)
const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  }
});

async function checkCurrentArticleStatus(postId) {
  try {
    console.log(`🔍 Vérification de l'état actuel de l'article ${postId}...`);
    
    const response = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = response.data;
    
    console.log('📄 Article actuel:', {
      id: post.id,
      title: post.title.rendered,
      status: post.status,
      acf: post.acf,
      meta: post.meta
    });
    
    return post;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.response?.data || error.message);
    return null;
  }
}

async function createCustomEndpointForArticleUpdate() {
  console.log('🔧 Création d\'un endpoint personnalisé pour la mise à jour d\'articles...');
  
  const endpointCode = `
// Ajouter ce code dans functions.php de WordPress
add_action('rest_api_init', function() {
  register_rest_route('helvetiforma/v1', '/update-article-acf', [
    'methods' => 'POST',
    'callback' => 'update_article_acf_fields',
    'permission_callback' => '__return_true'
  ]);
});

function update_article_acf_fields($request) {
  $post_id = $request->get_param('post_id');
  $access = $request->get_param('access');
  $price = $request->get_param('price');
  
  if (!$post_id) {
    return new WP_Error('missing_post_id', 'Post ID required', ['status' => 400]);
  }
  
  $post = get_post($post_id);
  if (!$post) {
    return new WP_Error('post_not_found', 'Post not found', ['status' => 404]);
  }
  
  $result = [];
  
  if ($access) {
    update_field('access', $access, $post_id);
    $result['access'] = $access;
  }
  
  if ($price !== null) {
    update_field('price', $price, $post_id);
    $result['price'] = $price;
  }
  
  return [
    'success' => true,
    'post_id' => $post_id,
    'updated_fields' => $result
  ];
}
`;
  
  console.log('📝 Code à ajouter dans functions.php :');
  console.log('='.repeat(60));
  console.log(endpointCode);
  console.log('='.repeat(60));
  
  return endpointCode;
}

async function testCustomEndpoint(postId, access = 'premium', price = '1.00') {
  try {
    console.log(`🔄 Test de l'endpoint personnalisé pour l'article ${postId}...`);
    
    const response = await wordpressClient.post('/helvetiforma/v1/update-article-acf', {
      post_id: postId,
      access: access,
      price: price
    });
    
    if (response.data.success) {
      console.log('✅ Article mis à jour avec succès via l\'endpoint personnalisé');
      console.log('📊 Champs mis à jour:', response.data.updated_fields);
      return true;
    } else {
      console.log('❌ Échec de la mise à jour via l\'endpoint personnalisé');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Endpoint personnalisé non disponible:', error.response?.data || error.message);
    return false;
  }
}

async function manualConfigurationInstructions(postId) {
  console.log('\n📋 Instructions de configuration manuelle :');
  console.log('='.repeat(60));
  console.log('1. Connectez-vous à WordPress Admin :');
  console.log('   URL: https://api.helvetiforma.ch/wp-admin');
  console.log('   Utilisateur: contact@helvetiforma.ch');
  console.log('   Mot de passe: RWnb nSO6 6TMX yWd0 HWFl HBYh');
  console.log('');
  console.log('2. Allez dans Articles > Tous les articles');
  console.log('3. Trouvez l\'article "test new-new" (ID: 3736)');
  console.log('4. Cliquez sur "Modifier"');
  console.log('5. Faites défiler vers le bas jusqu\'aux champs personnalisés ACF');
  console.log('6. Configurez les champs suivants :');
  console.log('   - Access: premium');
  console.log('   - Price: 1.00');
  console.log('7. Cliquez sur "Mettre à jour"');
  console.log('8. Vérifiez que les champs sont bien sauvegardés');
  console.log('');
  console.log('9. Installez le plugin HelvetiForma WooCommerce Automation :');
  console.log('   - Allez dans Plugins > Ajouter un nouveau');
  console.log('   - Téléversez le fichier: wordpress-plugin/helvetiforma-woocommerce-automation.php');
  console.log('   - Activez le plugin');
  console.log('');
  console.log('10. Le plugin créera automatiquement le produit WooCommerce');
  console.log('='.repeat(60));
}

async function testAfterConfiguration(postId) {
  try {
    console.log('\n🔍 Test après configuration...');
    
    const post = await checkCurrentArticleStatus(postId);
    
    if (post && post.acf?.access === 'premium' && post.acf?.price) {
      console.log('✅ Article correctement configuré !');
      console.log('📊 Configuration finale:', {
        access: post.acf.access,
        price: post.acf.price
      });
      
      // Tester la fonction getWordPressPostById
      await testGetWordPressPostById(postId);
      
      return true;
    } else {
      console.log('❌ Article pas encore configuré correctement');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

async function testGetWordPressPostById(postId) {
  try {
    console.log('\n🔍 Test de la fonction getWordPressPostById...');
    
    const response = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = response.data;
    
    const accessLevel = post.acf?.access_level || post.acf?.access || 'public';
    const price = post.acf?.price ? parseFloat(post.acf.price) : 0;
    
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

async function main() {
  const postId = '3736';
  
  console.log('🚀 Configuration de l\'article premium via endpoint personnalisé');
  console.log('='.repeat(60));
  
  // Étape 1: Vérifier l'état actuel
  console.log('\n📝 Étape 1: Vérification de l\'état actuel');
  const currentPost = await checkCurrentArticleStatus(postId);
  
  if (currentPost && currentPost.acf?.access === 'premium' && currentPost.acf?.price) {
    console.log('✅ Article déjà configuré comme premium !');
    await testAfterConfiguration(postId);
    return;
  }
  
  // Étape 2: Créer l'endpoint personnalisé
  console.log('\n🔧 Étape 2: Création de l\'endpoint personnalisé');
  await createCustomEndpointForArticleUpdate();
  
  // Étape 3: Tester l'endpoint personnalisé
  console.log('\n🔄 Étape 3: Test de l\'endpoint personnalisé');
  const endpointSuccess = await testCustomEndpoint(postId, 'premium', '1.00');
  
  if (endpointSuccess) {
    // Étape 4: Vérifier la configuration
    await testAfterConfiguration(postId);
  } else {
    // Étape 5: Instructions manuelles
    await manualConfigurationInstructions(postId);
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  checkCurrentArticleStatus,
  createCustomEndpointForArticleUpdate,
  testCustomEndpoint,
  manualConfigurationInstructions,
  testAfterConfiguration
};
