<?php
/**
 * TutorLMS Automated Enrollment Functions
 * Add this code to your theme's functions.php file
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add custom user role for TutorLMS students
 */
add_action('init', function() {
    add_role('tutor_student', 'Tutor Student', array(
        'read' => true,
        'edit_posts' => false,
        'delete_posts' => false,
        'publish_posts' => false,
        'upload_files' => false,
    ));
});

/**
 * Register REST API endpoint for automated enrollment
 */
add_action('rest_api_init', function () {
    register_rest_route('tutor/v1', '/auto-enroll', array(
        'methods' => 'POST',
        'callback' => 'tutor_auto_enroll_student',
        'permission_callback' => '__return_true',
        'args' => array(
            'user_id' => array(
                'required' => true,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
            'course_id' => array(
                'required' => true,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
            'payment_status' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'paid',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        ),
    ));
});

/**
 * Automatically enroll a student in a course
 */
function tutor_auto_enroll_student($request) {
    $user_id = $request->get_param('user_id');
    $course_id = $request->get_param('course_id');
    $payment_status = $request->get_param('payment_status');
    
    // Validate user exists
    $user = get_user_by('id', $user_id);
    if (!$user) {
        return new WP_Error('invalid_user', 'User not found', array('status' => 404));
    }
    
    // Validate course exists
    $course = get_post($course_id);
    if (!$course || $course->post_type !== 'courses') {
        return new WP_Error('invalid_course', 'Course not found', array('status' => 404));
    }
    
    // Check if user is already enrolled
    if (function_exists('tutor_utils') && tutor_utils()->is_enrolled($course_id, $user_id)) {
        return new WP_Error('already_enrolled', 'User is already enrolled in this course', array('status' => 400));
    }
    
    // Add student role to user if not already present
    if (!in_array('tutor_student', $user->roles)) {
        $user->add_role('tutor_student');
    }
    
    // Create enrollment record in tutor_enrolled table
    global $wpdb;
    $table_name = $wpdb->prefix . 'tutor_enrolled';
    
    $enrollment_data = array(
        'user_id' => $user_id,
        'course_id' => $course_id,
        'status' => 'enrolled',
        'enrolled_at' => current_time('mysql'),
        'completion_percent' => 0,
        'payment_status' => $payment_status
    );
    
    $result = $wpdb->insert(
        $table_name,
        $enrollment_data,
        array('%d', '%d', '%s', '%s', '%d', '%s')
    );
    
    if ($result === false) {
        return new WP_Error('enrollment_failed', 'Failed to create enrollment record', array('status' => 500));
    }
    
    // Update user meta for quick access
    $enrolled_courses = get_user_meta($user_id, '_tutor_enrolled_courses', true);
    if (!is_array($enrolled_courses)) {
        $enrolled_courses = array();
    }
    
    $enrolled_courses[] = array(
        'course_id' => $course_id,
        'enrolled_at' => $enrollment_data['enrolled_at'],
        'status' => 'enrolled',
        'payment_status' => $payment_status
    );
    
    update_user_meta($user_id, '_tutor_enrolled_courses', $enrolled_courses);
    
    // Trigger TutorLMS enrollment action if available
    if (function_exists('do_action')) {
        do_action('tutor_after_enrolled', $course_id, $user_id);
    }
    
    // Log the enrollment
    error_log("TutorLMS Auto Enrollment: User {$user_id} enrolled in course {$course_id}");
    
    return array(
        'success' => true,
        'message' => 'User successfully enrolled in course',
        'data' => array(
            'user_id' => $user_id,
            'course_id' => $course_id,
            'status' => 'enrolled',
            'enrolled_at' => $enrollment_data['enrolled_at'],
            'payment_status' => $payment_status
        )
    );
}

/**
 * Register REST API endpoint for checking enrollments
 */
add_action('rest_api_init', function () {
    register_rest_route('tutor/v1', '/check-enrollment', array(
        'methods' => 'GET',
        'callback' => 'tutor_check_enrollment',
        'permission_callback' => '__return_true',
        'args' => array(
            'user_id' => array(
                'required' => true,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
            'course_id' => array(
                'required' => true,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
        ),
    ));
});

/**
 * Check if user is enrolled in a course
 */
function tutor_check_enrollment($request) {
    $user_id = $request->get_param('user_id');
    $course_id = $request->get_param('course_id');
    
    // Check using TutorLMS function if available
    $is_enrolled = false;
    if (function_exists('tutor_utils')) {
        $is_enrolled = tutor_utils()->is_enrolled($course_id, $user_id);
    } else {
        // Fallback: check database directly
        global $wpdb;
        $table_name = $wpdb->prefix . 'tutor_enrolled';
        $enrollment = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE user_id = %d AND course_id = %d",
            $user_id,
            $course_id
        ));
        $is_enrolled = !empty($enrollment);
    }
    
    return array(
        'success' => true,
        'is_enrolled' => $is_enrolled,
        'user_id' => $user_id,
        'course_id' => $course_id
    );
}

/**
 * Register REST API endpoint for getting user enrollments
 */
add_action('rest_api_init', function () {
    register_rest_route('tutor/v1', '/user-enrollments', array(
        'methods' => 'GET',
        'callback' => 'tutor_get_user_enrollments',
        'permission_callback' => '__return_true',
        'args' => array(
            'user_id' => array(
                'required' => true,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
        ),
    ));
});

/**
 * Get all enrollments for a user
 */
function tutor_get_user_enrollments($request) {
    $user_id = $request->get_param('user_id');
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'tutor_enrolled';
    
    $enrollments = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$table_name} WHERE user_id = %d ORDER BY enrolled_at DESC",
        $user_id
    ));
    
    return array(
        'success' => true,
        'data' => $enrollments,
        'count' => count($enrollments)
    );
}



