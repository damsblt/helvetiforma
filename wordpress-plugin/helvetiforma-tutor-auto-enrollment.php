<?php
/**
 * Plugin Name: HelvetiForma TutorLMS Auto Enrollment
 * Description: Automatically enrolls students in TutorLMS courses when WooCommerce order is completed
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HelvetiForma_Tutor_Auto_Enrollment {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Hook into WooCommerce order completion
        add_action('woocommerce_order_status_completed', array($this, 'enroll_on_order_complete'), 10, 1);
        add_action('woocommerce_order_status_processing', array($this, 'enroll_on_order_complete'), 10, 1);
        
        // Also handle payment completed (for Stripe and other payment gateways)
        add_action('woocommerce_payment_complete', array($this, 'enroll_on_payment_complete'), 10, 1);
        
        // Add admin notice if TutorLMS is not active
        add_action('admin_notices', array($this, 'admin_notices'));
    }
    
    /**
     * Show admin notices
     */
    public function admin_notices() {
        if (!function_exists('tutor')) {
            ?>
            <div class="notice notice-error">
                <p><strong>HelvetiForma TutorLMS Auto Enrollment:</strong> TutorLMS plugin is not active. Please activate TutorLMS to use this plugin.</p>
            </div>
            <?php
        }
        
        if (!class_exists('WooCommerce')) {
            ?>
            <div class="notice notice-error">
                <p><strong>HelvetiForma TutorLMS Auto Enrollment:</strong> WooCommerce plugin is not active. Please activate WooCommerce to use this plugin.</p>
            </div>
            <?php
        }
    }
    
    /**
     * Enroll student when order is completed
     */
    public function enroll_on_order_complete($order_id) {
        error_log("HelvetiForma: Order #{$order_id} completed, checking for course enrollments...");
        
        // Get order
        $order = wc_get_order($order_id);
        if (!$order) {
            error_log("HelvetiForma: Order #{$order_id} not found");
            return;
        }
        
        // Get customer/user
        $user_id = $order->get_user_id();
        if (!$user_id) {
            error_log("HelvetiForma: Order #{$order_id} has no user ID");
            return;
        }
        
        error_log("HelvetiForma: Processing order #{$order_id} for user #{$user_id}");
        
        // Get order items
        $items = $order->get_items();
        
        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $product = wc_get_product($product_id);
            
            if (!$product) {
                continue;
            }
            
            error_log("HelvetiForma: Checking product #{$product_id}");
            
            // Check if product is linked to a TutorLMS course
            $course_id = $this->get_course_id_from_product($product_id);
            
            if ($course_id) {
                error_log("HelvetiForma: Product #{$product_id} is linked to course #{$course_id}");
                $this->enroll_student($user_id, $course_id, $order_id);
            } else {
                error_log("HelvetiForma: Product #{$product_id} is not linked to any course");
            }
        }
    }
    
    /**
     * Enroll student when payment is complete (alternative trigger)
     */
    public function enroll_on_payment_complete($order_id) {
        error_log("HelvetiForma: Payment complete for order #{$order_id}");
        $this->enroll_on_order_complete($order_id);
    }
    
    /**
     * Get course ID from WooCommerce product
     */
    private function get_course_id_from_product($product_id) {
        // Method 1: Check if product has _tutor_course_id meta
        $course_id = get_post_meta($product_id, '_tutor_course_id', true);
        if ($course_id) {
            return $course_id;
        }
        
        // Method 2: Check if product has _related_course meta
        $course_id = get_post_meta($product_id, '_related_course', true);
        if ($course_id) {
            return $course_id;
        }
        
        // Method 3: Check if product has course_id in product meta
        $course_id = get_post_meta($product_id, 'course_id', true);
        if ($course_id) {
            return $course_id;
        }
        
        // Method 4: Look for any course that references this product
        global $wpdb;
        $course_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} 
            WHERE meta_key = '_tutor_course_product_id' 
            AND meta_value = %d 
            LIMIT 1",
            $product_id
        ));
        
        return $course_id;
    }
    
    /**
     * Enroll a student in a course
     */
    private function enroll_student($user_id, $course_id, $order_id = null) {
        // Check if TutorLMS functions are available
        if (!function_exists('tutor_utils')) {
            error_log("HelvetiForma: TutorLMS functions not available");
            return false;
        }
        
        // Check if user is already enrolled
        if (tutor_utils()->is_enrolled($course_id, $user_id)) {
            error_log("HelvetiForma: User #{$user_id} is already enrolled in course #{$course_id}");
            return true;
        }
        
        // Add student role if not present
        $user = get_user_by('id', $user_id);
        if ($user && !in_array('tutor_student', $user->roles)) {
            $user->add_role('tutor_student');
            error_log("HelvetiForma: Added tutor_student role to user #{$user_id}");
        }
        
        // Enroll using TutorLMS function
        try {
            global $wpdb;
            $table_name = $wpdb->prefix . 'tutor_enrolled';
            
            // Check if enrollment table exists
            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name;
            
            if ($table_exists) {
                // Use direct database insertion
                $enrollment_data = array(
                    'user_id' => $user_id,
                    'course_id' => $course_id,
                    'status' => 'enrolled',
                    'enrolled_at' => current_time('mysql')
                );
                
                $result = $wpdb->insert(
                    $table_name,
                    $enrollment_data,
                    array('%d', '%d', '%s', '%s')
                );
                
                if ($result) {
                    error_log("HelvetiForma: Successfully enrolled user #{$user_id} in course #{$course_id} via database");
                    
                    // Update user meta
                    $enrolled_courses = get_user_meta($user_id, '_tutor_enrolled_courses', true);
                    if (!is_array($enrolled_courses)) {
                        $enrolled_courses = array();
                    }
                    
                    $enrolled_courses[] = array(
                        'course_id' => $course_id,
                        'enrolled_at' => $enrollment_data['enrolled_at'],
                        'status' => 'enrolled',
                        'order_id' => $order_id
                    );
                    
                    update_user_meta($user_id, '_tutor_enrolled_courses', $enrolled_courses);
                    
                    // Trigger TutorLMS action
                    do_action('tutor_after_enrolled', $course_id, $user_id, $order_id);
                    
                    return true;
                } else {
                    error_log("HelvetiForma: Failed to enroll user #{$user_id} in course #{$course_id} - Database error: " . $wpdb->last_error);
                }
            } else {
                error_log("HelvetiForma: Enrollment table does not exist");
            }
            
            // Fallback: Try using TutorLMS enrollment function if available
            if (function_exists('tutor_enroll_student')) {
                tutor_enroll_student($course_id, $order_id, $user_id);
                error_log("HelvetiForma: Enrolled user #{$user_id} in course #{$course_id} via tutor_enroll_student()");
                return true;
            }
            
        } catch (Exception $e) {
            error_log("HelvetiForma: Enrollment error: " . $e->getMessage());
        }
        
        return false;
    }
}

// Initialize the plugin
new HelvetiForma_Tutor_Auto_Enrollment();


