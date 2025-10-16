<?php
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
