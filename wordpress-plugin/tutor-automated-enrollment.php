<?php
/**
 * TutorLMS Automated Enrollment Plugin
 * Automatically enrolls WordPress users in courses after payment
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
        'permission_callback' => '__return_true', // Allow public access for now
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
    if (tutor_utils()->is_enrolled($course_id, $user_id)) {
        return new WP_Error('already_enrolled', 'User is already enrolled in this course', array('status' => 400));
    }
    
    // Add student role to user if not already present
    if (!in_array('tutor_student', $user->roles)) {
        $user->add_role('tutor_student');
    }
    
    // Create enrollment record using WordPress post meta (more reliable)
    $enrollment_meta_key = '_tutor_enrolled_course_' . $course_id;
    $enrollment_data = array(
        'user_id' => $user_id,
        'course_id' => $course_id,
        'status' => 'enrolled',
        'enrolled_at' => current_time('mysql'),
        'payment_status' => $payment_status
    );
    
    // Store enrollment in user meta
    $result = update_user_meta($user_id, $enrollment_meta_key, $enrollment_data);
    
    if ($result === false) {
        return new WP_Error('enrollment_failed', 'Failed to create enrollment record', array('status' => 500));
    }
    
    // Also try to create in tutor_enrolled table if it exists
    global $wpdb;
    $table_name = $wpdb->prefix . 'tutor_enrolled';
    
    // Check if table exists
    $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name;
    
    if ($table_exists) {
        $db_enrollment_data = array(
            'user_id' => $user_id,
            'course_id' => $course_id,
            'status' => 'enrolled',
            'enrolled_at' => current_time('mysql')
        );
        
        $db_result = $wpdb->insert(
            $table_name,
            $db_enrollment_data,
            array('%d', '%d', '%s', '%s')
        );
        
        if ($db_result === false) {
            error_log("TutorLMS: Failed to insert into tutor_enrolled table, but enrollment stored in user meta");
        }
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
    
    // Trigger TutorLMS enrollment action
    do_action('tutor_after_enrolled', $course_id, $user_id);
    
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
    
    // Check using user meta first (more reliable)
    $enrollment_meta_key = '_tutor_enrolled_course_' . $course_id;
    $enrollment_data = get_user_meta($user_id, $enrollment_meta_key, true);
    $is_enrolled_meta = !empty($enrollment_data) && $enrollment_data['status'] === 'enrolled';
    
    // Also check using TutorLMS function if available
    $is_enrolled_tutor = false;
    if (function_exists('tutor_utils') && method_exists(tutor_utils(), 'is_enrolled')) {
        $is_enrolled_tutor = tutor_utils()->is_enrolled($course_id, $user_id);
    }
    
    $is_enrolled = $is_enrolled_meta || $is_enrolled_tutor;
    
    return array(
        'success' => true,
        'is_enrolled' => $is_enrolled,
        'user_id' => $user_id,
        'course_id' => $course_id,
        'source' => $is_enrolled_meta ? 'user_meta' : ($is_enrolled_tutor ? 'tutor_lms' : 'none')
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

