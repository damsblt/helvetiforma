<?php
/**
 * WordPress Email Verification Redirect
 * 
 * Redirige les liens de vérification email vers l'application Next.js
 * Ajouter ce code à functions.php ou créer un plugin
 */

// Rediriger les liens de vérification email vers Next.js
function helvetiforma_redirect_email_verification() {
    // Détecter si c'est une demande de vérification email
    if (isset($_GET['email']) && isset($_GET['token'])) {
        $email = sanitize_email($_GET['email']);
        $token = sanitize_text_field($_GET['token']);
        
        // URL de votre application Next.js
        $nextjs_url = 'http://localhost:3000'; // Développement
        if (defined('WP_ENV') && WP_ENV === 'production') {
            $nextjs_url = 'https://helvetiforma.vercel.app'; // Production
        }
        
        // Construire l'URL de redirection
        $redirect_url = $nextjs_url . '/email-verification?' . http_build_query([
            'email' => $email,
            'token' => $token,
            'source' => 'wordpress'
        ]);
        
        // Rediriger vers Next.js
        wp_redirect($redirect_url);
        exit;
    }
    
    // Gérer aussi les liens avec 'key' au lieu de 'token'
    if (isset($_GET['email']) && isset($_GET['key'])) {
        $email = sanitize_email($_GET['email']);
        $key = sanitize_text_field($_GET['key']);
        
        $nextjs_url = 'http://localhost:3000';
        if (defined('WP_ENV') && WP_ENV === 'production') {
            $nextjs_url = 'https://helvetiforma.vercel.app';
        }
        
        $redirect_url = $nextjs_url . '/email-verification?' . http_build_query([
            'email' => $email,
            'token' => $key,
            'source' => 'wordpress'
        ]);
        
        wp_redirect($redirect_url);
        exit;
    }
}
add_action('init', 'helvetiforma_redirect_email_verification');

// Modifier les URLs des emails WordPress pour pointer vers Next.js
function helvetiforma_modify_email_verification_urls($message, $key, $user_login, $user_data) {
    $nextjs_url = 'http://localhost:3000';
    if (defined('WP_ENV') && WP_ENV === 'production') {
        $nextjs_url = 'https://helvetiforma.vercel.app';
    }
    
    // Construire la nouvelle URL
    $verification_url = $nextjs_url . '/email-verification?' . http_build_query([
        'email' => $user_data->user_email,
        'token' => $key,
        'user' => $user_login
    ]);
    
    // Remplacer l'URL WordPress par l'URL Next.js dans le message
    $wordpress_pattern = home_url() . '/wp-login.php?action=rp&key=' . $key . '&login=' . rawurlencode($user_login);
    $message = str_replace($wordpress_pattern, $verification_url, $message);
    
    // Aussi remplacer les patterns plus génériques
    $message = preg_replace(
        '/https?:\/\/[^\/]+\/\?email=[^&]+&token=[^\s]+/',
        $verification_url,
        $message
    );
    
    return $message;
}
add_filter('retrieve_password_message', 'helvetiforma_modify_email_verification_urls', 10, 4);

// Modifier les emails de nouveau utilisateur
function helvetiforma_modify_new_user_email($wp_new_user_notification_email, $user, $blogname) {
    $nextjs_url = 'http://localhost:3000';
    if (defined('WP_ENV') && WP_ENV === 'production') {
        $nextjs_url = 'https://helvetiforma.vercel.app';
    }
    
    // Si l'email contient un lien de vérification
    if (isset($wp_new_user_notification_email['message'])) {
        $message = $wp_new_user_notification_email['message'];
        
        // Générer un token de vérification
        $verification_token = wp_generate_password(32, false);
        update_user_meta($user->ID, 'email_verification_token', $verification_token);
        update_user_meta($user->ID, 'email_verification_sent', current_time('mysql'));
        
        // Créer l'URL de vérification Next.js
        $verification_url = $nextjs_url . '/email-verification?' . http_build_query([
            'email' => $user->user_email,
            'token' => $verification_token,
            'user_id' => $user->ID
        ]);
        
        // Ajouter le lien de vérification au message
        $custom_message = "Bonjour,\n\n";
        $custom_message .= "Bienvenue sur HelvetiForma !\n\n";
        $custom_message .= "Pour activer votre compte, veuillez cliquer sur le lien suivant :\n";
        $custom_message .= $verification_url . "\n\n";
        $custom_message .= "Si le lien ne fonctionne pas, copiez-collez cette URL dans votre navigateur.\n\n";
        $custom_message .= "Ce lien expire dans 24 heures.\n\n";
        $custom_message .= "Si vous n'avez pas créé de compte sur HelvetiForma, ignorez cet email.\n\n";
        $custom_message .= "Cordialement,\n";
        $custom_message .= "L'équipe HelvetiForma";
        
        $wp_new_user_notification_email['message'] = $custom_message;
        $wp_new_user_notification_email['subject'] = 'Vérifiez votre adresse email - HelvetiForma';
    }
    
    return $wp_new_user_notification_email;
}
add_filter('wp_new_user_notification_email', 'helvetiforma_modify_new_user_email', 10, 3);

// API endpoint pour vérifier les tokens depuis Next.js
function helvetiforma_verify_email_token() {
    register_rest_route('helvetiforma/v1', '/verify-email', array(
        'methods' => 'POST',
        'callback' => 'helvetiforma_handle_email_verification',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required' => true,
                'type' => 'string',
                'format' => 'email',
            ),
            'token' => array(
                'required' => true,
                'type' => 'string',
            ),
        ),
    ));
}
add_action('rest_api_init', 'helvetiforma_verify_email_token');

// Gérer la vérification des tokens
function helvetiforma_handle_email_verification($request) {
    $email = sanitize_email($request['email']);
    $token = sanitize_text_field($request['token']);
    
    if (empty($email) || empty($token)) {
        return new WP_Error('missing_params', 'Email and token are required.', array('status' => 400));
    }
    
    // Trouver l'utilisateur par email
    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found.', array('status' => 404));
    }
    
    // Vérifier le token
    $stored_token = get_user_meta($user->ID, 'email_verification_token', true);
    if (empty($stored_token) || $stored_token !== $token) {
        return new WP_Error('invalid_token', 'Invalid verification token.', array('status' => 400));
    }
    
    // Vérifier l'expiration (24 heures)
    $sent_time = get_user_meta($user->ID, 'email_verification_sent', true);
    if ($sent_time) {
        $sent_timestamp = strtotime($sent_time);
        $current_timestamp = current_time('timestamp');
        if (($current_timestamp - $sent_timestamp) > (24 * 60 * 60)) {
            return new WP_Error('token_expired', 'Verification token has expired.', array('status' => 400));
        }
    }
    
    // Marquer l'email comme vérifié
    update_user_meta($user->ID, 'email_verified', true);
    update_user_meta($user->ID, 'email_verified_at', current_time('mysql'));
    
    // Supprimer le token utilisé
    delete_user_meta($user->ID, 'email_verification_token');
    delete_user_meta($user->ID, 'email_verification_sent');
    
    return array(
        'success' => true,
        'message' => 'Email verified successfully.',
        'user_id' => $user->ID,
        'verified_at' => current_time('mysql')
    );
}

// Ajouter du JavaScript pour communiquer avec l'iframe parent
function helvetiforma_email_verification_script() {
    if (isset($_GET['iframe']) && $_GET['iframe'] === '1' && (isset($_GET['email']) || isset($_GET['token']))) {
        ?>
        <script type="text/javascript">
        (function() {
            if (window.self === window.top) return;
            
            const urlParams = new URLSearchParams(window.location.search);
            const parentOrigin = urlParams.get('origin') || 'http://localhost:3000';
            
            function sendMessageToParent(data) {
                try {
                    window.parent.postMessage(JSON.stringify(data), parentOrigin);
                } catch (e) {
                    console.warn('Failed to send message to parent:', e);
                }
            }
            
            // Détecter le succès/échec de la vérification
            document.addEventListener('DOMContentLoaded', function() {
                // Chercher des messages de succès/erreur
                const successElements = document.querySelectorAll('.notice-success, .updated, .success');
                const errorElements = document.querySelectorAll('.notice-error, .error, .warning');
                
                if (successElements.length > 0) {
                    sendMessageToParent({
                        type: 'email_verification',
                        action: 'verification_success',
                        message: successElements[0].textContent.trim()
                    });
                } else if (errorElements.length > 0) {
                    sendMessageToParent({
                        type: 'email_verification',
                        action: 'verification_error',
                        message: errorElements[0].textContent.trim()
                    });
                } else {
                    // Si pas de message visible, vérifier via API
                    const email = urlParams.get('email');
                    const token = urlParams.get('token');
                    
                    if (email && token) {
                        fetch('/wp-json/helvetiforma/v1/verify-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: email, token: token })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                sendMessageToParent({
                                    type: 'email_verification',
                                    action: 'verification_success',
                                    message: 'Email vérifié avec succès!'
                                });
                            } else {
                                sendMessageToParent({
                                    type: 'email_verification',
                                    action: 'verification_error',
                                    message: data.message || 'Erreur de vérification'
                                });
                            }
                        })
                        .catch(error => {
                            sendMessageToParent({
                                type: 'email_verification',
                                action: 'verification_error',
                                message: 'Erreur de connexion'
                            });
                        });
                    }
                }
            });
        })();
        </script>
        <?php
    }
}
add_action('wp_footer', 'helvetiforma_email_verification_script');

?>
