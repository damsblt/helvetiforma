<?php
/**
 * Plugin Name: HelvetiForma WooCommerce Automation
 * Description: Automatise la création de produits WooCommerce basés sur les métadonnées ACF des articles
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiForma_WooCommerce_Automation {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Hook pour créer/mettre à jour un produit WooCommerce quand un article est sauvegardé
        add_action('save_post', array($this, 'handle_post_save'), 10, 3);
        
        // Hook pour supprimer le produit WooCommerce quand un article est supprimé
        add_action('before_delete_post', array($this, 'handle_post_delete'));
        
        // Hook pour gérer les changements de statut d'article
        add_action('transition_post_status', array($this, 'handle_post_status_change'), 10, 3);
        
        // Ajouter une colonne dans la liste des articles pour voir le statut WooCommerce
        add_filter('manage_posts_columns', array($this, 'add_woocommerce_status_column'));
        add_action('manage_posts_custom_column', array($this, 'display_woocommerce_status_column'), 10, 2);
        
        // Ajouter une action en lot pour synchroniser tous les articles
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    /**
     * Gère la sauvegarde d'un article
     */
    public function handle_post_save($post_id, $post, $update) {
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
            $this->create_or_update_woocommerce_product($post_id, $post, $price);
        } else {
            // Si ce n'est plus premium, supprimer le produit WooCommerce s'il existe
            $this->delete_woocommerce_product($post_id);
        }
    }
    
    /**
     * Gère la suppression d'un article
     */
    public function handle_post_delete($post_id) {
        if (get_post_type($post_id) === 'post') {
            $this->delete_woocommerce_product($post_id);
        }
    }
    
    /**
     * Gère les changements de statut d'article
     */
    public function handle_post_status_change($new_status, $old_status, $post) {
        if ($post->post_type === 'post') {
            if ($new_status === 'publish' && $old_status !== 'publish') {
                // Article publié, vérifier s'il faut créer un produit WooCommerce
                $access_level = get_field('access', $post->ID);
                $price = get_field('price', $post->ID);
                
                if ($access_level === 'premium' && $price && $price > 0) {
                    $this->create_or_update_woocommerce_product($post->ID, $post, $price);
                }
            } elseif ($new_status !== 'publish' && $old_status === 'publish') {
                // Article dépublié, supprimer le produit WooCommerce
                $this->delete_woocommerce_product($post->ID);
            }
        }
    }
    
    /**
     * Crée ou met à jour un produit WooCommerce
     */
    private function create_or_update_woocommerce_product($post_id, $post, $price) {
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
    
    /**
     * Supprime le produit WooCommerce associé à un article
     */
    private function delete_woocommerce_product($post_id) {
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
    
    /**
     * Ajoute une colonne pour le statut WooCommerce dans la liste des articles
     */
    public function add_woocommerce_status_column($columns) {
        $columns['woocommerce_status'] = 'WooCommerce';
        return $columns;
    }
    
    /**
     * Affiche le statut WooCommerce dans la colonne
     */
    public function display_woocommerce_status_column($column, $post_id) {
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
    
    /**
     * Ajoute un menu d'administration
     */
    public function add_admin_menu() {
        add_management_page(
            'HelvetiForma WooCommerce Sync',
            'WooCommerce Sync',
            'manage_options',
            'helvetiforma-wc-sync',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Page d'administration pour la synchronisation
     */
    public function admin_page() {
        if (isset($_POST['sync_all_articles'])) {
            $this->sync_all_articles();
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
                $stats = $this->get_sync_stats();
                echo "<p>Articles premium: {$stats['premium_articles']}</p>";
                echo "<p>Produits WooCommerce créés: {$stats['woocommerce_products']}</p>";
                echo "<p>Articles à synchroniser: {$stats['to_sync']}</p>";
                ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * Synchronise tous les articles premium
     */
    private function sync_all_articles() {
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
                $this->create_or_update_woocommerce_product($post->ID, $post, $price);
                $synced++;
            }
        }
        
        error_log("HelvetiForma: Synchronisation terminée - $synced articles synchronisés");
    }
    
    /**
     * Obtient les statistiques de synchronisation
     */
    private function get_sync_stats() {
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
}

// Initialiser le plugin
new HelvetiForma_WooCommerce_Automation();
