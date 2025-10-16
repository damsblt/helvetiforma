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

async function debugACFFields() {
  try {
    console.log('🔍 Debug des champs ACF...');
    
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
    
    console.log(`📄 Article: "${article.title.rendered}" (ID: ${postId})`);
    console.log('📊 ACF complet:', JSON.stringify(article.acf, null, 2));
    
    // Tester l'endpoint de debug
    console.log('\n🔧 Test de l\'endpoint de debug...');
    
    try {
      const debugResponse = await wordpressClient.post('/helvetiforma/v1/debug-article', {
        post_id: postId
      });
      
      console.log('📊 Réponse debug:', debugResponse.data);
      
    } catch (debugError) {
      console.log('⚠️ Endpoint debug non disponible:', debugError.response?.data || debugError.message);
    }
    
    // Tester la synchronisation avec debug
    console.log('\n🔄 Test de synchronisation avec debug...');
    
    try {
      const syncResponse = await wordpressClient.post('/helvetiforma/v1/sync-article', {
        post_id: postId
      });
      
      console.log('📊 Réponse synchronisation:', syncResponse.data);
      
    } catch (syncError) {
      console.log('❌ Erreur synchronisation:', syncError.response?.data || syncError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error.response?.data || error.message);
  }
}

async function createDebugEndpoint() {
  console.log('\n📋 Code pour l\'endpoint de debug :');
  console.log('='.repeat(60));
  console.log(`
// Ajouter ce code dans functions.php pour debug
add_action('rest_api_init', function() {
  register_rest_route('helvetiforma/v1', '/debug-article', [
    'methods' => 'POST',
    'callback' => 'debug_article_acf',
    'permission_callback' => '__return_true'
  ]);
});

function debug_article_acf($request) {
  $post_id = $request->get_param('post_id');
  
  if (!$post_id) {
    return new WP_Error('missing_post_id', 'Post ID required', ['status' => 400]);
  }
  
  $post = get_post($post_id);
  if (!$post) {
    return new WP_Error('post_not_found', 'Post not found', ['status' => 404]);
  }
  
  $access_level = get_field('access_level', $post_id);
  $access = get_field('access', $post_id);
  $price = get_field('price', $post_id);
  
  return [
    'success' => true,
    'post_id' => $post_id,
    'post_title' => $post->post_title,
    'fields' => [
      'access_level' => $access_level,
      'access' => $access,
      'price' => $price
    ],
    'is_premium' => ($access_level === 'premium' || $access === 'premium'),
    'has_price' => ($price && $price > 0),
    'can_sync' => (($access_level === 'premium' || $access === 'premium') && $price && $price > 0)
  ];
}
  `);
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Debug des champs ACF');
  console.log('='.repeat(60));
  
  try {
    await debugACFFields();
    await createDebugEndpoint();
  } catch (error) {
    console.error('❌ Debug échoué:', error.message);
  }
  
  console.log('\n🎯 Résumé :');
  console.log('✅ Debug des champs ACF existants');
  console.log('✅ Test des endpoints de synchronisation');
  console.log('✅ Code pour endpoint de debug fourni');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  debugACFFields,
  createDebugEndpoint
};
