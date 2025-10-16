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

async function setupCustomEndpoints() {
  console.log('🔧 Configuration des endpoints personnalisés...');
  console.log('==============================================');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Créer un plugin personnalisé pour les endpoints
    console.log('\n2️⃣ Création du plugin personnalisé...');
    
    const pluginCode = `<?php
/**
 * Plugin Name: HelvetiForma Custom API
 * Description: Endpoints personnalisés pour l'application HelvetiForma
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Endpoint pour récupérer articles avec métadonnées
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
  
  // Vérifier si utilisateur a acheté un article
  register_rest_route('helvetiforma/v1', '/check-purchase', [
    'methods' => 'GET',
    'callback' => 'check_user_purchase',
    'permission_callback' => 'is_user_logged_in'
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
  // Récupérer les champs ACF ou les custom fields natifs
  $access_level = get_field('access_level', $post->ID) ?: get_post_meta($post->ID, 'access_level', true) ?: 'public';
  $product_id = get_field('woocommerce_product_id', $post->ID) ?: get_post_meta($post->ID, 'woocommerce_product_id', true);
  $price = 0;
  
  if ($product_id) {
    $price = get_post_meta($product_id, '_price', true) ?: 0;
  } else {
    // Utiliser le prix stocké dans les custom fields
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
    'body' => $post->post_content, // HTML brut pour l'instant
    'publishedAt' => $post->post_date,
    'accessLevel' => $access_level,
    'price' => floatval($price),
    'image' => $image_url,
    'category' => $category,
    'tags' => $tag_names
  ];
}

function check_user_purchase($request) {
  $user_id = get_current_user_id();
  $post_id = $request->get_param('postId');
  
  if (!$user_id) {
    return ['hasPurchased' => false, 'isAuthenticated' => false];
  }
  
  // Vérifier si l'utilisateur a acheté le produit WooCommerce lié
  $product_id = get_field('woocommerce_product_id', $post_id) ?: get_post_meta($post_id, 'woocommerce_product_id', true);
  
  if (!$product_id) {
    return [
      'hasPurchased' => false,
      'isAuthenticated' => true
    ];
  }
  
  // Utiliser la fonction WooCommerce pour vérifier l'achat
  $has_purchased = false;
  if (function_exists('wc_customer_bought_product')) {
    $has_purchased = wc_customer_bought_product('', $user_id, $product_id);
  }
  
  return [
    'hasPurchased' => $has_purchased,
    'isAuthenticated' => true
  ];
}

// Ajouter les champs ACF au REST API
add_action('rest_api_init', function() {
  // Ajouter les champs ACF aux posts
  register_rest_field('post', 'acf', [
    'get_callback' => function($post) {
      return get_fields($post['id']);
    }
  ]);
});
`;

    // Créer le fichier plugin
    const fs = require('fs');
    const path = require('path');
    
    const pluginDir = path.join(__dirname, '..', 'wordpress-plugin');
    if (!fs.existsSync(pluginDir)) {
      fs.mkdirSync(pluginDir, { recursive: true });
    }
    
    const pluginFile = path.join(pluginDir, 'helvetiforma-custom-api.php');
    fs.writeFileSync(pluginFile, pluginCode);
    
    console.log(`✅ Plugin créé: ${pluginFile}`);
    console.log('📋 Instructions:');
    console.log('1. Copiez le fichier helvetiforma-custom-api.php');
    console.log('2. Placez-le dans wp-content/plugins/helvetiforma-custom-api/');
    console.log('3. Activez le plugin dans WordPress Admin');

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
      console.log('📋 Activez le plugin dans WordPress Admin');
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
    console.log('- Plugin personnalisé créé');
    console.log('- Endpoints personnalisés configurés');
    console.log('- Application Next.js testée');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Installez le plugin dans WordPress Admin');
    console.log('2. Installez WooCommerce et ACF');
    console.log('3. Configurez les custom fields');
    console.log('4. Testez les paiements');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
setupCustomEndpoints();
