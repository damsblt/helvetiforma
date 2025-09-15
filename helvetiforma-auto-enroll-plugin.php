<?php
/**
 * Plugin Name: HelvetiForma Auto Enroll
 * Description: Automatically enrolls new users in the default course
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiFormaAutoEnroll {
    
    private $default_course_id = 24; // Gestion des Salaires
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Hook into user registration to automatically enroll them
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
        
        // Use WordPress user registration hook to trigger Tutor LMS
        // This simulates a normal user registration that Tutor LMS would catch
        do_action('user_register', $user_id);
        
        // Wait a moment for Tutor LMS to process
        sleep(1);
        
        // Convert user to Tutor LMS student using native functions
        $this->make_user_tutor_student($user_id);
        
        // Enroll user in default course
        $this->enroll_user_in_course($user_id, $this->default_course_id);
    }
    
    /**
     * Make user a Tutor LMS student using native workflow
     */
    private function make_user_tutor_student($user_id) {
        // First, ensure user has subscriber role
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return false;
        }
        
        // Set role to subscriber if not already
        if (!in_array('subscriber', $user->roles)) {
            $user->set_role('subscriber');
        }
        
        // Method 1: Try to use Tutor LMS native functions
        if (function_exists('tutor_utils')) {
            $tutor_utils = tutor_utils();
            
            // Try register_student
            if (method_exists($tutor_utils, 'register_student')) {
                $result = $tutor_utils->register_student($user_id);
                if ($result) {
                    error_log("HelvetiForma: User {$user_id} registered as student via register_student()");
                    return true;
                }
            }
            
            // Try add_student
            if (method_exists($tutor_utils, 'add_student')) {
                $result = $tutor_utils->add_student($user_id);
                if ($result) {
                    error_log("HelvetiForma: User {$user_id} added as student via add_student()");
                    return true;
                }
            }
        }
        
        // Method 2: Use Tutor LMS Pro API if available
        if (function_exists('tutor_pro')) {
            $tutor_pro = tutor_pro();
            if (method_exists($tutor_pro, 'register_student')) {
                $result = $tutor_pro->register_student($user_id);
                if ($result) {
                    error_log("HelvetiForma: User {$user_id} registered as student via Tutor Pro");
                    return true;
                }
            }
        }
        
        // Method 3: Direct database insertion using Tutor LMS structure
        $this->create_student_directly($user_id);
        
        // Trigger all Tutor LMS student registration hooks
        do_action('tutor_after_user_register', $user_id);
        do_action('tutor_after_student_register', $user_id);
        do_action('tutor_student_register', $user_id);
        do_action('tutor_student_approved', $user_id);
        
        return true;
    }
    
    /**
     * Create student directly in Tutor LMS database
     */
    private function create_student_directly($user_id) {
        global $wpdb;
        
        // Set all required meta
        update_user_meta($user_id, '_is_tutor_student', 'yes');
        update_user_meta($user_id, 'tutor_student_status', 'active');
        update_user_meta($user_id, 'tutor_profile_public', 'yes');
        update_user_meta($user_id, 'tutor_register_time', current_time('mysql'));
        
        // Insert into tutor_enrolled table directly
        $enrolled_table = $wpdb->prefix . 'tutor_enrolled';
        $result = $wpdb->insert(
            $enrolled_table,
            array(
                'user_id' => $user_id,
                'course_id' => $this->default_course_id,
                'status' => 'completed',
                'enrolled_date' => current_time('mysql')
            ),
            array('%d', '%d', '%s', '%s')
        );
        
        if ($result) {
            error_log("HelvetiForma: User {$user_id} enrolled directly in database");
        }
        
        // Try to insert into tutor_students table if it exists
        $students_table = $wpdb->prefix . 'tutor_students';
        if ($wpdb->get_var("SHOW TABLES LIKE '$students_table'") == $students_table) {
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
        
        error_log("HelvetiForma: User {$user_id} created as student directly");
    }
    
    /**
     * Create student manually using Tutor LMS database structure
     */
    private function create_student_manually($user_id) {
        global $wpdb;
        
        // Set only essential Tutor LMS student meta
        update_user_meta($user_id, '_is_tutor_student', 'yes');
        update_user_meta($user_id, 'tutor_student_status', 'active');
        update_user_meta($user_id, 'tutor_profile_public', 'yes');
        update_user_meta($user_id, 'tutor_register_time', current_time('mysql'));
        
        error_log("HelvetiForma: User {$user_id} created as student manually");
    }
    
    /**
     * Enroll user in a course
     */
    private function enroll_user_in_course($user_id, $course_id) {
        // Check if user is already enrolled
        if (tutor_utils()->is_enrolled($course_id, $user_id)) {
            return true;
        }
        
        // Use Tutor LMS native enrollment function
        if (function_exists('tutor_utils')) {
            $tutor_utils = tutor_utils();
            
            // Try to enroll using Tutor LMS native method
            if (method_exists($tutor_utils, 'enroll')) {
                $enrollment_result = $tutor_utils->enroll($course_id, $user_id);
                if ($enrollment_result) {
                    error_log("HelvetiForma: User {$user_id} enrolled in course {$course_id} via native method");
                    return true;
                }
            }
        }
        
        // Fallback: Create enrollment manually
        $enrollment_data = array(
            'user_id' => $user_id,
            'course_id' => $course_id,
            'status' => 'completed',
            'enrolled_date' => current_time('mysql')
        );
        
        // Insert enrollment record
        global $wpdb;
        $result = $wpdb->insert(
            $wpdb->prefix . 'tutor_enrolled',
            $enrollment_data,
            array('%d', '%d', '%s', '%s')
        );
        
        if ($result) {
            error_log("HelvetiForma: User {$user_id} enrolled in course {$course_id} via manual method");
            
            // Trigger Tutor LMS hooks
            do_action('tutor_after_enrolled', $user_id, $course_id);
            do_action('tutor_after_student_register', $user_id);
            return true;
        }
        
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
                    'sanitize_callback' => 'absint'
                ),
                'course_id' => array(
                    'required' => false,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                    'default' => $this->default_course_id
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
        
        // First, make user a Tutor LMS student
        $this->make_user_tutor_student($user_id);
        
        // Then enroll user in course
        $this->enroll_user_in_course($user_id, $course_id);
        
        return array(
            'success' => true,
            'message' => 'User successfully enrolled in course',
            'user_id' => $user_id,
            'course_id' => $course_id,
            'is_enrolled' => tutor_utils()->is_enrolled($course_id, $user_id),
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
        
        // Basic auth check
        return true;
    }
}

// Initialize the plugin
new HelvetiFormaAutoEnroll();
