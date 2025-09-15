<?php
/**
 * Plugin Name: HelvetiForma Auto Enroll Plugin V7
 * Description: Ultra-simplified plugin for auto-enrollment with minimal memory usage.
 * Version: 1.0.7
 * Author: Damien Balet
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class HelvetiForma_Auto_Enroll_Plugin_V7 {

    private $default_course_id;

    public function __construct() {
        $this->default_course_id = get_option('helvetiforma_default_course_id', 24); // Default to 24 (Gestion des Salaires)

        // Hook into WordPress user registration
        add_action('user_register', array($this, 'auto_enroll_user'));

        // Add REST API endpoint for manual enrollment
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    /**
     * Automatically enroll new users in the default course
     */
    public function auto_enroll_user($user_id) {
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

        // Convert user to Tutor LMS student using minimal approach
        $this->make_user_tutor_student_minimal($user_id);

        // Enroll user in default course
        $this->enroll_user_in_course_minimal($user_id, $this->default_course_id);
    }

    /**
     * Make user a Tutor LMS student with minimal memory usage
     */
    private function make_user_tutor_student_minimal($user_id) {
        // Set only the most essential meta
        update_user_meta($user_id, '_is_tutor_student', 'yes');
        update_user_meta($user_id, 'tutor_student_status', 'active');
        
        error_log("HelvetiForma V7: User {$user_id} set as student (minimal)");
        return true;
    }

    /**
     * Enroll user in a course with minimal memory usage
     */
    private function enroll_user_in_course_minimal($user_id, $course_id) {
        global $wpdb;

        // Check if already enrolled
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}tutor_enrolled WHERE user_id = %d AND course_id = %d",
            $user_id, $course_id
        ));

        if ($existing > 0) {
            error_log("HelvetiForma V7: User {$user_id} already enrolled in course {$course_id}");
            return true;
        }

        // Insert enrollment record directly
        $result = $wpdb->insert(
            $wpdb->prefix . 'tutor_enrolled',
            array(
                'user_id' => $user_id,
                'course_id' => $course_id,
                'status' => 'completed',
                'enrolled_date' => current_time('mysql')
            ),
            array('%d', '%d', '%s', '%s')
        );

        if ($result) {
            error_log("HelvetiForma V7: User {$user_id} enrolled in course {$course_id}");
            return true;
        }

        error_log("HelvetiForma V7: Failed to enroll user {$user_id} in course {$course_id}");
        return false;
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('helvetiforma/v1', '/enroll-user', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_enroll_user'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'description' => 'ID of the user to enroll'
                ),
                'course_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'description' => 'ID of the course to enroll in'
                )
            )
        ));
    }

    /**
     * Handle enroll user API request
     */
    public function handle_enroll_user($request) {
        $user_id = $request->get_param('user_id');
        $course_id = $request->get_param('course_id');

        // Verify user exists
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }

        // Make user a Tutor LMS student (minimal)
        $this->make_user_tutor_student_minimal($user_id);

        // Enroll user in course (minimal)
        $is_enrolled = $this->enroll_user_in_course_minimal($user_id, $course_id);

        // Check enrollment status
        global $wpdb;
        $enrollment_check = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}tutor_enrolled WHERE user_id = %d AND course_id = %d",
            $user_id, $course_id
        ));

        return array(
            'success' => true,
            'message' => 'User successfully enrolled in course',
            'user_id' => $user_id,
            'course_id' => $course_id,
            'is_enrolled' => $enrollment_check > 0,
            'is_tutor_student' => get_user_meta($user_id, '_is_tutor_student', true)
        );
    }

    /**
     * Check API permissions
     */
    public function check_permissions($request) {
        // Check if the request is authenticated with an application password
        if (function_exists('wp_is_application_passwords_available') && wp_is_application_passwords_available()) {
            $user = wp_authenticate_application_password(null, $request->get_header('Authorization'));
            if (is_wp_error($user)) {
                return new WP_Error('rest_forbidden', 'Invalid application password.', array('status' => 401));
            }
            // Ensure the authenticated user has capabilities to create users/enroll students
            if (user_can($user->ID, 'manage_options') || user_can($user->ID, 'edit_users')) {
                return true;
            }
        }
        return new WP_Error('rest_forbidden', 'You are not authorized to perform this action.', array('status' => 401));
    }
}

new HelvetiForma_Auto_Enroll_Plugin_V7();
