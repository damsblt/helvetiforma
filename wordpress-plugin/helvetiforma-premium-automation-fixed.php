<?php
/**
 * Plugin Name: HelvetiForma Premium Automation (Fixed)
 * Description: Crée automatiquement des produits WooCommerce pour les articles premium - Version corrigée
 * Version: 1.1.0
 * Author: HelvetiForma
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiForma_Premium_Automation_Fixed {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Vérifier que WooCommerce est actif
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
        
        // Hooks pour la création et mise à jour d'articles
        add_action('save_post', array($this, 'handle_post_save'), 10, 3);
        add_action('transition_post_status', array($this, 'handle_post_status_change'), 10, 3);
        
        // Hook pour la suppression d'articles
        add_action('before_delete_post', array($this, 'handle_post_delete'));
        
        // Ajouter les champs personnalisés nécessaires
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post', array($this, 'save_meta_boxes'));
        
        // Ajouter les colonnes dans la liste des articles
        add_filter('manage_posts_columns', array($this, 'add_post_columns'));
        add_action('manage_posts_custom_column', array($this, 'display_post_columns'), 10, 2);
        
        // Log de démarrage
        error_log('HelvetiForma Premium Automation: Plugin initialisé');
    }
    
    /**
     * Afficher un avertissement si WooCommerce n'est pas actif
     */
    public function woocommerce_missing_notice() {
        echo '<div class="notice notice-error"><p>';
        echo '<strong>HelvetiForma Premium Automation</strong> nécessite WooCommerce pour fonctionner.';
        echo '</p></div>';
    }
    
    /**
     * Gérer la sauvegarde d'un article
     */
    public function handle_post_save($post_id, $post, $update) {
        // Vérifier que c'est un article (post)
        if ($post->post_type !== 'post') {
            return;
        }
        
        // Vérifier les permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Vérifier que ce n'est pas une révision
        if (wp_is_post_revision($post_id)) {
            return;
        }
        
        // Log de debug
        error_log("HelvetiForma: Article sauvegardé - ID: {$post_id}, Titre: {$post->post_title}");
        
        // Récupérer les métadonnées directement depuis la base de données
        $access_level = get_post_meta($post_id, 'access_level', true);
        $price = get_post_meta($post_id, 'price', true);
        
        error_log("HelvetiForma: Métadonnées - access_level: {$access_level}, price: {$price}");
        
        // Vérifier si c'est un article premium
        if ($access_level === 'premium' && $price && $price > 0) {
            error_log("HelvetiForma: Article premium détecté - Création du produit WooCommerce");
            $this->create_or_update_woocommerce_product($post_id, $post, $price);
        } else {
            // Si ce n'est plus premium, supprimer le produit lié
            $this->delete_linked_woocommerce_product($post_id);
        }
    }
    
    /**
     * Gérer le changement de statut d'un article
     */
    public function handle_post_status_change($new_status, $old_status, $post) {
        if ($post->post_type !== 'post') {
            return;
        }
        
        error_log("HelvetiForma: Changement de statut - {$old_status} → {$new_status} pour l'article {$post->ID}");
        
        // Si l'article est publié et qu'il est premium
        if ($new_status === 'publish' && $old_status !== 'publish') {
            $access_level = get_post_meta($post->ID, 'access_level', true);
            $price = get_post_meta($post->ID, 'price', true);
            
            if ($access_level === 'premium' && $price && $price > 0) {
                error_log("HelvetiForma: Article premium publié - Création du produit WooCommerce");
                $this->create_or_update_woocommerce_product($post->ID, $post, $price);
            }
        }
        
        // Si l'article n'est plus publié, désactiver le produit
        if ($new_status !== 'publish' && $old_status === 'publish') {
            $this->disable_linked_woocommerce_product($post->ID);
        }
    }
    
    /**
     * Gérer la suppression d'un article
     */
    public function handle_post_delete($post_id) {
        $post = get_post($post_id);
        if ($post && $post->post_type === 'post') {
            error_log("HelvetiForma: Article supprimé - ID: {$post_id}");
            $this->delete_linked_woocommerce_product($post_id);
        }
    }
    
    /**
     * Créer ou mettre à jour un produit WooCommerce
     */
    private function create_or_update_woocommerce_product($post_id, $post, $price) {
        // Vérifier si un produit est déjà lié
        $existing_product_id = get_post_meta($post_id, 'woocommerce_product_id', true);
        
        if ($existing_product_id) {
            // Mettre à jour le produit existant
            error_log("HelvetiForma: Mise à jour du produit existant - ID: {$existing_product_id}");
            $this->update_woocommerce_product($existing_product_id, $post, $price);
        } else {
            // Créer un nouveau produit
            error_log("HelvetiForma: Création d'un nouveau produit WooCommerce");
            $this->create_woocommerce_product($post_id, $post, $price);
        }
    }
    
    /**
     * Créer un nouveau produit WooCommerce
     */
    private function create_woocommerce_product($post_id, $post, $price) {
        try {
            // Créer le produit
            $product = new WC_Product_Simple();
            $product->set_name($post->post_title);
            $product->set_description($post->post_content);
            $product->set_short_description(wp_trim_words($post->post_excerpt, 20));
            $product->set_regular_price($price);
            $product->set_virtual(true);
            $product->set_downloadable(false);
            $product->set_status('publish');
            $product->set_sku('article-' . $post_id);
            
            // Ajouter des métadonnées
            $product->add_meta_data('article_post_id', $post_id);
            $product->add_meta_data('article_type', 'premium');
            $product->add_meta_data('article_slug', $post->post_name);
            
            // Sauvegarder le produit
            $product_id = $product->save();
            
            if ($product_id) {
                // Lier le produit à l'article
                update_post_meta($post_id, 'woocommerce_product_id', $product_id);
                
                // Log de succès
                error_log("HelvetiForma: Produit WooCommerce créé avec succès - ID: {$product_id} pour l'article {$post_id}");
                
                // Notification admin
                add_action('admin_notices', function() use ($product_id, $post_id) {
                    echo '<div class="notice notice-success is-dismissible">';
                    echo '<p>✅ Produit WooCommerce créé automatiquement (ID: ' . $product_id . ') pour l\'article ' . $post_id . '</p>';
                    echo '</div>';
                });
            } else {
                error_log("HelvetiForma: Erreur lors de la création du produit WooCommerce pour l'article {$post_id}");
            }
        } catch (Exception $e) {
            error_log("HelvetiForma: Exception lors de la création du produit - " . $e->getMessage());
        }
    }
    
    /**
     * Mettre à jour un produit WooCommerce existant
     */
    private function update_woocommerce_product($product_id, $post, $price) {
        try {
            $product = wc_get_product($product_id);
            
            if (!$product) {
                error_log("HelvetiForma: Produit non trouvé - ID: {$product_id}");
                return;
            }
            
            $product->set_name($post->post_title);
            $product->set_description($post->post_content);
            $product->set_short_description(wp_trim_words($post->post_excerpt, 20));
            $product->set_regular_price($price);
            $product->set_status('publish');
            
            $product->save();
            
            error_log("HelvetiForma: Produit WooCommerce mis à jour - ID: {$product_id} pour l'article {$post->ID}");
        } catch (Exception $e) {
            error_log("HelvetiForma: Exception lors de la mise à jour du produit - " . $e->getMessage());
        }
    }
    
    /**
     * Désactiver un produit WooCommerce lié
     */
    private function disable_linked_woocommerce_product($post_id) {
        $product_id = get_post_meta($post_id, 'woocommerce_product_id', true);
        
        if ($product_id) {
            try {
                $product = wc_get_product($product_id);
                if ($product) {
                    $product->set_status('draft');
                    $product->save();
                    
                    error_log("HelvetiForma: Produit WooCommerce désactivé - ID: {$product_id} pour l'article {$post_id}");
                }
            } catch (Exception $e) {
                error_log("HelvetiForma: Exception lors de la désactivation du produit - " . $e->getMessage());
            }
        }
    }
    
    /**
     * Supprimer un produit WooCommerce lié
     */
    private function delete_linked_woocommerce_product($post_id) {
        $product_id = get_post_meta($post_id, 'woocommerce_product_id', true);
        
        if ($product_id) {
            try {
                // Supprimer le produit (mise en corbeille)
                wp_delete_post($product_id, true);
                
                // Supprimer la liaison
                delete_post_meta($post_id, 'woocommerce_product_id');
                
                error_log("HelvetiForma: Produit WooCommerce supprimé - ID: {$product_id} pour l'article {$post_id}");
            } catch (Exception $e) {
                error_log("HelvetiForma: Exception lors de la suppression du produit - " . $e->getMessage());
            }
        }
    }
    
    /**
     * Ajouter les boîtes de métadonnées
     */
    public function add_meta_boxes() {
        add_meta_box(
            'helvetiforma_premium_settings',
            'Paramètres Premium',
            array($this, 'premium_meta_box_callback'),
            'post',
            'side',
            'high'
        );
    }
    
    /**
     * Callback pour la boîte de métadonnées premium
     */
    public function premium_meta_box_callback($post) {
        wp_nonce_field('helvetiforma_premium_nonce', 'helvetiforma_premium_nonce');
        
        $access_level = get_post_meta($post->ID, 'access_level', true);
        $price = get_post_meta($post->ID, 'price', true);
        $product_id = get_post_meta($post->ID, 'woocommerce_product_id', true);
        
        echo '<table class="form-table">';
        echo '<tr>';
        echo '<th><label for="access_level">Niveau d\'accès</label></th>';
        echo '<td>';
        echo '<select name="access_level" id="access_level">';
        echo '<option value="public"' . selected($access_level, 'public', false) . '>Public</option>';
        echo '<option value="members"' . selected($access_level, 'members', false) . '>Membres</option>';
        echo '<option value="premium"' . selected($access_level, 'premium', false) . '>Premium</option>';
        echo '</select>';
        echo '</td>';
        echo '</tr>';
        
        echo '<tr>';
        echo '<th><label for="price">Prix (CHF)</label></th>';
        echo '<td>';
        echo '<input type="number" name="price" id="price" value="' . esc_attr($price) . '" step="0.01" min="0" />';
        echo '</td>';
        echo '</tr>';
        
        if ($product_id) {
            echo '<tr>';
            echo '<th>Produit WooCommerce</th>';
            echo '<td>';
            echo '<a href="' . admin_url('post.php?post=' . $product_id . '&action=edit') . '" target="_blank">';
            echo 'Voir le produit (ID: ' . $product_id . ')';
            echo '</a>';
            echo '</td>';
            echo '</tr>';
        }
        echo '</table>';
    }
    
    /**
     * Sauvegarder les métadonnées
     */
    public function save_meta_boxes($post_id) {
        // Vérifier les permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Vérifier le nonce
        if (!isset($_POST['helvetiforma_premium_nonce']) || 
            !wp_verify_nonce($_POST['helvetiforma_premium_nonce'], 'helvetiforma_premium_nonce')) {
            return;
        }
        
        // Sauvegarder les métadonnées
        if (isset($_POST['access_level'])) {
            update_post_meta($post_id, 'access_level', sanitize_text_field($_POST['access_level']));
        }
        
        if (isset($_POST['price'])) {
            update_post_meta($post_id, 'price', floatval($_POST['price']));
        }
    }
    
    /**
     * Ajouter des colonnes dans la liste des articles
     */
    public function add_post_columns($columns) {
        $columns['access_level'] = 'Niveau d\'accès';
        $columns['woocommerce_product'] = 'Produit WooCommerce';
        return $columns;
    }
    
    /**
     * Afficher le contenu des colonnes
     */
    public function display_post_columns($column, $post_id) {
        switch ($column) {
            case 'access_level':
                $access_level = get_post_meta($post_id, 'access_level', true);
                $price = get_post_meta($post_id, 'price', true);
                
                if ($access_level === 'premium') {
                    echo '<span style="color: #d63638; font-weight: bold;">💎 Premium</span>';
                    if ($price) {
                        echo '<br><small>' . $price . ' CHF</small>';
                    }
                } elseif ($access_level === 'members') {
                    echo '<span style="color: #d63638;">🔒 Membres</span>';
                } else {
                    echo '<span style="color: #00a32a;">🌐 Public</span>';
                }
                break;
                
            case 'woocommerce_product':
                $product_id = get_post_meta($post_id, 'woocommerce_product_id', true);
                if ($product_id) {
                    echo '<a href="' . admin_url('post.php?post=' . $product_id . '&action=edit') . '" target="_blank">';
                    echo 'Voir produit (ID: ' . $product_id . ')';
                    echo '</a>';
                } else {
                    echo '<span style="color: #666;">Aucun</span>';
                }
                break;
        }
    }
}

// Initialiser le plugin
new HelvetiForma_Premium_Automation_Fixed();
