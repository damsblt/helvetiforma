<?php
/**
 * Fonctions WordPress complètes pour HelvetiForma
 * Inclut l'authentification, la gestion des articles et l'automatisation WooCommerce
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// ENDPOINTS D'AUTHENTIFICATION
// ============================================================================

add_action('rest_api_init', function() {
    // Endpoint pour vérifier les credentials utilisateur
    register_rest_route('helvetiforma/v1', '/verify-user', [
        'methods' => 'POST',
        'callback' => 'verify_user_credentials',
        'permission_callback' => '__return_true'
    ]);

    // Endpoint pour créer un utilisateur
    register_rest_route('helvetiforma/v1', '/register-user', [
        'methods' => 'POST',
        'callback' => 'register_user',
        'permission_callback' => '__return_true'
    ]);

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
});

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

function sync_article_with_woocommerce($request) {
    $post_id = $request->get_param('post_id');
    
    if (!$post_id) {
        return new WP_Error('missing_post_id', 'Post ID required', ['status' => 400]);
    }

    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('post_not_found', 'Post not found', ['status' => 404]);
    }

    $access_level = get_field('access', $post_id);
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

// ============================================================================
// AUTOMATISATION WOOCOMMERCE
// ============================================================================

// Hook pour créer/mettre à jour un produit WooCommerce quand un article est sauvegardé
add_action('save_post', 'handle_post_save', 10, 3);

// Hook pour supprimer le produit WooCommerce quand un article est supprimé
add_action('before_delete_post', 'handle_post_delete');

// Hook pour gérer les changements de statut d'article
add_action('transition_post_status', 'handle_post_status_change', 10, 3);

// Ajouter une colonne dans la liste des articles pour voir le statut WooCommerce
add_filter('manage_posts_columns', 'add_woocommerce_status_column');
add_action('manage_posts_custom_column', 'display_woocommerce_status_column', 10, 2);

// Ajouter un menu d'administration
add_action('admin_menu', 'add_woocommerce_admin_menu');

function handle_post_save($post_id, $post, $update) {
    // Vérifier que c'est un article (post)
    if ($post->post_type !== 'post') {
        return;
    }

    // Vérifier que ce n'est pas une révision
    if (wp_is_post_revision($post_id)) {
        return;
    }

    // Vérifier que l'utilisateur a les permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Récupérer les métadonnées ACF
    $access_level = get_field('access', $post_id);
    $price = get_field('price', $post_id);

    // Log pour debug
    error_log("HelvetiForma: Article $post_id sauvegardé - Access: $access_level, Price: $price");

    // Si c'est un article premium avec un prix, créer/mettre à jour le produit WooCommerce
    if ($access_level === 'premium' && $price && $price > 0) {
        create_or_update_woocommerce_product($post_id, $post, $price);
    } else {
        // Si ce n'est plus premium, supprimer le produit WooCommerce s'il existe
        delete_woocommerce_product($post_id);
    }
}

function handle_post_delete($post_id) {
    if (get_post_type($post_id) === 'post') {
        delete_woocommerce_product($post_id);
    }
}

function handle_post_status_change($new_status, $old_status, $post) {
    if ($post->post_type === 'post') {
        if ($new_status === 'publish' && $old_status !== 'publish') {
            // Article publié, vérifier s'il faut créer un produit WooCommerce
            $access_level = get_field('access', $post->ID);
            $price = get_field('price', $post->ID);

            if ($access_level === 'premium' && $price && $price > 0) {
                create_or_update_woocommerce_product($post->ID, $post, $price);
            }
        } elseif ($new_status !== 'publish' && $old_status === 'publish') {
            // Article dépublié, supprimer le produit WooCommerce
            delete_woocommerce_product($post->ID);
        }
    }
}

function create_or_update_woocommerce_product($post_id, $post, $price) {
    // Vérifier que WooCommerce est actif
    if (!class_exists('WooCommerce')) {
        error_log("HelvetiForma: WooCommerce n'est pas actif");
        return false;
    }

    $sku = "article-{$post_id}";

    // Chercher si un produit existe déjà avec ce SKU
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
        'virtual' => true, // Produit virtuel (pas de livraison physique)
        'downloadable' => false,
        'meta_data' => array(
            array(
                'key' => '_post_id',
                'value' => $post_id
            ),
            array(
                'key' => '_helvetiforma_article',
                'value' => 'yes'
            )
        )
    );

    if ($existing_product) {
        // Mettre à jour le produit existant
        $product = wc_get_product($existing_product);
        if ($product) {
            $product->set_name($product_data['name']);
            $product->set_description($product_data['description']);
            $product->set_short_description($product_data['short_description']);
            $product->set_regular_price($product_data['regular_price']);
            $product->set_status($product_data['status']);
            $product->set_virtual($product_data['virtual']);

            // Mettre à jour les métadonnées
            $product->update_meta_data('_post_id', $post_id);
            $product->update_meta_data('_helvetiforma_article', 'yes');

            $product->save();

            error_log("HelvetiForma: Produit WooCommerce mis à jour - ID: {$existing_product}, SKU: $sku");
            return $existing_product;
        }
    } else {
        // Créer un nouveau produit
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

        // Ajouter les métadonnées
        $product->add_meta_data('_post_id', $post_id);
        $product->add_meta_data('_helvetiforma_article', 'yes');

        $product_id = $product->save();

        if ($product_id) {
            error_log("HelvetiForma: Produit WooCommerce créé - ID: $product_id, SKU: $sku");

            // Mettre à jour l'article avec l'ID du produit WooCommerce
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
            $product->delete(true); // true = supprimer définitivement
            error_log("HelvetiForma: Produit WooCommerce supprimé - ID: $product_id, SKU: $sku");

            // Supprimer la référence dans l'article
            delete_field('woocommerce_product_id', $post_id);
        }
    }
}

function add_woocommerce_status_column($columns) {
    $columns['woocommerce_status'] = 'WooCommerce';
    return $columns;
}

function display_woocommerce_status_column($column, $post_id) {
    if ($column === 'woocommerce_status') {
        $sku = "article-{$post_id}";
        $product_id = wc_get_product_id_by_sku($sku);

        if ($product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                echo '<span style="color: green;">✓ Produit créé</span><br>';
                echo '<small>ID: ' . $product_id . '</small>';
            }
        } else {
            $access_level = get_field('access', $post_id);
            if ($access_level === 'premium') {
                echo '<span style="color: orange;">⚠ À synchroniser</span>';
            } else {
                echo '<span style="color: gray;">-</span>';
            }
        }
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
    // Compter les articles premium
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

    // Compter les produits WooCommerce créés
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
