<?php
/**
 * Plugin Name: HelvetiForma Auto Enroll Plugin V9
 * Description: Uses Tutor LMS native enrollment functions for proper student registration.
 * Version: 1.0.9
 * Author: Damien Balet
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class HelvetiForma_Auto_Enroll_Plugin_V9 {

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

        // Convert user to Tutor LMS student using native functions
        $this->make_user_tutor_student_native($user_id);

        // Enroll user in default course using native functions
        $this->enroll_user_in_course_native($user_id, $this->default_course_id);
    }

    /**
     * Ensure a row exists in tutor_students for this user
     */
    private function ensure_student_row($user_id) {
        global $wpdb;
        $students_table = $wpdb->prefix . 'tutor_students';
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $students_table)) === $students_table) {
            $exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$students_table} WHERE user_id = %d", $user_id));
            if ((int) $exists === 0) {
                $wpdb->insert(
                    $students_table,
                    array(
                        'user_id' => $user_id,
                        'status' => 'active',
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    ),
                    array('%d', '%s', '%s', '%s')
                );
            }
        }
    }

    /**
     * Make user a Tutor LMS student using native Tutor LMS functions
     */
    private function make_user_tutor_student_native($user_id) {
        // Use Tutor LMS native student registration
        if (function_exists('tutor_utils')) {
            $tutor_utils = tutor_utils();
            
            // Try to register as student using native method
            if (method_exists($tutor_utils, 'register_student')) {
                $result = $tutor_utils->register_student($user_id);
                if ($result) {
                    // Ensure DB row exists for Students listing
                    $this->ensure_student_row($user_id);
                    error_log("HelvetiForma V9: User {$user_id} registered as student via native method");
                    return true;
                }
            }
        }

        // Fallback: Set essential meta manually and ensure row
        update_user_meta($user_id, '_is_tutor_student', 'yes');
        update_user_meta($user_id, 'tutor_student_status', 'active');
        $this->ensure_student_row($user_id);
        
        // Trigger Tutor LMS hooks
        do_action('tutor_after_user_register', $user_id);
        do_action('tutor_after_student_register', $user_id);
        
        error_log("HelvetiForma V9: User {$user_id} set as student (fallback)");
        return true;
    }

    /**
     * Enroll user in a course using native Tutor LMS functions
     */
    private function enroll_user_in_course_native($user_id, $course_id) {
        // Check if already enrolled using native method
        if (function_exists('tutor_utils')) {
            $tutor_utils = tutor_utils();
            
            if (method_exists($tutor_utils, 'is_enrolled')) {
                if ($tutor_utils->is_enrolled($course_id, $user_id)) {
                    error_log("HelvetiForma V9: User {$user_id} already enrolled in course {$course_id}");
                    return true;
                }
            }

            // Try to enroll using native method
            if (method_exists($tutor_utils, 'enroll')) {
                $result = $tutor_utils->enroll($course_id, $user_id);
                if ($result) {
                    error_log("HelvetiForma V9: User {$user_id} enrolled in course {$course_id} via native method");
                    return true;
                }
            }
        }

        // Fallback: Manual enrollment with proper Tutor LMS structure
        global $wpdb;
        
        // Insert into tutor_enrolled table
        $enrollment_data = array(
            'user_id' => $user_id,
            'course_id' => $course_id,
            'status' => 'enrolled',
            'enrolled_date' => current_time('mysql')
        );

        $exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}tutor_enrolled WHERE user_id = %d AND course_id = %d", $user_id, $course_id));
        if ((int) $exists === 0) {
            $result = $wpdb->insert(
                $wpdb->prefix . 'tutor_enrolled',
                $enrollment_data,
                array('%d', '%d', '%s', '%s')
            );
        } else {
            $result = true;
        }

        if ($result) {
            // Trigger Tutor LMS enrollment hooks
            do_action('tutor_after_enrolled', $user_id, $course_id);
            do_action('tutor_after_student_register', $user_id);
            
            error_log("HelvetiForma V9: User {$user_id} enrolled in course {$course_id} via fallback method");
            return true;
        }

        error_log("HelvetiForma V9: Failed to enroll user {$user_id} in course {$course_id}");
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

        // Make user a Tutor LMS student (native)
        $this->make_user_tutor_student_native($user_id);

        // Enroll user in course (native)
        $this->enroll_user_in_course_native($user_id, $course_id);

        // Check enrollment status using DB to be safe
        global $wpdb;
        $enrolled_count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}tutor_enrolled WHERE user_id = %d AND course_id = %d", $user_id, $course_id));
        $is_enrolled = ((int) $enrolled_count) > 0;

        return array(
            'success' => true,
            'message' => 'User successfully enrolled in course',
            'user_id' => $user_id,
            'course_id' => $course_id,
            'is_enrolled' => $is_enrolled,
            'is_tutor_student' => get_user_meta($user_id, '_is_tutor_student', true)
        );
    }

    /**
     * Check API permissions - parse Basic auth and authenticate via application password
     */
    public function check_permissions($request) {
        $auth = $request->get_header('Authorization');
        if ($auth && strpos($auth, 'Basic ') === 0) {
            $decoded = base64_decode(substr($auth, 6));
            list($username, $appPassword) = array_pad(explode(':', $decoded, 2), 2, '');

            if ($username !== '' && $appPassword !== '') {
                $user = wp_authenticate_application_password(null, $username, $appPassword);
                if (!is_wp_error($user) && (user_can($user->ID, 'manage_options') || user_can($user->ID, 'edit_users'))) {
                    return true;
                }
            }
        }

        return new WP_Error('rest_forbidden', 'You are not authorized to perform this action.', array('status' => 401));
    }
}

new HelvetiForma_Auto_Enroll_Plugin_V9();
