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
        
        // Send email with credentials
        $this->send_welcome_email($email, $username, $password, $first_name);
        
        return array(
            'success' => true,
            'message' => 'Compte créé avec succès. Vérifiez votre email pour le mot de passe.',
            'user_id' => $user_id,
            'username' => $username,
        );
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
