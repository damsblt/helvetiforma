<?php
/**
 * Plugin Name: HelvetiForma Public Registration
 * Description: Allows public user registration via REST API without authentication
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiFormaRegistration {
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    public function register_routes() {
        register_rest_route('helvetiforma/v1', '/register', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_registration'),
            'permission_callback' => '__return_true', // Allow public access
            'args' => array(
                'first_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'last_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'format' => 'email',
                    'sanitize_callback' => 'sanitize_email',
                ),
            ),
        ));
    }
    
    public function handle_registration($request) {
        $first_name = $request->get_param('first_name');
        $last_name = $request->get_param('last_name');
        $email = $request->get_param('email');
        
        // Check if email already exists
        if (email_exists($email)) {
            return new WP_Error(
                'email_exists',
                'Un compte avec cet email existe déjà.',
                array('status' => 400)
            );
        }
        
        // Generate username from email
        $username = sanitize_user($email);
        $counter = 1;
        $original_username = $username;
        
        // Ensure unique username
        while (username_exists($username)) {
            $username = $original_username . '_' . $counter;
            $counter++;
        }
        
        // Generate secure password
        $password = wp_generate_password(12, true, true);
        
        // Create user
        $user_id = wp_create_user($username, $password, $email);
        
        if (is_wp_error($user_id)) {
            return new WP_Error(
                'user_creation_failed',
                'Erreur lors de la création du compte.',
                array('status' => 500)
            );
        }
        
        // Update user meta
        wp_update_user(array(
            'ID' => $user_id,
            'first_name' => $first_name,
            'last_name' => $last_name,
            'display_name' => $first_name . ' ' . $last_name,
        ));
        
        // Set role to subscriber (learner)
        $user = new WP_User($user_id);
        $user->set_role('subscriber');
        
        // Integrate with Tutor LMS - ensure user appears in learners list
        $this->integrate_with_tutor_lms($user_id);
        
        // Send email with credentials
        $this->send_welcome_email($email, $username, $password, $first_name);
        
        return array(
            'success' => true,
            'message' => 'Compte créé avec succès. Vérifiez votre email pour le mot de passe.',
            'user_id' => $user_id,
            'username' => $username,
        );
    }
    
    /**
     * Integrate new user with Tutor LMS
     * This ensures the user appears in the learners list as "Apprenant"
     */
    private function integrate_with_tutor_lms($user_id) {
        // Check if Tutor LMS is active
        if (!class_exists('TUTOR\Tutor')) {
            error_log("Tutor LMS not active - skipping integration for user ID: " . $user_id);
            return;
        }
        
        // Get user data
        $user = get_userdata($user_id);
        if (!$user) {
            error_log("User not found for ID: " . $user_id);
            return;
        }
        
        // Ensure user has the correct role for Tutor LMS (subscriber = Apprenant)
        if (!in_array('subscriber', $user->roles)) {
            $user->set_role('subscriber');
            error_log("Set subscriber role for user ID: " . $user_id);
        }
        
        // Add comprehensive Tutor LMS user meta
        update_user_meta($user_id, '_is_tutor_student', 'yes');
        update_user_meta($user_id, 'tutor_profile_bio', '');
        update_user_meta($user_id, 'tutor_profile_photo', '');
        update_user_meta($user_id, 'tutor_register_time', current_time('mysql'));
        update_user_meta($user_id, 'tutor_profile_phone', '');
        update_user_meta($user_id, 'tutor_profile_website', '');
        update_user_meta($user_id, 'tutor_profile_occupation', '');
        update_user_meta($user_id, 'tutor_profile_about', '');
        
        // Set user as active student in Tutor LMS
        update_user_meta($user_id, 'tutor_student_status', 'active');
        
        // Trigger Tutor LMS user creation hooks
        do_action('tutor_after_user_register', $user_id);
        do_action('tutor_after_student_register', $user_id);
        
        // Force refresh of Tutor LMS user cache and data
        if (function_exists('tutor_utils')) {
            tutor_utils()->update_user_profile($user_id);
        }
        
        // Clear any Tutor LMS caches
        if (function_exists('tutor_cache')) {
            tutor_cache()->flush();
        }
        
        // Log successful integration
        error_log("Tutor LMS integration completed for user ID: " . $user_id . " - Role: subscriber (Apprenant)");
        
        // Send webhook to Next.js app (optional)
        $this->send_webhook_to_nextjs('tutor_lms_integration_completed', $user_id, array(
            'role' => 'subscriber',
            'tutor_student' => 'yes',
            'integration_time' => current_time('mysql')
        ));
        
        // Optional: Send notification to admin about new student
        $this->notify_admin_new_student($user_id);
    }
    
    /**
     * Notify admin about new student registration
     */
    private function notify_admin_new_student($user_id) {
        $user = get_userdata($user_id);
        if (!$user) return;
        
        $admin_email = get_option('admin_email');
        $subject = 'Nouvel Apprenant inscrit - ' . get_bloginfo('name');
        $message = "Un nouvel apprenant s'est inscrit sur votre plateforme de formation :\n\n";
        $message .= "Nom : " . $user->first_name . " " . $user->last_name . "\n";
        $message .= "Email : " . $user->user_email . "\n";
        $message .= "Date d'inscription : " . current_time('d/m/Y H:i') . "\n";
        $message .= "Rôle : Apprenant (subscriber)\n\n";
        $message .= "L'utilisateur a été automatiquement ajouté à Tutor LMS.";
        
        wp_mail($admin_email, $subject, $message);
    }
    
    /**
     * Send webhook to Next.js app
     */
    private function send_webhook_to_nextjs($action, $user_id, $data = array()) {
        // Get Next.js app URL from WordPress options or environment
        $nextjs_url = get_option('helvetiforma_nextjs_url', 'https://helvetiforma.ch');
        $webhook_url = $nextjs_url . '/api/wordpress-webhook';
        
        // Prepare webhook data
        $webhook_data = array(
            'action' => $action,
            'user_id' => $user_id,
            'user_data' => $data,
            'timestamp' => current_time('mysql'),
            'source' => 'wordpress'
        );
        
        // Send webhook (non-blocking)
        wp_remote_post($webhook_url, array(
            'body' => json_encode($webhook_data),
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-webhook-secret' => get_option('helvetiforma_webhook_secret', '')
            ),
            'timeout' => 5,
            'blocking' => false // Don't wait for response
        ));
        
        error_log("Webhook sent to Next.js: " . $action . " for user ID: " . $user_id);
    }
    
    private function send_welcome_email($email, $username, $password, $first_name) {
        $subject = 'Bienvenue sur HelvetiForma - Vos identifiants de connexion';
        $message = "Bonjour {$first_name},\n\n";
        $message .= "Votre compte HelvetiForma a été créé avec succès !\n\n";
        $message .= "Voici vos identifiants de connexion :\n";
        $message .= "Nom d'utilisateur : {$username}\n";
        $message .= "Mot de passe : {$password}\n\n";
        $message .= "Vous pouvez vous connecter sur : " . home_url('/login') . "\n\n";
        $message .= "Cordialement,\nL'équipe HelvetiForma";
        
        wp_mail($email, $subject, $message);
    }
}

// Initialize the plugin
new HelvetiFormaRegistration();
