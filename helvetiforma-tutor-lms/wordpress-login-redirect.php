<?php
/**
 * WordPress Login Redirect to Next.js Dashboard
 * 
 * Redirige automatiquement les utilisateurs connectés vers le tableau de bord Next.js
 * Ajouter ce code à functions.php ou créer un plugin
 */

// Rediriger les utilisateurs connectés vers le tableau de bord Next.js
function helvetiforma_redirect_logged_in_users() {
    // Ne pas rediriger si on est déjà dans l'admin ou l'API
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || 
        (defined('REST_REQUEST') && REST_REQUEST) ||
        (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false)) {
        return;
    }
    
    // Ne pas rediriger si c'est une requête iframe
    if (isset($_GET['iframe']) && $_GET['iframe'] === '1') {
        return;
    }
    
    // Ne pas rediriger si c'est une page de login/logout/registration
    global $pagenow;
    if (in_array($pagenow, ['wp-login.php', 'wp-register.php']) || 
        is_page(['login', 'register', 'inscription'])) {
        return;
    }
    
    // Vérifier si l'utilisateur est connecté
    if (is_user_logged_in()) {
        $current_user = wp_get_current_user();
        
        // Ne rediriger que les abonnés (subscribers) et étudiants
        // Les administrateurs et instructeurs peuvent rester sur WordPress
        if (in_array('subscriber', $current_user->roles) || 
            in_array('student', $current_user->roles) ||
            (empty(array_intersect(['administrator', 'editor', 'author', 'contributor', 'tutor_instructor'], $current_user->roles)))) {
            
            // URL de votre application Next.js
            $nextjs_url = 'http://localhost:3000'; // Développement
            if (defined('WP_ENV') && WP_ENV === 'production') {
                $nextjs_url = 'https://helvetiforma.vercel.app'; // Production
            }
            
            // Construire l'URL du tableau de bord avec les informations utilisateur
            $dashboard_url = $nextjs_url . '/tableau-de-bord?' . http_build_query([
                'user_id' => $current_user->ID,
                'email' => $current_user->user_email,
                'username' => $current_user->user_login,
                'from' => 'wordpress',
                'auto_login' => '1'
            ]);
            
            // Rediriger vers le tableau de bord Next.js
            wp_redirect($dashboard_url);
            exit;
        }
    }
}
add_action('template_redirect', 'helvetiforma_redirect_logged_in_users');

// Redirection après connexion réussie
function helvetiforma_login_redirect($redirect_to, $request, $user) {
    // Vérifier si l'utilisateur existe et n'a pas d'erreurs
    if (isset($user->roles) && is_array($user->roles)) {
        // Rediriger les abonnés vers Next.js
        if (in_array('subscriber', $user->roles) || 
            in_array('student', $user->roles) ||
            (empty(array_intersect(['administrator', 'editor', 'author', 'contributor', 'tutor_instructor'], $user->roles)))) {
            
            $nextjs_url = 'http://localhost:3000'; // Développement
            if (defined('WP_ENV') && WP_ENV === 'production') {
                $nextjs_url = 'https://helvetiforma.vercel.app'; // Production
            }
            
            return $nextjs_url . '/tableau-de-bord?' . http_build_query([
                'user_id' => $user->ID,
                'email' => $user->user_email,
                'username' => $user->user_login,
                'from' => 'wordpress_login',
                'auto_login' => '1'
            ]);
        }
    }
    
    // Pour les autres rôles, utiliser la redirection par défaut
    return $redirect_to;
}
add_filter('login_redirect', 'helvetiforma_login_redirect', 10, 3);

// Ajouter un endpoint API pour l'auto-login depuis WordPress
function helvetiforma_register_auto_login_endpoint() {
    register_rest_route('helvetiforma/v1', '/auto-login', array(
        'methods' => 'POST',
        'callback' => 'helvetiforma_handle_auto_login',
        'permission_callback' => '__return_true',
        'args' => array(
            'user_id' => array(
                'required' => true,
                'type' => 'integer',
            ),
            'email' => array(
                'required' => true,
                'type' => 'string',
                'format' => 'email',
            ),
            'username' => array(
                'required' => true,
                'type' => 'string',
            ),
        ),
    ));
}
add_action('rest_api_init', 'helvetiforma_register_auto_login_endpoint');

// Gérer l'auto-login depuis Next.js
function helvetiforma_handle_auto_login($request) {
    $user_id = intval($request['user_id']);
    $email = sanitize_email($request['email']);
    $username = sanitize_text_field($request['username']);
    
    // Vérifier que l'utilisateur existe
    $user = get_user_by('id', $user_id);
    if (!$user || $user->user_email !== $email || $user->user_login !== $username) {
        return new WP_Error('invalid_user', 'User not found or data mismatch.', array('status' => 404));
    }
    
    // Créer un token temporaire pour l'auto-login
    $token = wp_generate_password(32, false);
    $expiry = time() + (15 * 60); // 15 minutes
    
    // Stocker le token
    update_user_meta($user_id, 'auto_login_token', $token);
    update_user_meta($user_id, 'auto_login_expiry', $expiry);
    
    return array(
        'success' => true,
        'user_id' => $user_id,
        'token' => $token,
        'expires_in' => 900, // 15 minutes
        'user_data' => array(
            'id' => $user->ID,
            'email' => $user->user_email,
            'username' => $user->user_login,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'roles' => $user->roles,
        ),
    );
}

// Ajouter du JavaScript pour communiquer avec Next.js
function helvetiforma_auto_login_script() {
    if (is_user_logged_in() && !is_admin()) {
        $current_user = wp_get_current_user();
        
        // Seulement pour les abonnés
        if (in_array('subscriber', $current_user->roles) || 
            in_array('student', $current_user->roles)) {
            ?>
            <script type="text/javascript">
            (function() {
                // Rediriger automatiquement vers Next.js si on n'est pas dans un iframe
                if (window.self === window.top) {
                    const nextjsUrl = '<?php echo (defined('WP_ENV') && WP_ENV === 'production') ? 'https://helvetiforma.vercel.app' : 'http://localhost:3000'; ?>';
                    const dashboardUrl = nextjsUrl + '/tableau-de-bord?' + new URLSearchParams({
                        user_id: '<?php echo $current_user->ID; ?>',
                        email: '<?php echo $current_user->user_email; ?>',
                        username: '<?php echo $current_user->user_login; ?>',
                        from: 'wordpress_auto',
                        auto_login: '1'
                    }).toString();
                    
                    // Rediriger après un court délai pour éviter les boucles
                    setTimeout(function() {
                        window.location.href = dashboardUrl;
                    }, 1000);
                }
            })();
            </script>
            <?php
        }
    }
}
add_action('wp_footer', 'helvetiforma_auto_login_script');

// Empêcher les abonnés d'accéder au tableau de bord WordPress
function helvetiforma_restrict_admin_access() {
    if (is_admin() && !wp_doing_ajax()) {
        $current_user = wp_get_current_user();
        
        if (in_array('subscriber', $current_user->roles) || 
            in_array('student', $current_user->roles)) {
            
            $nextjs_url = 'http://localhost:3000'; // Développement
            if (defined('WP_ENV') && WP_ENV === 'production') {
                $nextjs_url = 'https://helvetiforma.vercel.app'; // Production
            }
            
            wp_redirect($nextjs_url . '/tableau-de-bord');
            exit;
        }
    }
}
add_action('admin_init', 'helvetiforma_restrict_admin_access');

// Masquer la barre d'administration pour les abonnés
function helvetiforma_hide_admin_bar() {
    if (is_user_logged_in()) {
        $current_user = wp_get_current_user();
        
        if (in_array('subscriber', $current_user->roles) || 
            in_array('student', $current_user->roles)) {
            show_admin_bar(false);
        }
    }
}
add_action('init', 'helvetiforma_hide_admin_bar');
?>
