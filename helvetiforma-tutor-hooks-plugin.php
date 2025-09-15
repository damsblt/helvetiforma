<?php
/**
 * Plugin Name: HelvetiForma Tutor LMS Integration
 * Description: Automatically converts WordPress users to Tutor LMS students
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiFormaTutorIntegration {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Hook into user registration to automatically make them Tutor students
        add_action('user_register', array($this, 'make_user_tutor_student'));
        
        // Add REST API endpoint for manual student creation
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * Automatically convert new WordPress users to Tutor LMS students
     */
    public function make_user_tutor_student($user_id) {
        // Only process if Tutor LMS is active
        if (!function_exists('tutor_utils')) {
            return;
        }
        
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return;
        }
        
        // Set user role to subscriber if not already set
        if (!in_array('subscriber', $user->roles)) {
            $user->set_role('subscriber');
        }
        
        // Use Tutor LMS native function to register student
        if (function_exists('tutor_utils')) {
            $tutor_utils = tutor_utils();
            if (method_exists($tutor_utils, 'register_student')) {
                $tutor_utils->register_student($user_id);
                error_log("HelvetiForma: Registered user {$user_id} as Tutor LMS student");
            }
        }
        
        // Set Tutor LMS specific meta data
        $this->set_tutor_student_meta($user_id);
        
        // Trigger Tutor LMS hooks
        do_action('tutor_after_user_register', $user_id);
        do_action('tutor_after_student_register', $user_id);
        do_action('tutor_student_register', $user_id);
    }
    
    /**
     * Set Tutor LMS student meta data
     */
    private function set_tutor_student_meta($user_id) {
        $meta_data = array(
            '_is_tutor_student' => 'yes',
            'tutor_student_status' => 'active',
            'tutor_profile_public' => 'yes',
            'tutor_profile_publicly' => 'yes',
            'tutor_profile_publicly_visible' => 'yes',
            'tutor_register_time' => current_time('mysql'),
            'tutor_profile_bio' => '',
            'tutor_profile_photo' => '',
            'tutor_profile_phone' => '',
            'tutor_profile_website' => '',
            'tutor_profile_occupation' => '',
            'tutor_profile_about' => ''
        );
        
        foreach ($meta_data as $key => $value) {
            update_user_meta($user_id, $key, $value);
        }
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('helvetiforma/v1', '/make-student', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_make_student'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint'
                ),
                'first_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'last_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_email'
                )
            )
        ));
    }
    
    /**
     * Handle make student API request
     */
    public function handle_make_student($request) {
        $user_id = $request->get_param('user_id');
        $first_name = $request->get_param('first_name');
        $last_name = $request->get_param('last_name');
        $email = $request->get_param('email');
        
        // Verify user exists
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        // Update user meta
        update_user_meta($user_id, 'first_name', $first_name);
        update_user_meta($user_id, 'last_name', $last_name);
        
        // Make user a Tutor student
        $this->make_user_tutor_student($user_id);
        
        return array(
            'success' => true,
            'message' => 'User successfully converted to Tutor LMS student',
            'user_id' => $user_id,
            'is_tutor_student' => get_user_meta($user_id, '_is_tutor_student', true)
        );
    }
    
    /**
     * Check API permissions
     */
    public function check_permissions($request) {
        // Check if user has proper authentication
        $auth_header = $request->get_header('authorization');
        if (!$auth_header) {
            return false;
        }
        
        // Basic auth check (you can enhance this)
        return true;
    }
}

// Initialize the plugin
new HelvetiFormaTutorIntegration();
