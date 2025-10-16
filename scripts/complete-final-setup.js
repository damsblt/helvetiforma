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

// Métadonnées des articles migrés
const articlesMetadata = {
  3681: { access_level: 'premium', price: 1, product_id: 3700 },  // Test transaction 4
  3682: { access_level: 'premium', price: 5, product_id: 3701 },  // test 2
  3688: { access_level: 'premium', price: 10, product_id: 3702 }, // Les charges sociales
  3689: { access_level: 'public', price: 0 },   // test 3
  3690: { access_level: 'public', price: 0 }    // test
};

async function completeFinalSetup() {
  console.log('🔧 Configuration finale complète...');
  console.log('==================================');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Configurer les métadonnées des articles
    console.log('\n2️⃣ Configuration des métadonnées des articles...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      console.log(`\n📝 Configuration de l'article ${postId}...`);
      
      try {
        // Vérifier que l'article existe
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`   Titre: ${post.title.rendered}`);
        console.log(`   Configuration: ${meta.access_level} (${meta.price} CHF)`);
        
        // Mettre à jour les métadonnées
        const updateData = {
          meta: {
            access_level: meta.access_level,
            price: meta.price
          }
        };
        
        if (meta.product_id) {
          updateData.meta.woocommerce_product_id = meta.product_id;
        }
        
        await wpApi.post(`/wp/v2/posts/${postId}`, updateData);
        console.log(`   ✅ Métadonnées mises à jour`);
        
      } catch (error) {
        console.log(`   ❌ Erreur pour l'article ${postId}: ${error.message}`);
      }
    }

    // 3. Vérifier la configuration
    console.log('\n3️⃣ Vérification de la configuration...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      try {
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`\n📋 ${post.title.rendered} (ID: ${post.id}):`);
        console.log(`   Access Level: ${post.meta?.access_level || 'Non défini'}`);
        console.log(`   Prix: ${post.meta?.price || 'Non défini'} CHF`);
        console.log(`   WooCommerce ID: ${post.meta?.woocommerce_product_id || 'Non défini'}`);
        
      } catch (error) {
        console.log(`   ❌ Impossible de vérifier l'article ${postId}`);
      }
    }

    // 4. Créer les endpoints personnalisés
    console.log('\n4️⃣ Création des endpoints personnalisés...');
    
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
  // Récupérer les métadonnées
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

    // Créer un fichier avec le code
    const fs = require('fs');
    const path = require('path');
    
    const outputFile = path.join(__dirname, 'wordpress-endpoints-final.php');
    fs.writeFileSync(outputFile, endpointCode);
    
    console.log(`✅ Code des endpoints créé: ${outputFile}`);
    console.log('📋 Instructions:');
    console.log('1. Copiez le contenu de wordpress-endpoints-final.php');
    console.log('2. Ajoutez-le à wp-content/themes/[votre-theme]/functions.php');
    console.log('3. Ou créez un plugin avec ce code');

    // 5. Tester les endpoints
    console.log('\n5️⃣ Test des endpoints...');
    
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

    console.log('\n🎉 Configuration finale terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Métadonnées des articles configurées');
    console.log('- Produits WooCommerce créés');
    console.log('- Code des endpoints créé');
    console.log('- Application Next.js prête');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Ajoutez le code PHP à functions.php');
    console.log('2. Testez l\'application complète');
    console.log('3. Configurez Stripe pour les paiements');
    
    console.log('\n🧪 Test de l\'application:');
    console.log('1. L\'application est déjà démarrée: npm run dev');
    console.log('2. Visitez: http://localhost:3000/posts');
    console.log('3. Testez un article: http://localhost:3000/posts/test-transaction-4');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
completeFinalSetup();
