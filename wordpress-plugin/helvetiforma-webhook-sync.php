<?php
/**
 * Plugin Name: HelvetiForma Webhook Sync
 * Description: Automatically sync articles with WooCommerce products via webhooks
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiForma_Webhook_Sync {
    
    private $webhook_url;
    private $webhook_secret;
    
    public function __construct() {
        $this->webhook_url = 'https://helvetiforma.ch/api/webhooks/wordpress';
        $this->webhook_secret = 'helvetiforma-webhook-secret-2025-db1991';
        
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Hook into post save events
        add_action('save_post', array($this, 'handle_post_save'), 10, 3);
        add_action('acf/save_post', array($this, 'handle_acf_save'), 20);
        add_action('before_delete_post', array($this, 'handle_post_delete'));
        add_action('transition_post_status', array($this, 'handle_status_change'), 10, 3);
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
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
        
        $this->send_webhook('post_updated', $post_id, $post);
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
        
        $this->send_webhook('post_updated', $post_id, $post);
    }
    
    public function handle_post_delete($post_id) {
        if (get_post_type($post_id) === 'post') {
            $this->send_webhook('post_deleted', $post_id);
        }
    }
    
    public function handle_status_change($new_status, $old_status, $post) {
        if ($post->post_type === 'post') {
            if ($new_status === 'publish' && $old_status !== 'publish') {
                $this->send_webhook('post_created', $post->ID, $post);
            } elseif ($new_status !== 'publish' && $old_status === 'publish') {
                $this->send_webhook('post_deleted', $post->ID);
            }
        }
    }
    
    private function send_webhook($action, $post_id, $post = null) {
        $data = array(
            'action' => $action,
            'post_id' => $post_id,
            'timestamp' => current_time('mysql'),
            'site_url' => get_site_url()
        );
        
        if ($post) {
            $data['post_title'] = $post->post_title;
            $data['post_content'] = $post->post_content;
            $data['post_status'] = $post->post_status;
        }
        
        // Get ACF data
        if (function_exists('get_fields')) {
            $acf_data = get_fields($post_id);
            $data['acf_data'] = $acf_data ?: array();
        } else {
            $data['acf_data'] = array();
        }
        
        // Send webhook
        $response = wp_remote_post($this->webhook_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->webhook_secret
            ),
            'body' => json_encode($data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            error_log('HelvetiForma Webhook Error: ' . $response->get_error_message());
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            
            if ($response_code >= 200 && $response_code < 300) {
                error_log("HelvetiForma Webhook Success: {$action} for post {$post_id}");
            } else {
                error_log("HelvetiForma Webhook Failed: {$action} for post {$post_id} - Code: {$response_code}, Body: {$response_body}");
            }
        }
    }
    
    public function add_admin_menu() {
        add_management_page(
            'HelvetiForma Webhook Sync',
            'Webhook Sync',
            'manage_options',
            'helvetiforma-webhook-sync',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['test_webhook'])) {
            $this->test_webhook();
        }
        
        if (isset($_POST['sync_all_articles'])) {
            $this->sync_all_articles();
        }
        ?>
        <div class="wrap">
            <h1>HelvetiForma Webhook Sync</h1>
            
            <div class="card">
                <h2>Webhook Configuration</h2>
                <p><strong>Webhook URL:</strong> <?php echo esc_html($this->webhook_url); ?></p>
                <p><strong>Status:</strong> <span id="webhook-status">Checking...</span></p>
                
                <form method="post">
                    <input type="submit" name="test_webhook" class="button button-primary" value="Test Webhook">
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
                <h2>Recent Activity</h2>
                <p>Check the WordPress error log for webhook activity.</p>
                <p><code>tail -f /path/to/wordpress/wp-content/debug.log | grep "HelvetiForma"</code></p>
            </div>
        </div>
        
        <script>
        // Check webhook status
        fetch('<?php echo $this->webhook_url; ?>')
            .then(response => response.json())
            .then(data => {
                document.getElementById('webhook-status').innerHTML = 
                    '<span style="color: green;">✓ Active</span>';
            })
            .catch(error => {
                document.getElementById('webhook-status').innerHTML = 
                    '<span style="color: red;">✗ Error</span>';
            });
        </script>
        <?php
    }
    
    private function test_webhook() {
        $test_post = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => 1
        ));
        
        if (!empty($test_post)) {
            $this->send_webhook('test', $test_post[0]->ID, $test_post[0]);
            echo '<div class="notice notice-success"><p>Test webhook sent!</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>No published posts found for testing.</p></div>';
        }
    }
    
    private function sync_all_articles() {
        $posts = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => -1
        ));
        
        $synced = 0;
        foreach ($posts as $post) {
            $this->send_webhook('post_updated', $post->ID, $post);
            $synced++;
        }
        
        echo '<div class="notice notice-success"><p>Sent webhooks for ' . $synced . ' articles!</p></div>';
    }
}

// Initialize the plugin
new HelvetiForma_Webhook_Sync();
