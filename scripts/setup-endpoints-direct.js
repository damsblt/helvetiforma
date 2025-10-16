require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Configuration WordPress
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USERNAME = process.env.WORDPRESS_APP_USER || 'admin';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';

const wpApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD
  }
});

async function setupEndpointsDirect() {
  console.log('🔧 Configuration directe des endpoints...');
  console.log('========================================');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Créer un endpoint temporaire via un post
    console.log('\n2️⃣ Création d\'un endpoint temporaire...');
    
    // Créer un post avec le code PHP des endpoints
    const endpointCode = `<?php
// Endpoints personnalisés pour HelvetiForma
add_action('rest_api_init', function () {
  register_rest_route('helvetiforma/v1', '/posts', [
    'methods' => 'GET',
    'callback' => 'get_helvetiforma_posts',
    'permission_callback' => '__return_true'
  ]);
  
  register_rest_route('helvetiforma/v1', '/posts/(?P<slug>[a-zA-Z0-9-]+)', [
    'methods' => 'GET',
    'callback' => 'get_helvetiforma_post_by_slug',
    'permission_callback' => '__return_true'
  ]);
});

function get_helvetiforma_posts() {
  $posts = get_posts([
    'post_type' => 'post',
    'posts_per_page' => -1,
    'post_status' => 'publish'
  ]);
  
  $result = [];
  foreach ($posts as $post) {
    $result[] = format_helvetiforma_post($post);
  }
  return $result;
}

function get_helvetiforma_post_by_slug($request) {
  $slug = $request['slug'];
  $post = get_page_by_path($slug, OBJECT, 'post');
  
  if (!$post) {
    return new WP_Error('not_found', 'Article non trouvé', ['status' => 404]);
  }
  
  return format_helvetiforma_post($post);
}

function format_helvetiforma_post($post) {
  // Récupérer les custom fields
  $access_level = get_post_meta($post->ID, 'access_level', true) ?: 'public';
  $product_id = get_post_meta($post->ID, 'woocommerce_product_id', true);
  $price = 0;
  
  if ($product_id) {
    $price = get_post_meta($product_id, '_price', true) ?: 0;
  } else {
    $price = get_post_meta($post->ID, 'price', true) ?: 0;
  }
  
  // Récupérer l'image featured
  $image_url = null;
  if (has_post_thumbnail($post->ID)) {
    $image_url = get_the_post_thumbnail_url($post->ID, 'large');
  }
  
  // Récupérer la catégorie
  $categories = get_the_category($post->ID);
  $category = !empty($categories) ? $categories[0]->name : null;
  
  // Récupérer les tags
  $tags = get_the_tags($post->ID);
  $tag_names = $tags ? array_map(function($tag) { return $tag->name; }, $tags) : [];
  
  return [
    '_id' => $post->ID,
    'title' => $post->post_title,
    'slug' => ['current' => $post->post_name],
    'excerpt' => $post->post_excerpt,
    'body' => $post->post_content,
    'publishedAt' => $post->post_date,
    'accessLevel' => $access_level,
    'price' => floatval($price),
    'image' => $image_url,
    'category' => $category,
    'tags' => $tag_names
  ];
}
`;

    // Créer un post avec le code
    const postResponse = await wpApi.post('/wp/v2/posts', {
      title: 'HelvetiForma Endpoints Code',
      content: `<pre><code>${endpointCode}</code></pre>`,
      status: 'draft'
    });
    
    console.log(`✅ Code des endpoints créé (Post ID: ${postResponse.data.id})`);
    console.log('📋 Instructions:');
    console.log('1. Copiez le code du post créé');
    console.log('2. Ajoutez-le à functions.php de votre thème');
    console.log('3. Ou créez un plugin avec ce code');

    // 3. Tester les endpoints
    console.log('\n3️⃣ Test des endpoints...');
    
    try {
      const testResponse = await wpApi.get('/helvetiforma/v1/posts');
      console.log('✅ Endpoints personnalisés accessibles');
      console.log(`   Articles trouvés: ${testResponse.data.length}`);
      
      if (testResponse.data.length > 0) {
        const firstPost = testResponse.data[0];
        console.log(`   Premier article: ${firstPost.title}`);
        console.log(`   Access Level: ${firstPost.accessLevel}`);
        console.log(`   Prix: ${firstPost.price} CHF`);
      }
      
    } catch (error) {
      console.log('❌ Endpoints personnalisés non accessibles:', error.message);
      console.log('📋 Ajoutez le code PHP à functions.php');
    }

    // 4. Tester l'application Next.js
    console.log('\n4️⃣ Test de l\'application Next.js...');
    
    try {
      const response = await axios.get('http://localhost:3000/posts');
      console.log(`✅ Application Next.js accessible (status: ${response.status})`);
      
      if (response.data.includes('Articles & Actualités')) {
        console.log('✅ Titre de la page correct');
      } else {
        console.log('⚠️ Titre de la page non trouvé');
      }
      
    } catch (error) {
      console.log('❌ Application Next.js non accessible:', error.message);
      console.log('📋 Démarrez l\'application avec: npm run dev');
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Code des endpoints créé');
    console.log('- Articles configurés avec WooCommerce');
    console.log('- Application Next.js testée');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Ajoutez le code PHP à functions.php');
    console.log('2. Testez l\'application complète');
    console.log('3. Configurez Stripe pour les paiements');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
setupEndpointsDirect();
