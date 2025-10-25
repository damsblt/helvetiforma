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
/**
 * Adds theme support for post formats.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return void
 */
function twentytwentyfive_post_format_setup() {
	add_theme_support( 'post-formats', array( 'aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video' ) );
}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_post_format_setup' );

// Enqueues editor-style.css in the editors.
if ( ! function_exists( 'twentytwentyfive_editor_style' ) ) :
/**
 * Enqueues editor-style.css in the editors.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return void
 */
function twentytwentyfive_editor_style() {
	add_editor_style( 'assets/css/editor-style.css' );
}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_editor_style' );

// Enqueues style.css on the front.
if ( ! function_exists( 'twentytwentyfive_enqueue_styles' ) ) :
/**
 * Enqueues style.css on the front.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return void
 */
function twentytwentyfive_enqueue_styles() {
	wp_enqueue_style( 'twentytwentyfive-style', get_parent_theme_file_uri( 'style.css' ), array(), wp_get_theme()->get( 'Version' ) );
}
endif;
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_enqueue_styles' );

// Registers custom block styles.
if ( ! function_exists( 'twentytwentyfive_block_styles' ) ) :
/**
 * Registers custom block styles.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return void
 */
function twentytwentyfive_block_styles() {
	register_block_style(
		'core/list',
		array(
			'name'  => 'checkmark-list',
			'label' => __( 'Checkmark', 'twentytwentyfive' ),
			'inline_style' => '
				ul.is-style-checkmark-list {
					list-style-type: "\2713";
				}
				ul.is-style-checkmark-list li {
					padding-inline-start: 1ch;
				}
			',
		)
	);
}
endif;
add_action( 'init', 'twentytwentyfive_block_styles' );

// Registers pattern categories.
if ( ! function_exists( 'twentytwentyfive_pattern_categories' ) ) :
/**
 * Registers pattern categories.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return void
 */
function twentytwentyfive_pattern_categories() {
	register_block_pattern_category(
		'twentytwentyfive_page',
		array(
			'label' => __( 'Pages', 'twentytwentyfive' ),
			'description' => __( 'A collection of full page layouts.', 'twentytwentyfive' ),
		)
	);
	register_block_pattern_category(
		'twentytwentyfive_post-format',
		array(
			'label' => __( 'Post formats', 'twentytwentyfive' ),
			'description' => __( 'A collection of post format patterns.', 'twentytwentyfive' ),
		)
	);
}
endif;
add_action( 'init', 'twentytwentyfive_pattern_categories' );

// Registers block binding sources.
if ( ! function_exists( 'twentytwentyfive_register_block_bindings' ) ) :
/**
 * Registers the post format block binding source.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return void
 */
function twentytwentyfive_register_block_bindings() {
	register_block_bindings_source(
		'twentytwentyfive/format',
		array(
			'label' => _x( 'Post format name', 'Label for the block binding placeholder in the editor', 'twentytwentyfive' ),
			'get_value_callback' => 'twentytwentyfive_format_binding',
		)
	);
}
endif;
add_action( 'init', 'twentytwentyfive_register_block_bindings' );

// Registers block binding callback function for the post format name.
if ( ! function_exists( 'twentytwentyfive_format_binding' ) ) :
/**
 * Callback function for the post format name block binding source.
 *
 * @since Twenty Twenty-Five 1.0
 *
 * @return string|void Post format name, or nothing if the format is 'standard'.
 */
function twentytwentyfive_format_binding() {
	$post_format_slug = get_post_format();
	if ( $post_format_slug && 'standard' !== $post_format_slug ) {
		return get_post_format_string( $post_format_slug );
	}
}
endif;

// Add CORS headers for REST API authentication
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
});

// Alternative CORS method if the above doesn't work
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

/**
 * Endpoints personnalisés pour l'application HelvetiForma
 *
 * @since 1.0.0
 */

// Register custom REST API endpoints
add_action('rest_api_init', function () {
    // Endpoint pour récupérer tous les articles
    register_rest_route('helvetiforma/v1', '/posts', [
        'methods' => 'GET',
        'callback' => 'get_helvetiforma_posts',
        'permission_callback' => '__return_true'
    ]);

    // Endpoint pour récupérer un article par slug
    register_rest_route('helvetiforma/v1', '/posts/(?P<slug>[a-zA-Z0-9-]+)', [
        'methods' => 'GET',
        'callback' => 'get_helvetiforma_post_by_slug',
        'permission_callback' => '__return_true'
    ]);

    // Endpoint pour vérifier l'achat d'un utilisateur
    register_rest_route('helvetiforma/v1', '/check-purchase', [
        'methods' => 'GET',
        'callback' => 'check_user_purchase',
        'permission_callback' => '__return_true'
    ]);

    // Endpoints pour l'authentification
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

    // NOUVEAUX ENDPOINTS POUR L'AUTOMATISATION WOOCOMMERCE
    // Endpoint pour mettre à jour les champs ACF d'un article
    register_rest_route('helvetiforma/v1', '/update-article-acf', [
        'methods' => 'POST',
        'callback' => 'update_article_acf_fields',
        'permission_callback' => '__return_true'
    ]);

    // Endpoint pour synchroniser un article avec WooCommerce
    register_rest_route('helvetiforma/v1', '/sync-article', [
        'methods' => 'POST',
        'callback' => 'sync_article_with_woocommerce',
        'permission_callback' => '__return_true'
    ]);

    // Endpoint pour debug des champs ACF
    register_rest_route('helvetiforma/v1', '/debug-article', [
        'methods' => 'POST',
        'callback' => 'debug_article_acf',
        'permission_callback' => '__return_true'
    ]);

    // Endpoint de test pour debug des paramètres
    register_rest_route('helvetiforma/v1', '/test-params', [
        'methods' => 'GET',
        'callback' => 'test_params_debug',
        'permission_callback' => '__return_true'
    ]);
});

/**
 * Récupère tous les articles publiés
 *
 * @return array Liste des articles formatés
 */
function get_helvetiforma_posts() {
    $posts = get_posts([
        'post_type' => 'post',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    ]);

    // Ajouter les champs ACF à chaque post
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

/**
 * Récupère un article par son slug
 *
 * @param WP_REST_Request $request La requête REST
 * @return array|WP_Error L'article formaté ou une erreur
 */
function get_helvetiforma_post_by_slug($request) {
    $slug = $request['slug'];
    $post = get_page_by_path($slug, OBJECT, 'post');

    if (!$post) {
        return new WP_Error('not_found', 'Article non trouvé', ['status' => 404]);
    }

    return format_helvetiforma_post($post);
}

/**
 * Vérifie si un utilisateur a acheté un article
 *
 * @param WP_REST_Request $request La requête REST
 * @return array Informations sur l'achat
 */
function check_user_purchase($request) {
    $user_id = $request->get_param('userId') ?: get_current_user_id();
    $post_id = $request->get_param('postId');

    if (!$user_id) {
        return ['hasPurchased' => false, 'isAuthenticated' => false];
    }

    // Récupérer le SKU du produit WooCommerce lié à l'article
    $sku = "article-{$post_id}";

    // Chercher le produit WooCommerce par SKU
    $products = wc_get_products([
        'sku' => $sku,
        'limit' => 1
    ]);

    if (empty($products)) {
        return [
            'hasPurchased' => false,
            'isAuthenticated' => true,
            'debug' => 'Produit WooCommerce non trouvé'
        ];
    }

    $product = $products[0];
    $product_id = $product->get_id();

    // Vérifier si l'utilisateur a acheté ce produit
    $has_purchased = false;

    // Méthode 1: Utiliser wc_customer_bought_product si disponible
    if (function_exists('wc_customer_bought_product')) {
        $has_purchased = wc_customer_bought_product('', $user_id, $product_id);
    }

    // Méthode 2: Vérification directe dans les commandes si la méthode 1 échoue
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
        'isAuthenticated' => true,
        'debug' => [
            'post_id' => $post_id,
            'user_id' => $user_id,
            'product_id' => $product_id,
            'sku' => $sku,
            'method_1_result' => function_exists('wc_customer_bought_product') ? wc_customer_bought_product('', $user_id, $product_id) : 'function_not_available',
            'method_2_used' => !$has_purchased && function_exists('wc_customer_bought_product') ? 'yes' : 'no'
        ]
    ];
}

/**
 * Formate un article WordPress pour l'API HelvetiForma
 *
 * @param WP_Post $post L'article WordPress
 * @return array L'article formaté
 */
function format_helvetiforma_post($post) {
    // Récupérer les métadonnées via ACF en priorité, puis custom fields natifs
    $access_level = 'public';
    $product_id = null;
    $price = 0;

    // Essayer ACF d'abord - récupérer depuis l'objet post si disponible
    if (isset($post->acf) && is_array($post->acf)) {
        $access_level = $post->acf['access'] ?? $post->acf['accesss'] ?? 'public'; // Support des deux formats
        $product_id = $post->acf['woocommerce_product_id'] ?? $post->acf['woocommerce'] ?? null; // Support des deux formats
        $price = $post->acf['price'] ?? 0;
    } else if (function_exists('get_field')) {
        // Fallback vers get_field si ACF n'est pas dans l'objet
        $access_level = get_field('access', $post->ID) ?: get_field('accesss', $post->ID) ?: 'public';
        $product_id = get_field('woocommerce_product_id', $post->ID) ?: get_field('woocommerce', $post->ID);
        $price = get_field('price', $post->ID) ?: 0;
    }

    // Fallback vers custom fields natifs
    if (!$access_level || $access_level === 'public') {
        $access_level = get_post_meta($post->ID, 'access_level', true) ?: 'public';
    }
    if (!$product_id) {
        $product_id = get_post_meta($post->ID, 'woocommerce_product_id', true);
    }

    // Récupérer le prix depuis WooCommerce si un produit est lié
    if ($product_id) {
        $wc_price = get_post_meta($product_id, '_price', true) ?: get_post_meta($product_id, '_regular_price', true);
        if ($wc_price) {
            $price = $wc_price;
        }
    }

    // Si pas de prix trouvé, utiliser le prix ACF ou custom field
    if (!$price || $price == 0) {
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

// Ajouter les champs ACF au REST API si ACF est disponible
add_action('rest_api_init', function() {
    if (function_exists('get_fields')) {
        // Ajouter les champs ACF aux posts
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

    // Vérifier si l'utilisateur existe déjà
    if (username_exists($email) || email_exists($email)) {
        return new WP_Error('user_exists', 'User already exists', ['status' => 400]);
    }

    // Créer l'utilisateur
    $user_id = wp_create_user($email, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_Error('creation_failed', 'Failed to create user', ['status' => 500]);
    }

    // Mettre à jour les métadonnées
    wp_update_user([
        'ID' => $user_id,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'display_name' => $first_name . ' ' . $last_name
    ]);

    // Ajouter le rôle tutor_student
    $user = new WP_User($user_id);
    $user->set_role('tutor_student');

    return [
        'success' => true,
        'user_id' => $user_id,
        'message' => 'User created successfully'
    ];
}

function verify_user_credentials($request) {
    $email = $request->get_param('email');
    $password = $request->get_param('password');

    if (!$email || !$password) {
        return new WP_Error('missing_credentials', 'Email and password required', ['status' => 400]);
    }

    $user = wp_authenticate($email, $password);

    if (is_wp_error($user)) {
        return new WP_Error('invalid_credentials', 'Invalid credentials', ['status' => 401]);
    }

    return [
        'success' => true,
        'user_id' => $user->ID,
        'email' => $user->user_email,
        'display_name' => $user->display_name,
        'roles' => $user->roles
    ];
}

// =============================================================================
// TUTOR LMS ENROLLMENT CHECK ENDPOINT
// =============================================================================

// TUTOR LMS ENROLLMENT CHECK ENDPOINT
register_rest_route('tutor/v1', '/check-enrollment', [
    'methods' => 'GET',
    'callback' => 'tutor_check_enrollment_endpoint',
    'permission_callback' => '__return_true',
    'args' => [
        'user_id' => [
            'required' => true,
            'type' => 'integer',
            'sanitize_callback' => 'absint',
        ],
        'course_id' => [
            'required' => true,
            'type' => 'integer',
            'sanitize_callback' => 'absint',
        ],
    ],
]);

function tutor_check_enrollment_endpoint($request) {
    $user_id = $request->get_param('user_id');
    $course_id = $request->get_param('course_id');
    
    if (!$user_id || !$course_id) {
        return new WP_Error('missing_params', 'User ID and Course ID are required', ['status' => 400]);
    }
    
    // Check if user is enrolled in the course
    $is_enrolled = tutor_utils()->is_enrolled($course_id, $user_id);
    
    return [
        'is_enrolled' => $is_enrolled,
        'user_id' => $user_id,
        'course_id' => $course_id
    ];
}

// =============================================================================
// HELVETIFORMA TUTOR AUTO ENROLLMENT CLASS
// =============================================================================

if (!class_exists('HelvetiForma_Tutor_Auto_Enrollment')) {
    class HelvetiForma_Tutor_Auto_Enrollment {
        
        public function __construct() {
            // Hook into WooCommerce order completion
            add_action('woocommerce_order_status_completed', array($this, 'handle_order_completion'), 10, 1);
            add_action('woocommerce_payment_complete', array($this, 'handle_payment_complete'), 10, 1);
            
            // Hook into TutorLMS enrollment creation
            add_action('tutor_after_enrolled', array($this, 'handle_tutor_enrollment'), 10, 2);
            
            error_log("HelvetiForma: Auto enrollment class initialized");
        }
        
        /**
         * Handle WooCommerce order completion
         */
        public function handle_order_completion($order_id) {
            error_log("HelvetiForma: Order completed - ID: {$order_id}");
            
            $order = wc_get_order($order_id);
            if (!$order) {
                error_log("HelvetiForma: Order not found - ID: {$order_id}");
                return;
            }
            
            $customer_id = $order->get_customer_id();
            if (!$customer_id) {
                error_log("HelvetiForma: No customer ID for order - ID: {$order_id}");
                return;
            }
            
            // Check if this order contains course products
            $course_products = $this->get_course_products_from_order($order);
            
            if (empty($course_products)) {
                error_log("HelvetiForma: No course products found in order - ID: {$order_id}");
                return;
            }
            
            foreach ($course_products as $course_id) {
                $this->enroll_student($customer_id, $course_id, $order_id);
            }
        }
        
        /**
         * Handle WooCommerce payment completion
         */
        public function handle_payment_complete($order_id) {
            error_log("HelvetiForma: Payment completed - ID: {$order_id}");
            $this->handle_order_completion($order_id);
        }
        
        /**
         * Handle TutorLMS enrollment creation
         */
        public function handle_tutor_enrollment($course_id, $user_id) {
            error_log("HelvetiForma: TutorLMS enrollment created - Course: {$course_id}, User: {$user_id}");
            
            // Mark enrollment as completed (auto-approve)
            $this->mark_enrollment_completed($user_id, $course_id);
        }
        
        /**
         * Get course products from WooCommerce order
         */
        private function get_course_products_from_order($order) {
            $course_products = array();
            
            foreach ($order->get_items() as $item) {
                $product_id = $item->get_product_id();
                
                // Check if this product is linked to a course
                $course_id = $this->get_course_id_from_product($product_id);
                
                if ($course_id) {
                    $course_products[] = $course_id;
                    error_log("HelvetiForma: Found course product - Product: {$product_id}, Course: {$course_id}");
                }
            }
            
            return $course_products;
        }
        
        /**
         * Get course ID from WooCommerce product
         */
        private function get_course_id_from_product($product_id) {
            // Method 1: Check if product has course meta
            $course_id = get_post_meta($product_id, '_tutor_course_product_id', true);
            if ($course_id) {
                return $course_id;
            }
            
            // Method 2: Check if product title matches a course title
            $product = wc_get_product($product_id);
            if (!$product) {
                return false;
            }
            
            $product_title = $product->get_name();
            
            // Search for course with matching title
            $courses = get_posts(array(
                'post_type' => 'courses',
                'post_status' => 'publish',
                'posts_per_page' => -1,
                'meta_query' => array(
                    array(
                        'key' => '_tutor_course_product_id',
                        'value' => $product_id,
                        'compare' => '='
                    )
                )
            ));
            
            if (!empty($courses)) {
                return $courses[0]->ID;
            }
            
            // Method 3: Search by title similarity
            $courses = get_posts(array(
                'post_type' => 'courses',
                'post_status' => 'publish',
                'posts_per_page' => -1,
                's' => $product_title
            ));
            
            foreach ($courses as $course) {
                if (strpos($course->post_title, $product_title) !== false || 
                    strpos($product_title, $course->post_title) !== false) {
                    return $course->ID;
                }
            }
            
            return false;
        }
        
        /**
         * Enroll student in course
         */
        private function enroll_student($user_id, $course_id, $order_id = null) {
            if (!$user_id || !$course_id) {
                error_log("HelvetiForma: Missing user_id or course_id for enrollment");
                return false;
            }
            
            // Check if already enrolled
            if (tutor_utils()->is_enrolled($course_id, $user_id)) {
                error_log("HelvetiForma: User {$user_id} already enrolled in course {$course_id}");
                return true;
            }
            
            try {
                global $wpdb;
                $table_name = $wpdb->prefix . 'tutor_enrolled';
                
                $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name;
                
                if ($table_exists) {
                    // Check if enrollment already exists (might be pending)
                    $existing_enrollment = $wpdb->get_row($wpdb->prepare(
                        "SELECT * FROM {$table_name} WHERE user_id = %d AND course_id = %d",
                        $user_id,
                        $course_id
                    ));
                    
                    if ($existing_enrollment) {
                        // Update existing enrollment to 'completed' status (auto-approved)
                        $wpdb->update(
                            $table_name,
                            array(
                                'status' => 'completed',
                                'completed_at' => current_time('mysql')
                            ),
                            array(
                                'user_id' => $user_id,
                                'course_id' => $course_id
                            ),
                            array('%s', '%s'),
                            array('%d', '%d')
                        );
                        error_log("HelvetiForma: Updated enrollment status to 'completed' for user #{$user_id} in course #{$course_id}");
                    } else {
                        // Create new enrollment with 'completed' status (auto-approved)
                        $enrollment_data = array(
                            'user_id' => $user_id,
                            'course_id' => $course_id,
                            'status' => 'completed',
                            'enrolled_at' => current_time('mysql'),
                            'completed_at' => current_time('mysql')
                        );
                        
                        $result = $wpdb->insert(
                            $table_name,
                            $enrollment_data,
                            array('%d', '%d', '%s', '%s', '%s')
                        );
                        
                        if ($result) {
                            error_log("HelvetiForma: Successfully enrolled user #{$user_id} in course #{$course_id} with 'completed' status");
                        } else {
                            error_log("HelvetiForma: Failed to enroll user #{$user_id} in course #{$course_id} - Database error: " . $wpdb->last_error);
                            return false;
                        }
                    }
                    
                    // Update user meta for tracking
                    $enrollment_key = 'tutor_enrolled_courses';
                    $enrolled_courses = get_user_meta($user_id, $enrollment_key, true);
                    if (!is_array($enrolled_courses)) {
                        $enrolled_courses = array();
                    }
                    if (!in_array($course_id, $enrolled_courses)) {
                        $enrolled_courses[] = $course_id;
                        update_user_meta($user_id, $enrollment_key, $enrolled_courses);
                    }
                    
                    // Fire TutorLMS action
                    do_action('tutor_after_enrolled', $course_id, $user_id);
                    
                    return true;
                } else {
                    error_log("HelvetiForma: TutorLMS enrollment table not found");
                    
                    // Fallback: Use TutorLMS function if available
                    if (function_exists('tutor_enroll_student')) {
                        $result = tutor_enroll_student($user_id, $course_id);
                        if ($result) {
                            error_log("HelvetiForma: Fallback enrollment successful via tutor_enroll_student");
                            return true;
                        }
                    }
                }
            } catch (Exception $e) {
                error_log("HelvetiForma: Enrollment error: " . $e->getMessage());
            }
            
            return false;
        }
        
        /**
         * Mark enrollment as completed
         */
        private function mark_enrollment_completed($user_id, $course_id) {
            try {
                global $wpdb;
                $table_name = $wpdb->prefix . 'tutor_enrolled';
                
                $result = $wpdb->update(
                    $table_name,
                    array(
                        'status' => 'completed',
                        'completed_at' => current_time('mysql')
                    ),
                    array(
                        'user_id' => $user_id,
                        'course_id' => $course_id
                    ),
                    array('%s', '%s'),
                    array('%d', '%d')
                );
                
                if ($result !== false) {
                    error_log("HelvetiForma: Marked enrollment as completed for user #{$user_id} in course #{$course_id}");
                    return true;
                } else {
                    error_log("HelvetiForma: Failed to mark enrollment as completed - Database error: " . $wpdb->last_error);
                }
            } catch (Exception $e) {
                error_log("HelvetiForma: Error marking enrollment as completed: " . $e->getMessage());
            }
            
            return false;
        }
    }
}

// Initialize the auto enrollment class
new HelvetiForma_Tutor_Auto_Enrollment();

// =============================================================================
// TUTOR METADATA API CLASS
// =============================================================================

if (!class_exists('TutorMetadataAPI')) {
    class TutorMetadataAPI {
        
        public function __construct() {
            add_action('rest_api_init', array($this, 'register_routes'));
        }
        
        public function register_routes() {
            // Endpoint pour récupérer les métadonnées d'une leçon
            register_rest_route('tutor/v1', '/lesson-metadata/(?P<id>\d+)', [
                'methods' => 'GET',
                'callback' => array($this, 'get_lesson_metadata'),
                'permission_callback' => '__return_true',
                'args' => [
                    'id' => [
                        'required' => true,
                        'type' => 'integer',
                        'sanitize_callback' => 'absint',
                    ],
                ],
            ]);
        }
        
        public function get_lesson_metadata($request) {
            $lesson_id = $request->get_param('id');
            
            if (!$lesson_id) {
                return new WP_Error('missing_id', 'Lesson ID is required', ['status' => 400]);
            }
            
            $lesson = get_post($lesson_id);
            if (!$lesson || $lesson->post_type !== 'lesson') {
                return new WP_Error('lesson_not_found', 'Lesson not found', ['status' => 404]);
            }
            
            // Récupérer les métadonnées de la leçon
            $metadata = array(
                'id' => $lesson_id,
                'title' => $lesson->post_title,
                'content' => $lesson->post_content,
                'video' => get_post_meta($lesson_id, '_video', true),
                'attachments' => get_post_meta($lesson_id, '_attachments', true),
                'duration' => get_post_meta($lesson_id, '_duration', true),
                'is_preview' => get_post_meta($lesson_id, '_is_preview', true),
            );
            
            return $metadata;
        }
    }
}

// Initialize the metadata API class
new TutorMetadataAPI();

// =============================================================================
// HELVETIFORMA ARTICLE AUTOMATION CLASS
// =============================================================================

if (!class_exists('HelvetiForma_Article_Automation')) {
    class HelvetiForma_Article_Automation {
        
        public function __construct() {
            // Hook into article save to create/update WooCommerce products
            add_action('save_post', array($this, 'handle_article_save'), 10, 2);
            
            // Add purchase overlay to paid articles
            add_action('wp_footer', array($this, 'add_purchase_overlay'));
            
            // Add purchase verification script
            add_action('wp_enqueue_scripts', array($this, 'enqueue_purchase_scripts'));
            
            error_log("HelvetiForma: Article automation class initialized");
        }
        
        /**
         * Handle article save to create/update WooCommerce products
         */
        public function handle_article_save($post_id, $post) {
            // Only process articles
            if ($post->post_type !== 'post') {
                return;
            }
            
            // Skip autosaves and revisions
            if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
                return;
            }
            
            // Skip if not published
            if ($post->post_status !== 'publish') {
                return;
            }
            
            error_log("HelvetiForma: Processing article save for post ID: {$post_id}");
            
            // Get ACF fields
            $access_level = get_field('access', $post_id) ?: get_field('accesss', $post_id) ?: 'public';
            $price = get_field('price', $post_id) ?: 0;
            
            // Only process premium articles
            if ($access_level !== 'premium' || $price <= 0) {
                error_log("HelvetiForma: Article is not premium, skipping product creation");
                return;
            }
            
            // Check if product already exists
            $existing_product_id = get_post_meta($post_id, 'woocommerce_product_id', true);
            
            // Create or update product (handles both cases)
            $product_id = $this->create_woocommerce_product($post, $price);
            if ($product_id) {
                error_log("HelvetiForma: WooCommerce product processed: {$product_id}");
            }
        }
        
        /**
         * Create WooCommerce product for article
         */
        private function create_woocommerce_product($post, $price) {
            if (!class_exists('WooCommerce')) {
                error_log("HelvetiForma: WooCommerce not available for product creation");
                return false;
            }
            
            $sku = "article-{$post->ID}";
            
            // Check if product already exists
            $existing_product = wc_get_product_id_by_sku($sku);
            
            if ($existing_product) {
                // Update existing product
                $product = wc_get_product($existing_product);
                if ($product) {
                    $product->set_name($post->post_title);
                    $product->set_description($post->post_content);
                    $product->set_short_description(wp_trim_words($post->post_excerpt, 20));
                    $product->set_regular_price($price);
                    $product->set_status($post->post_status === 'publish' ? 'publish' : 'draft');
                    $product->set_virtual(true);
                    
                    // Update metadata
                    $product->update_meta_data('_post_id', $post->ID);
                    $product->update_meta_data('_helvetiforma_article', 'yes');
                    
                    $product->save();
                    
                    error_log("HelvetiForma: Product updated - ID: {$existing_product}, SKU: $sku");
                    return $existing_product;
                }
            } else {
                // Create new product
                $product = new WC_Product_Simple();
                $product->set_name($post->post_title);
                $product->set_description($post->post_content);
                $product->set_short_description(wp_trim_words($post->post_excerpt, 20));
                $product->set_sku($sku);
                $product->set_regular_price($price);
                $product->set_status($post->post_status === 'publish' ? 'publish' : 'draft');
                $product->set_virtual(true);
                $product->set_manage_stock(false);
                $product->set_stock_status('instock');
                
                // Add metadata
                $product->add_meta_data('_post_id', $post->ID);
                $product->add_meta_data('_helvetiforma_article', 'yes');
                
                $product_id = $product->save();
                
                if ($product_id) {
                    error_log("HelvetiForma: Product created - ID: $product_id, SKU: $sku");
                    
                    // Update article with WooCommerce product ID
                    update_field('woocommerce_product_id', $product_id, $post->ID);
                    
                    return $product_id;
                }
            }
            
            return false;
        }
        
        
        /**
         * Add purchase overlay to paid articles
         */
        public function add_purchase_overlay() {
            if (!is_single() || get_post_type() !== 'post') {
                return;
            }
            
            $post_id = get_the_ID();
            $access_level = get_field('access', $post_id) ?: get_field('accesss', $post_id) ?: 'public';
            $price = get_field('price', $post_id) ?: 0;
            
            if ($access_level !== 'premium' || $price <= 0) {
                return;
            }
            
            // Check if user has purchased this article
            $user_id = get_current_user_id();
            $has_purchased = false;
            
            if ($user_id) {
                $has_purchased = $this->check_article_purchase($user_id, $post_id);
            }
            
            if (!$has_purchased) {
                ?>
                <div id="helvetiforma-purchase-overlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        text-align: center;
                        max-width: 500px;
                        margin: 20px;
                    ">
                        <h2 style="color: #333; margin-bottom: 20px;">
                            Article Premium
                        </h2>
                        <p style="color: #666; margin-bottom: 30px;">
                            Cet article est réservé aux abonnés. Achetez-le pour y accéder.
                        </p>
                        <div style="
                            font-size: 24px;
                            font-weight: bold;
                            color: #007cba;
                            margin-bottom: 30px;
                        ">
                            <?php echo number_format($price, 2); ?> CHF
                        </div>
                        <button id="helvetiforma-purchase-btn" style="
                            background: #007cba;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 5px;
                            font-size: 16px;
                            cursor: pointer;
                            margin-right: 10px;
                        ">
                            Acheter maintenant
                        </button>
                        <button id="helvetiforma-login-btn" style="
                            background: #666;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 5px;
                            font-size: 16px;
                            cursor: pointer;
                        ">
                            Se connecter
                        </button>
                    </div>
                </div>
                
                <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const purchaseBtn = document.getElementById('helvetiforma-purchase-btn');
                    const loginBtn = document.getElementById('helvetiforma-login-btn');
                    const overlay = document.getElementById('helvetiforma-purchase-overlay');
                    
                    if (purchaseBtn) {
                        purchaseBtn.addEventListener('click', function() {
                            // Redirect to purchase page or handle purchase
                            window.location.href = '<?php echo home_url('/purchase?article_id=' . $post_id); ?>';
                        });
                    }
                    
                    if (loginBtn) {
                        loginBtn.addEventListener('click', function() {
                            // Redirect to login page
                            window.location.href = '<?php echo wp_login_url(get_permalink()); ?>';
                        });
                    }
                });
                </script>
                <?php
            }
        }
        
        /**
         * Enqueue purchase verification scripts
         */
        public function enqueue_purchase_scripts() {
            if (is_single() && get_post_type() === 'post') {
                wp_enqueue_script('helvetiforma-purchase', plugin_dir_url(__FILE__) . 'js/purchase-verification.js', array('jquery'), '1.0.0', true);
                wp_localize_script('helvetiforma-purchase', 'helvetiforma_ajax', array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('helvetiforma_purchase_nonce')
                ));
            }
        }
        
        /**
         * Check if user has purchased article
         */
        private function check_article_purchase($user_id, $post_id) {
            $product_id = get_post_meta($post_id, 'woocommerce_product_id', true);
            if (!$product_id) {
                return false;
            }
            
            // Check if user has purchased this product
            if (function_exists('wc_customer_bought_product')) {
                return wc_customer_bought_product('', $user_id, $product_id);
            }
            
            // Fallback: Check orders directly
            $orders = wc_get_orders(array(
                'customer_id' => $user_id,
                'status' => 'completed',
                'limit' => -1
            ));
            
            foreach ($orders as $order) {
                foreach ($order->get_items() as $item) {
                    if ($item->get_product_id() == $product_id) {
                        return true;
                    }
                }
            }
            
            return false;
        }
    }
}

// Initialize the article automation class
new HelvetiForma_Article_Automation();
