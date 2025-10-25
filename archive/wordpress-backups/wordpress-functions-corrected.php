<?php
/**
 * Twenty Twenty-Five functions and definitions.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_Five
 * @since Twenty Twenty-Five 1.0
 */

// Adds theme support for post formats.
if ( ! function_exists( 'twentytwentyfive_post_format_setup' ) ) :
	function twentytwentyfive_post_format_setup() {
		add_theme_support( 'post-formats', array( 'aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video' ) );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_post_format_setup' );

// Enqueues editor-style.css in the editors.
if ( ! function_exists( 'twentytwentyfive_editor_style' ) ) :
	function twentytwentyfive_editor_style() {
		add_editor_style( 'assets/css/editor-style.css' );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_editor_style' );

// Enqueues style.css on the front.
if ( ! function_exists( 'twentytwentyfive_enqueue_styles' ) ) :
	function twentytwentyfive_enqueue_styles() {
		wp_enqueue_style(
			'twentytwentyfive-style',
			get_parent_theme_file_uri( 'style.css' ),
			array(),
			wp_get_theme()->get( 'Version' )
		);
	}
endif;
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_enqueue_styles' );

// Registers custom block styles.
if ( ! function_exists( 'twentytwentyfive_block_styles' ) ) :
	function twentytwentyfive_block_styles() {
		register_block_style(
			'core/list',
			array(
				'name'         => 'checkmark-list',
				'label'        => __( 'Checkmark', 'twentytwentyfive' ),
				'inline_style' => '
				ul.is-style-checkmark-list {
					list-style-type: "\2713";
				}

				ul.is-style-checkmark-list li {
					padding-inline-start: 1ch;
				}',
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_block_styles' );

// Registers pattern categories.
if ( ! function_exists( 'twentytwentyfive_pattern_categories' ) ) :
	function twentytwentyfive_pattern_categories() {
		register_block_pattern_category(
			'twentytwentyfive_page',
			array(
				'label'       => __( 'Pages', 'twentytwentyfive' ),
				'description' => __( 'A collection of full page layouts.', 'twentytwentyfive' ),
			)
		);

		register_block_pattern_category(
			'twentytwentyfive_post-format',
			array(
				'label'       => __( 'Post formats', 'twentytwentyfive' ),
				'description' => __( 'A collection of post format patterns.', 'twentytwentyfive' ),
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_pattern_categories' );

// Registers block binding sources.
if ( ! function_exists( 'twentytwentyfive_register_block_bindings' ) ) :
	function twentytwentyfive_register_block_bindings() {
		register_block_bindings_source(
			'twentytwentyfive/format',
			array(
				'label'              => _x( 'Post format name', 'Label for the block binding placeholder in the editor', 'twentytwentyfive' ),
				'get_value_callback' => 'twentytwentyfive_format_binding',
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_register_block_bindings' );

// Registers block binding callback function for the post format name.
if ( ! function_exists( 'twentytwentyfive_format_binding' ) ) :
	function twentytwentyfive_format_binding() {
		$post_format_slug = get_post_format();

		if ( $post_format_slug && 'standard' !== $post_format_slug ) {
			return get_post_format_string( $post_format_slug );
		}
	}
endif;

// =============================================================================
// CORS HEADERS FOR REST API
// =============================================================================

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
});

add_action('init', function() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        }
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        }
        exit(0);
    }
});

// =============================================================================
// HELVETIFORMA CUSTOM API ENDPOINTS
// =============================================================================

add_action('rest_api_init', function () {
  // Articles endpoints
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
  
  register_rest_route('helvetiforma/v1', '/check-purchase', [
    'methods' => 'GET',
    'callback' => 'check_user_purchase',
    'permission_callback' => '__return_true'
  ]);
  
  // Authentication endpoints
  register_rest_route('helvetiforma/v1', '/verify-user', [
    'methods' => 'POST',
    'callback' => 'verify_user_credentials',
    'permission_callback' => '__return_true'
  ]);
  
  register_rest_route('helvetiforma/v1', '/register-user', [
    'methods' => 'POST',
    'callback' => 'register_user',
    'permission_callback' => '__return_true'
  ]);

  // WooCommerce automation endpoints
  register_rest_route('helvetiforma/v1', '/update-article-acf', [
    'methods' => 'POST',
    'callback' => 'update_article_acf_fields',
    'permission_callback' => '__return_true'
  ]);

  register_rest_route('helvetiforma/v1', '/sync-article', [
    'methods' => 'POST',
    'callback' => 'sync_article_with_woocommerce',
    'permission_callback' => '__return_true'
  ]);

  register_rest_route('helvetiforma/v1', '/debug-article', [
    'methods' => 'POST',
    'callback' => 'debug_article_acf',
    'permission_callback' => '__return_true'
  ]);
  
  register_rest_route('helvetiforma/v1', '/test-params', [
    'methods' => 'GET',
    'callback' => 'test_params_debug',
    'permission_callback' => '__return_true'
  ]);
});

// Article functions (get_helvetiforma_posts, get_helvetiforma_post_by_slug, etc.)
function get_helvetiforma_posts() {
  $posts = get_posts([
    'post_type' => 'post',
    'posts_per_page' => -1,
    'post_status' => 'publish'
  ]);
  
  foreach ($posts as $post) {
    if (function_exists('get_fields')) {
      $post->acf = get_fields($post->ID);
    }
  }
  
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

function check_user_purchase($request) {
  $user_id = $request->get_param('userId') ?: get_current_user_id();
  $post_id = $request->get_param('postId');
  
  if (!$user_id) {
    return ['hasPurchased' => false, 'isAuthenticated' => false];
  }
  
  $sku = "article-{$post_id}";
  $products = wc_get_products(['sku' => $sku, 'limit' => 1]);
  
  if (empty($products)) {
    return [
      'hasPurchased' => false,
      'isAuthenticated' => true,
      'debug' => 'Produit WooCommerce non trouvé'
    ];
  }
  
  $product = $products[0];
  $product_id = $product->get_id();
  $has_purchased = false;
  
  if (function_exists('wc_customer_bought_product')) {
    $has_purchased = wc_customer_bought_product('', $user_id, $product_id);
  }
  
  if (!$has_purchased) {
    $orders = wc_get_orders([
      'customer_id' => $user_id,
      'status' => 'completed',
      'limit' => -1
    ]);
    
    foreach ($orders as $order) {
      foreach ($order->get_items() as $item) {
        if ($item->get_product_id() == $product_id) {
          $has_purchased = true;
          break 2;
        }
      }
    }
  }
  
  return [
    'hasPurchased' => $has_purchased,
    'isAuthenticated' => true
  ];
}

function format_helvetiforma_post($post) {
  $access_level = 'public';
  $product_id = null;
  $price = 0;
  
  if (isset($post->acf) && is_array($post->acf)) {
    $access_level = $post->acf['access'] ?? $post->acf['accesss'] ?? 'public';
    $product_id = $post->acf['woocommerce_product_id'] ?? $post->acf['woocommerce'] ?? null;
    $price = $post->acf['price'] ?? 0;
  } else if (function_exists('get_field')) {
    $access_level = get_field('access', $post->ID) ?: get_field('accesss', $post->ID) ?: 'public';
    $product_id = get_field('woocommerce_product_id', $post->ID) ?: get_field('woocommerce', $post->ID);
    $price = get_field('price', $post->ID) ?: 0;
  }
  
  if (!$access_level || $access_level === 'public') {
    $access_level = get_post_meta($post->ID, 'access_level', true) ?: 'public';
  }
  if (!$product_id) {
    $product_id = get_post_meta($post->ID, 'woocommerce_product_id', true);
  }
  
  if ($product_id) {
    $wc_price = get_post_meta($product_id, '_price', true) ?: get_post_meta($product_id, '_regular_price', true);
    if ($wc_price) {
      $price = $wc_price;
    }
  }
  
  if (!$price || $price == 0) {
    $price = get_post_meta($post->ID, 'price', true) ?: 0;
  }
  
  $image_url = null;
  if (has_post_thumbnail($post->ID)) {
    $image_url = get_the_post_thumbnail_url($post->ID, 'large');
  }
  
  $categories = get_the_category($post->ID);
  $category = !empty($categories) ? $categories[0]->name : null;
  
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

add_action('rest_api_init', function() {
  if (function_exists('get_fields')) {
    register_rest_field('post', 'acf', [
      'get_callback' => function($post) {
        return get_fields($post['id']);
      }
    ]);
  }
});

function register_user($request) {
  $email = $request->get_param('email');
  $password = $request->get_param('password');
  $first_name = $request->get_param('first_name');
  $last_name = $request->get_param('last_name');
  
  if (!$email || !$password) {
    return new WP_Error('missing_credentials', 'Email and password required', ['status' => 400]);
  }
  
  if (email_exists($email)) {
    return new WP_Error('existing_user_email', 'Un utilisateur avec cet email existe déjà', ['status' => 400]);
  }
  
  $username = sanitize_user($email);
  $counter = 1;
  $original_username = $username;
  
  while (username_exists($username)) {
    $username = $original_username . $counter;
    $counter++;
  }
  
  $user_id = wp_create_user($username, $password, $email);
  
  if (is_wp_error($user_id)) {
    return new WP_Error('user_creation_failed', $user_id->get_error_message(), ['status' => 500]);
  }
  
  wp_update_user([
    'ID' => $user_id,
    'first_name' => $first_name,
    'last_name' => $last_name,
    'display_name' => trim($first_name . ' ' . $last_name) ?: $email,
    'role' => 'subscriber'
  ]);
  
  return [
    'success' => true,
    'user_id' => $user_id,
    'username' => $username,
    'email' => $email
  ];
}

function verify_user_credentials($request) {
  $username = $request->get_param('username');
  $password = $request->get_param('password');
  
  if (!$username || !$password) {
    return new WP_Error('missing_credentials', 'Username and password required', ['status' => 400]);
  }
  
  $user = wp_authenticate($username, $password);
  
  if (is_wp_error($user)) {
    return [
      'valid' => false,
      'error' => $user->get_error_message()
    ];
  }
  
  return [
    'valid' => true,
    'user_id' => $user->ID,
    'email' => $user->user_email,
    'display_name' => $user->display_name
  ];
}

// WooCommerce automation functions
function update_article_acf_fields($request) {
    $post_id = $request->get_param('post_id');
    $access = $request->get_param('access');
    $access_level = $request->get_param('access_level');
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

    if ($access_level) {
        update_field('access_level', $access_level, $post_id);
        $result['access_level'] = $access_level;
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

function sync_article_with_woocommerce($request) {
    $post_id = $request->get_param('post_id');
    
    if (!$post_id) {
        return new WP_Error('missing_post_id', 'Post ID required', ['status' => 400]);
    }
    
    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('post_not_found', 'Post not found', ['status' => 404]);
    }
    
    $access_level = get_field('access_level', $post_id) ?: get_field('access', $post_id);
    $price = get_field('price', $post_id);
    
    if ($access_level === 'premium' && $price && $price > 0) {
        $product_id = create_or_update_woocommerce_product($post_id, $post, $price);
        
        if ($product_id) {
            return [
                'success' => true,
                'post_id' => $post_id,
                'product_id' => $product_id,
                'message' => 'Produit WooCommerce créé/mis à jour avec succès'
            ];
        } else {
            return new WP_Error('product_creation_failed', 'Failed to create WooCommerce product', ['status' => 500]);
        }
    } else {
        return new WP_Error('invalid_article', 'Article must be premium with a valid price', ['status' => 400]);
    }
}

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

function test_params_debug($request) {
    return [
        'success' => true,
        'all_params' => $request->get_params(),
        'postId' => $request->get_param('postId'),
        'userId' => $request->get_param('userId'),
        'user_id' => $request->get_param('user_id'),
        'current_user_id' => get_current_user_id(),
        'request_method' => $request->get_method(),
        'request_uri' => $request->get_uri()
    ];
}

// =============================================================================
// WOOCOMMERCE AUTOMATION - HOOKS
// =============================================================================

add_action('save_post', 'handle_post_save', 10, 3);
add_action('before_delete_post', 'handle_post_delete');
add_action('transition_post_status', 'handle_post_status_change', 10, 3);
add_filter('manage_posts_columns', 'add_custom_article_columns');
add_action('manage_posts_custom_column', 'display_custom_article_columns', 10, 2);
add_action('admin_menu', 'add_woocommerce_admin_menu');
add_action('admin_head', 'add_custom_admin_styles');

function handle_post_save($post_id, $post, $update) {
    if ($post->post_type !== 'post') {
        return;
    }

    if (wp_is_post_revision($post_id)) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $access_level = get_field('access_level', $post_id) ?: get_field('access', $post_id);
    $price = get_field('price', $post_id);

    error_log("HelvetiForma: Article $post_id sauvegardé - Access: $access_level, Price: $price");

    if ($access_level === 'premium' && $price && $price > 0) {
        create_or_update_woocommerce_product($post_id, $post, $price);
    } else {
        delete_woocommerce_product($post_id);
    }
    
    wp_cache_delete('post_meta_' . $post_id, 'posts');
}

function handle_post_delete($post_id) {
    if (get_post_type($post_id) === 'post') {
        delete_woocommerce_product($post_id);
    }
}

function handle_post_status_change($new_status, $old_status, $post) {
    if ($post->post_type === 'post') {
        if ($new_status === 'publish' && $old_status !== 'publish') {
            $access_level = get_field('access_level', $post->ID) ?: get_field('access', $post->ID);
            $price = get_field('price', $post->ID);

            if ($access_level === 'premium' && $price && $price > 0) {
                create_or_update_woocommerce_product($post->ID, $post, $price);
            }
        } elseif ($new_status !== 'publish' && $old_status === 'publish') {
            delete_woocommerce_product($post->ID);
        }
    }
}

function create_or_update_woocommerce_product($post_id, $post, $price) {
    if (!class_exists('WooCommerce')) {
        error_log("HelvetiForma: WooCommerce n'est pas actif");
        return false;
    }

    $sku = "article-{$post_id}";
    $existing_product = wc_get_product_id_by_sku($sku);

    $product_data = array(
        'name' => $post->post_title,
        'type' => 'simple',
        'status' => $post->post_status === 'publish' ? 'publish' : 'draft',
        'featured' => false,
        'catalog_visibility' => 'visible',
        'description' => $post->post_content,
        'short_description' => wp_trim_words($post->post_excerpt, 20),
        'sku' => $sku,
        'regular_price' => $price,
        'manage_stock' => false,
        'stock_status' => 'instock',
        'virtual' => true,
        'downloadable' => false,
        'meta_data' => array(
            array('key' => '_post_id', 'value' => $post_id),
            array('key' => '_helvetiforma_article', 'value' => 'yes')
        )
    );

    if ($existing_product) {
        $product = wc_get_product($existing_product);
        if ($product) {
            $product->set_name($product_data['name']);
            $product->set_description($product_data['description']);
            $product->set_short_description($product_data['short_description']);
            $product->set_regular_price($product_data['regular_price']);
            $product->set_status($product_data['status']);
            $product->set_virtual($product_data['virtual']);
            $product->update_meta_data('_post_id', $post_id);
            $product->update_meta_data('_helvetiforma_article', 'yes');
            $product->save();

            error_log("HelvetiForma: Produit WooCommerce mis à jour - ID: {$existing_product}, SKU: $sku");
            return $existing_product;
        }
    } else {
        $product = new WC_Product_Simple();
        $product->set_name($product_data['name']);
        $product->set_description($product_data['description']);
        $product->set_short_description($product_data['short_description']);
        $product->set_sku($product_data['sku']);
        $product->set_regular_price($product_data['regular_price']);
        $product->set_status($product_data['status']);
        $product->set_virtual($product_data['virtual']);
        $product->set_manage_stock($product_data['manage_stock']);
        $product->set_stock_status($product_data['stock_status']);
        $product->add_meta_data('_post_id', $post_id);
        $product->add_meta_data('_helvetiforma_article', 'yes');

        $product_id = $product->save();

        if ($product_id) {
            error_log("HelvetiForma: Produit WooCommerce créé - ID: $product_id, SKU: $sku");
            update_field('woocommerce_product_id', $product_id, $post_id);
            return $product_id;
        }
    }

    return false;
}

function delete_woocommerce_product($post_id) {
    $sku = "article-{$post_id}";
    $product_id = wc_get_product_id_by_sku($sku);

    if ($product_id) {
        $product = wc_get_product($product_id);
        if ($product) {
            $product->delete(true);
            error_log("HelvetiForma: Produit WooCommerce supprimé - ID: $product_id, SKU: $sku");
            delete_field('woocommerce_product_id', $post_id);
        }
    }
}

function add_custom_article_columns($columns) {
    $new_columns = array();
    
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        
        if ($key === 'title') {
            $new_columns['access_level'] = 'Niveau d\'accès';
            $new_columns['price'] = 'Prix (CHF)';
        }
    }
    
    if (isset($new_columns['woocommerce_status'])) {
        unset($new_columns['woocommerce_status']);
    }
    $new_columns['woocommerce_status'] = 'Produit WooCommerce';
    
    return $new_columns;
}

function display_custom_article_columns($column, $post_id) {
    switch ($column) {
        case 'access_level':
            $access_level = get_field('access_level', $post_id) ?: get_field('access', $post_id) ?: 'public';
            $colors = [
                'public' => ['color' => '#0073aa', 'icon' => '🌐', 'text' => 'Public'],
                'members' => ['color' => '#00a32a', 'icon' => '👥', 'text' => 'Membres'],
                'premium' => ['color' => '#d63638', 'icon' => '💎', 'text' => 'Premium']
            ];
            
            $config = $colors[$access_level] ?? $colors['public'];
            
            echo sprintf(
                '<span style="color: %s; font-weight: bold;">%s %s</span>',
                $config['color'],
                $config['icon'],
                $config['text']
            );
            break;
            
        case 'price':
            $price = get_field('price', $post_id) ?: 0;
            
            if ($price > 0) {
                echo sprintf(
                    '<span style="color: #d63638; font-weight: bold;">%.2f CHF</span>',
                    floatval($price)
                );
            } else {
                echo '<span style="color: #666;">Gratuit</span>';
            }
            break;
            
        case 'woocommerce_status':
            $sku = "article-{$post_id}";
            $product_id = wc_get_product_id_by_sku($sku);
            $access_level = get_field('access_level', $post_id) ?: get_field('access', $post_id) ?: 'public';

            if ($product_id) {
                $product = wc_get_product($product_id);
                if ($product) {
                    $product_price = $product->get_regular_price();
                    echo '<div style="color: #00a32a;">';
                    echo '<span style="font-weight: bold;">✓ Produit créé</span><br>';
                    echo '<small>ID: ' . $product_id . '</small>';
                    if ($product_price) {
                        echo '<br><small>Prix: ' . $product_price . ' CHF</small>';
                    }
                    echo '</div>';
                }
            } else {
                if ($access_level === 'premium') {
                    echo '<span style="color: #d63638; font-weight: bold;">⚠ À synchroniser</span>';
                } else {
                    echo '<span style="color: #666;">-</span>';
                }
            }
            break;
    }
}

function add_woocommerce_admin_menu() {
    add_management_page(
        'HelvetiForma WooCommerce Sync',
        'WooCommerce Sync',
        'manage_options',
        'helvetiforma-wc-sync',
        'woocommerce_admin_page'
    );
}

function woocommerce_admin_page() {
    if (isset($_POST['sync_all_articles'])) {
        sync_all_articles();
        echo '<div class="notice notice-success"><p>Synchronisation terminée !</p></div>';
    }

    ?>
    <div class="wrap">
        <h1>HelvetiForma WooCommerce Synchronisation</h1>
        
        <div class="card">
            <h2>Synchronisation en lot</h2>
            <p>Synchronise tous les articles premium avec WooCommerce.</p>
            <form method="post">
                <input type="submit" name="sync_all_articles" class="button button-primary" value="Synchroniser tous les articles" onclick="return confirm('Êtes-vous sûr de vouloir synchroniser tous les articles ?');">
            </form>
        </div>
        
        <div class="card">
            <h2>Statistiques</h2>
            <?php
            $stats = get_sync_stats();
            echo "<p>Articles premium: {$stats['premium_articles']}</p>";
            echo "<p>Produits WooCommerce créés: {$stats['woocommerce_products']}</p>";
            echo "<p>Articles à synchroniser: {$stats['to_sync']}</p>";
            ?>
        </div>
    </div>
    <?php
}

function sync_all_articles() {
    $args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => 'access',
                'value' => 'premium',
                'compare' => '='
            )
        )
    );

    $posts = get_posts($args);
    $synced = 0;

    foreach ($posts as $post) {
        $price = get_field('price', $post->ID);
        if ($price && $price > 0) {
            create_or_update_woocommerce_product($post->ID, $post, $price);
            $synced++;
        }
    }

    error_log("HelvetiForma: Synchronisation terminée - $synced articles synchronisés");
}

function get_sync_stats() {
    $premium_args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => 'access',
                'value' => 'premium',
                'compare' => '='
            )
        )
    );

    $premium_posts = get_posts($premium_args);
    $premium_count = count($premium_posts);
    $wc_count = 0;
    $to_sync = 0;

    foreach ($premium_posts as $post) {
        $sku = "article-{$post->ID}";
        $product_id = wc_get_product_id_by_sku($sku);

        if ($product_id) {
            $wc_count++;
        } else {
            $to_sync++;
        }
    }

    return array(
        'premium_articles' => $premium_count,
        'woocommerce_products' => $wc_count,
        'to_sync' => $to_sync
    );
}

function add_custom_admin_styles() {
    ?>
    <style>
    .column-access_level { width: 120px; }
    .column-price { width: 100px; }
    .column-woocommerce_status { width: 150px; }
    </style>
    <?php
}

// =============================================================================
// TUTORLMS AUTOMATED ENROLLMENT
// =============================================================================

if (!class_exists('HelvetiForma_Tutor_Auto_Enrollment')) {
    class HelvetiForma_Tutor_Auto_Enrollment {
        
        public function __construct() {
            add_action('init', array($this, 'init'));
        }
        
        public function init() {
            // Hook into WooCommerce order completion
            add_action('woocommerce_order_status_completed', array($this, 'enroll_on_order_complete'), 10, 1);
            add_action('woocommerce_order_status_processing', array($this, 'enroll_on_order_complete'), 10, 1);
            add_action('woocommerce_payment_complete', array($this, 'enroll_on_payment_complete'), 10, 1);
            add_action('admin_notices', array($this, 'admin_notices'));
        }
        
        public function admin_notices() {
            if (!function_exists('tutor')) {
                ?>
                <div class="notice notice-error">
                    <p><strong>HelvetiForma TutorLMS Auto Enrollment:</strong> TutorLMS plugin is not active.</p>
                </div>
                <?php
            }
            
            if (!class_exists('WooCommerce')) {
                ?>
                <div class="notice notice-error">
                    <p><strong>HelvetiForma TutorLMS Auto Enrollment:</strong> WooCommerce plugin is not active.</p>
                </div>
                <?php
            }
        }
        
        public function enroll_on_order_complete($order_id) {
            error_log("HelvetiForma: Order #{$order_id} completed, checking for course enrollments...");
            
            $order = wc_get_order($order_id);
            if (!$order) {
                error_log("HelvetiForma: Order #{$order_id} not found");
                return;
            }
            
            $user_id = $order->get_user_id();
            if (!$user_id) {
                error_log("HelvetiForma: Order #{$order_id} has no user ID");
                return;
            }
            
            error_log("HelvetiForma: Processing order #{$order_id} for user #{$user_id}");
            
            $items = $order->get_items();
            
            foreach ($items as $item) {
                $product_id = $item->get_product_id();
                $product = wc_get_product($product_id);
                
                if (!$product) {
                    continue;
                }
                
                error_log("HelvetiForma: Checking product #{$product_id}");
                
                $course_id = $this->get_course_id_from_product($product_id);
                
                if ($course_id) {
                    error_log("HelvetiForma: Product #{$product_id} is linked to course #{$course_id}");
                    $this->enroll_student($user_id, $course_id, $order_id);
                } else {
                    error_log("HelvetiForma: Product #{$product_id} is not linked to any course");
                }
            }
        }
        
        public function enroll_on_payment_complete($order_id) {
            error_log("HelvetiForma: Payment complete for order #{$order_id}");
            $this->enroll_on_order_complete($order_id);
        }
        
        private function get_course_id_from_product($product_id) {
            // Method 1: Check _tutor_course_id meta
            $course_id = get_post_meta($product_id, '_tutor_course_id', true);
            if ($course_id) {
                return $course_id;
            }
            
            // Method 2: Check _related_course meta
            $course_id = get_post_meta($product_id, '_related_course', true);
            if ($course_id) {
                return $course_id;
            }
            
            // Method 3: Check course_id meta
            $course_id = get_post_meta($product_id, 'course_id', true);
            if ($course_id) {
                return $course_id;
            }
            
            // Method 4: Look for course referencing this product
            global $wpdb;
            $course_id = $wpdb->get_var($wpdb->prepare(
                "SELECT post_id FROM {$wpdb->postmeta} 
                WHERE meta_key = '_tutor_course_product_id' 
                AND meta_value = %d 
                LIMIT 1",
                $product_id
            ));
            
            return $course_id;
        }
        
        private function enroll_student($user_id, $course_id, $order_id = null) {
            if (!function_exists('tutor_utils')) {
                error_log("HelvetiForma: TutorLMS functions not available");
                return false;
            }
            
            if (tutor_utils()->is_enrolled($course_id, $user_id)) {
                error_log("HelvetiForma: User #{$user_id} is already enrolled in course #{$course_id}");
                return true;
            }
            
            $user = get_user_by('id', $user_id);
            if ($user && !in_array('tutor_student', $user->roles)) {
                $user->add_role('tutor_student');
                error_log("HelvetiForma: Added tutor_student role to user #{$user_id}");
            }
            
            try {
                global $wpdb;
                $table_name = $wpdb->prefix . 'tutor_enrolled';
                
                $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name;
                
                if ($table_exists) {
                    $enrollment_data = array(
                        'user_id' => $user_id,
                        'course_id' => $course_id,
                        'status' => 'enrolled',
                        'enrolled_at' => current_time('mysql')
                    );
                    
                    $result = $wpdb->insert(
                        $table_name,
                        $enrollment_data,
                        array('%d', '%d', '%s', '%s')
                    );
                    
                    if ($result) {
                        error_log("HelvetiForma: Successfully enrolled user #{$user_id} in course #{$course_id} via database");
                        
                        $enrolled_courses = get_user_meta($user_id, '_tutor_enrolled_courses', true);
                        if (!is_array($enrolled_courses)) {
                            $enrolled_courses = array();
                        }
                        
                        $enrolled_courses[] = array(
                            'course_id' => $course_id,
                            'enrolled_at' => $enrollment_data['enrolled_at'],
                            'status' => 'enrolled',
                            'order_id' => $order_id
                        );
                        
                        update_user_meta($user_id, '_tutor_enrolled_courses', $enrolled_courses);
                        
                        do_action('tutor_after_enrolled', $course_id, $user_id, $order_id);
                        
                        return true;
                    } else {
                        error_log("HelvetiForma: Failed to enroll user #{$user_id} in course #{$course_id} - Database error: " . $wpdb->last_error);
                    }
                } else {
                    error_log("HelvetiForma: Enrollment table does not exist");
                }
                
                if (function_exists('tutor_enroll_student')) {
                    tutor_enroll_student($course_id, $order_id, $user_id);
                    error_log("HelvetiForma: Enrolled user #{$user_id} in course #{$course_id} via tutor_enroll_student()");
                    return true;
                }
                
            } catch (Exception $e) {
                error_log("HelvetiForma: Enrollment error: " . $e->getMessage());
            }
            
            return false;
        }
    }

    // Initialize the plugin
    new HelvetiForma_Tutor_Auto_Enrollment();
}

// =============================================================================
// TUTOR LESSON METADATA API
// =============================================================================

if (!class_exists('TutorMetadataAPI')) {
    class TutorMetadataAPI {
        
        public function __construct() {
            add_action('rest_api_init', array($this, 'register_routes'));
        }
        
        public function register_routes() {
            register_rest_route('tutor/v1', '/lesson-metadata/(?P<id>\d+)', array(
                'methods' => 'GET',
                'callback' => array($this, 'get_lesson_metadata'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'type' => 'integer',
                        'sanitize_callback' => 'absint',
                    ),
                ),
            ));
        }
        
        public function get_lesson_metadata($request) {
            $lesson_id = $request->get_param('id');
            $all_meta = get_post_meta($lesson_id);
            
            $tutor_meta = array();
            $exercise_files = array();
            
            foreach ($all_meta as $key => $value) {
                if (strpos($key, 'tutor_') === 0) {
                    $tutor_meta[$key] = $value[0];
                    
                    if (in_array($key, array(
                        'tutor_lesson_exercise_files',
                        'tutor_lesson_files',
                        'tutor_attachments',
                        'tutor_exercise_files',
                        'tutor_lesson_attachments'
                    ))) {
                        $files = maybe_unserialize($value[0]);
                        if (is_array($files) && !empty($files)) {
                            $exercise_files = array_merge($exercise_files, $files);
                        }
                    }
                }
            }
            
            $processed_files = array();
            if (!empty($exercise_files)) {
                foreach ($exercise_files as $index => $file) {
                    if (is_string($file)) {
                        $processed_files[] = array(
                            'id' => $index + 1,
                            'title' => basename($file),
                            'url' => $file,
                            'mime_type' => $this->get_mime_type($file),
                            'file_size' => 0,
                        );
                    } elseif (is_array($file) && isset($file['url'])) {
                        $processed_files[] = array(
                            'id' => isset($file['id']) ? $file['id'] : $index + 1,
                            'title' => isset($file['title']) ? $file['title'] : basename($file['url']),
                            'url' => $file['url'],
                            'mime_type' => isset($file['mime_type']) ? $file['mime_type'] : $this->get_mime_type($file['url']),
                            'file_size' => isset($file['file_size']) ? $file['file_size'] : 0,
                        );
                    }
                }
            }
            
            return array(
                'lesson_id' => $lesson_id,
                'tutor_metadata' => $tutor_meta,
                'exercise_files' => $processed_files,
            );
        }
        
        private function get_mime_type($url) {
            $extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION);
            
            $mime_types = array(
                'pdf' => 'application/pdf',
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'mp4' => 'video/mp4',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
            );
            
            return isset($mime_types[strtolower($extension)]) ? $mime_types[strtolower($extension)] : 'application/octet-stream';
        }
    }

    // Initialize
    new TutorMetadataAPI();
}


