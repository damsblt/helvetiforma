<?php
/**
 * Plugin Name: HelvetiForma Working Solution
 * Description: Complete article-product automation with proper ACF integration
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiForma_Working_Solution {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Hook into post save events
        add_action('save_post', array($this, 'handle_post_save'), 10, 3);
        add_action('acf/save_post', array($this, 'handle_acf_save'), 20);
        add_action('before_delete_post', array($this, 'handle_post_delete'));
        add_action('transition_post_status', array($this, 'handle_status_change'), 10, 3);
        
        // Add admin columns
        add_filter('manage_posts_columns', array($this, 'add_custom_article_columns'));
        add_action('manage_posts_custom_column', array($this, 'display_custom_article_columns'), 10, 2);
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_head', array($this, 'add_custom_admin_styles'));
    }
    
    public function handle_post_save($post_id, $post, $update) {
        // Only process posts
        if ($post->post_type !== 'post') {
            return;
        }
        
        // Skip autosaves and revisions
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return;
        }
        
        // Only process published posts
        if ($post->post_status !== 'publish') {
            return;
        }
        
        $this->sync_article_with_woocommerce($post_id, $post);
    }
    
    public function handle_acf_save($post_id) {
        // Only process posts
        if (get_post_type($post_id) !== 'post') {
            return;
        }
        
        // Skip autosaves and revisions
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return;
        }
        
        $post = get_post($post_id);
        if (!$post || $post->post_status !== 'publish') {
            return;
        }
        
        $this->sync_article_with_woocommerce($post_id, $post);
    }
    
    public function handle_post_delete($post_id) {
        if (get_post_type($post_id) === 'post') {
            $this->delete_woocommerce_product($post_id);
        }
    }
    
    public function handle_status_change($new_status, $old_status, $post) {
        if ($post->post_type === 'post') {
            if ($new_status === 'publish' && $old_status !== 'publish') {
                $this->sync_article_with_woocommerce($post->ID, $post);
            } elseif ($new_status !== 'publish' && $old_status === 'publish') {
                $this->delete_woocommerce_product($post->ID);
            }
        }
    }
    
    private function sync_article_with_woocommerce($post_id, $post) {
        // Get ACF fields
        $access_level = get_field('access', $post_id) ?: 'public';
        $price = get_field('price', $post_id) ?: 0;
        
        error_log("HelvetiForma: Syncing post $post_id - Access: $access_level, Price: $price");
        
        if ($access_level === 'premium' && $price > 0) {
            $this->create_or_update_woocommerce_product($post_id, $post, $price);
        } else {
            $this->delete_woocommerce_product($post_id);
        }
    }
    
    private function create_or_update_woocommerce_product($post_id, $post, $price) {
        if (!class_exists('WooCommerce')) {
            error_log("HelvetiForma: WooCommerce not active");
            return false;
        }

        $sku = "article-{$post_id}";
        $existing_product = $this->get_woocommerce_product_id($sku);

        // Get featured image
        $featured_image_id = get_post_thumbnail_id($post_id);
        $featured_image_url = '';
        if ($featured_image_id) {
            $featured_image_url = wp_get_attachment_url($featured_image_id);
        }

        $product_data = array(
            'name' => $post->post_title,
            'type' => 'simple',
            'status' => 'publish',
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
            'images' => $featured_image_id ? array(
                array(
                    'id' => $featured_image_id,
                    'src' => $featured_image_url,
                    'name' => get_the_title($featured_image_id),
                    'alt' => get_post_meta($featured_image_id, '_wp_attachment_image_alt', true)
                )
            ) : array(),
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
                
                // Update featured image
                if ($featured_image_id) {
                    $product->set_image_id($featured_image_id);
                }
                
                $product->update_meta_data('_post_id', $post_id);
                $product->update_meta_data('_helvetiforma_article', 'yes');
                $product->save();

                error_log("HelvetiForma: Product updated - ID: {$existing_product}, SKU: $sku" . ($featured_image_id ? ", Image: $featured_image_id" : ""));
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
            
            // Set featured image
            if ($featured_image_id) {
                $product->set_image_id($featured_image_id);
            }
            
            $product->add_meta_data('_post_id', $post_id);
            $product->add_meta_data('_helvetiforma_article', 'yes');

            $product_id = $product->save();

            if ($product_id) {
                error_log("HelvetiForma: Product created - ID: $product_id, SKU: $sku" . ($featured_image_id ? ", Image: $featured_image_id" : ""));
                return $product_id;
            }
        }

        return false;
    }
    
    private function delete_woocommerce_product($post_id) {
        $sku = "article-{$post_id}";
        $product_id = $this->get_woocommerce_product_id($sku);

        if ($product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                $product->delete(true);
                error_log("HelvetiForma: Product deleted - ID: $product_id, SKU: $sku");
            }
        }
    }
    
    public function add_custom_article_columns($columns) {
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
    
    public function display_custom_article_columns($column, $post_id) {
        switch ($column) {
            case 'access_level':
                $access_level = get_field('access', $post_id) ?: 'public';
                $colors = array(
                    'public' => array('color' => '#0073aa', 'icon' => '🌐', 'text' => 'Public'),
                    'members' => array('color' => '#00a32a', 'icon' => '👥', 'text' => 'Membres'),
                    'premium' => array('color' => '#d63638', 'icon' => '💎', 'text' => 'Premium')
                );
                
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
                $product_id = $this->get_woocommerce_product_id($sku);
                $access_level = get_field('access', $post_id) ?: 'public';

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
                    } else {
                        echo '<span style="color: #d63638; font-weight: bold;">⚠ Produit introuvable</span>';
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
    
    private function get_woocommerce_product_id($sku) {
        if (!class_exists('WooCommerce')) {
            return false;
        }
        
        // Method 1: Try WooCommerce function
        $product_id = wc_get_product_id_by_sku($sku);
        if ($product_id) {
            return $product_id;
        }
        
        // Method 2: Direct database query
        global $wpdb;
        $product_id = $wpdb->get_var($wpdb->prepare(
            "SELECT p.ID FROM {$wpdb->posts} p
             INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
             WHERE p.post_type = 'product' 
             AND p.post_status = 'publish'
             AND pm.meta_key = '_sku' 
             AND pm.meta_value = %s
             LIMIT 1",
            $sku
        ));
        
        if ($product_id) {
            return $product_id;
        }
        
        // Method 3: Search by meta data with _post_id
        $post_id = str_replace('article-', '', $sku);
        $product_id = $wpdb->get_var($wpdb->prepare(
            "SELECT p.ID FROM {$wpdb->posts} p
             INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
             WHERE p.post_type = 'product' 
             AND p.post_status = 'publish'
             AND pm.meta_key = '_post_id' 
             AND pm.meta_value = %s
             LIMIT 1",
            $post_id
        ));
        
        return $product_id ?: false;
    }
    
    public function add_admin_menu() {
        add_management_page(
            'HelvetiForma Automation',
            'HelvetiForma Automation',
            'manage_options',
            'helvetiforma-automation',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['sync_all_articles'])) {
            $this->sync_all_articles();
        }
        
        if (isset($_POST['sync_single_article'])) {
            $post_id = intval($_POST['post_id']);
            $this->sync_single_article($post_id);
        }
        
        if (isset($_POST['test_product_detection'])) {
            $post_id = intval($_POST['test_post_id']);
            $this->test_product_detection($post_id);
        }
        ?>
        <div class="wrap">
            <h1>HelvetiForma Working Solution</h1>
            
            <div class="card">
                <h2>Single Article Sync</h2>
                <p>Sync a specific article with WooCommerce.</p>
                <form method="post">
                    <input type="number" name="post_id" placeholder="Post ID" required>
                    <input type="submit" name="sync_single_article" class="button button-secondary" value="Sync Article">
                </form>
            </div>
            
            <div class="card">
                <h2>Test Product Detection</h2>
                <p>Test if the plugin can detect existing WooCommerce products.</p>
                <form method="post">
                    <input type="number" name="test_post_id" placeholder="Post ID (e.g., 4576)" required>
                    <input type="submit" name="test_product_detection" class="button button-secondary" value="Test Detection">
                </form>
            </div>
            
            <div class="card">
                <h2>Bulk Sync</h2>
                <p>Sync all published articles with WooCommerce products.</p>
                <form method="post" onsubmit="return confirm('Are you sure you want to sync all articles?');">
                    <input type="submit" name="sync_all_articles" class="button button-secondary" value="Sync All Articles">
                </form>
            </div>
            
            <div class="card">
                <h2>Article Statistics</h2>
                <?php
                $stats = $this->get_article_stats();
                echo "<p>Total Articles: {$stats['total']}</p>";
                echo "<p>Premium Articles: {$stats['premium']}</p>";
                echo "<p>Articles with Products: {$stats['with_products']}</p>";
                echo "<p>Articles to Sync: {$stats['to_sync']}</p>";
                ?>
            </div>
        </div>
        <?php
    }
    
    public function add_custom_admin_styles() {
        ?>
        <style>
        .column-access_level { width: 120px; }
        .column_price { width: 100px; }
        .column_woocommerce_status { width: 150px; }
        </style>
        <?php
    }
    
    private function sync_all_articles() {
        $posts = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => -1
        ));
        
        $synced = 0;
        foreach ($posts as $post) {
            $this->sync_article_with_woocommerce($post->ID, $post);
            $synced++;
        }
        
        echo '<div class="notice notice-success"><p>Sent sync for ' . $synced . ' articles!</p></div>';
    }
    
    private function sync_single_article($post_id) {
        $post = get_post($post_id);
        if ($post) {
            $this->sync_article_with_woocommerce($post_id, $post);
            echo '<div class="notice notice-success"><p>Article ' . $post_id . ' synced!</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>Post not found!</p></div>';
        }
    }
    
    private function test_product_detection($post_id) {
        $post = get_post($post_id);
        if (!$post) {
            echo '<div class="notice notice-error"><p>Post not found!</p></div>';
            return;
        }
        
        $sku = "article-{$post_id}";
        $access_level = get_field('access', $post_id) ?: 'public';
        $price = get_field('price', $post_id) ?: 0;
        
        echo '<div class="notice notice-info">';
        echo '<h3>Debug Information for Post ID: ' . $post_id . '</h3>';
        echo '<p><strong>Title:</strong> ' . esc_html($post->post_title) . '</p>';
        echo '<p><strong>SKU:</strong> ' . esc_html($sku) . '</p>';
        echo '<p><strong>Access Level:</strong> ' . esc_html($access_level) . '</p>';
        echo '<p><strong>Price:</strong> ' . esc_html($price) . '</p>';
        
        // Test product detection
        $product_id = $this->get_woocommerce_product_id($sku);
        echo '<p><strong>Detected Product ID:</strong> ' . ($product_id ?: 'None') . '</p>';
        
        if ($product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                echo '<p><strong>Product Name:</strong> ' . esc_html($product->get_name()) . '</p>';
                echo '<p><strong>Product Price:</strong> ' . esc_html($product->get_regular_price()) . '</p>';
                echo '<p><strong>Product Status:</strong> ' . esc_html($product->get_status()) . '</p>';
            } else {
                echo '<p><strong>Error:</strong> Product found but cannot load</p>';
            }
        }
        
        // Test WooCommerce function directly
        if (function_exists('wc_get_product_id_by_sku')) {
            $wc_product_id = wc_get_product_id_by_sku($sku);
            echo '<p><strong>WooCommerce Function Result:</strong> ' . ($wc_product_id ?: 'None') . '</p>';
        }
        
        echo '</div>';
    }
    
    private function get_article_stats() {
        $total = wp_count_posts('post')->publish;
        
        $premium = 0;
        $with_products = 0;
        
        $posts = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => -1
        ));
        
        foreach ($posts as $post) {
            $access_level = get_field('access', $post->ID) ?: 'public';
            if ($access_level === 'premium') {
                $premium++;
                
                $sku = "article-{$post->ID}";
                $product_id = $this->get_woocommerce_product_id($sku);
                if ($product_id) {
                    $with_products++;
                }
            }
        }
        
        return array(
            'total' => $total,
            'premium' => $premium,
            'with_products' => $with_products,
            'to_sync' => $premium - $with_products
        );
    }
}

// Initialize the plugin
new HelvetiForma_Working_Solution();
