<?php
/**
 * TutorLMS Enrollment Endpoint
 * Custom WordPress endpoint for handling course enrollments
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register custom REST API endpoint for course enrollment
 */
add_action('rest_api_init', function () {
    register_rest_route('tutor/v1', '/enroll', array(
        'methods' => 'POST',
        'callback' => 'tutor_handle_enrollment',
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
            'status' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'enrolled',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        ),
    ));
});

/**
 * Handle course enrollment
 */
function tutor_handle_enrollment($request) {
    $user_id = $request->get_param('user_id');
    $course_id = $request->get_param('course_id');
    $status = $request->get_param('status');
    
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
    
    // Create enrollment record
    $enrollment_data = array(
        'user_id' => $user_id,
        'course_id' => $course_id,
        'status' => $status,
        'enrolled_at' => current_time('mysql'),
        'completion_percent' => 0
    );
    
    // Insert into tutor_enrolled table
    global $wpdb;
    $table_name = $wpdb->prefix . 'tutor_enrolled';
    
    $result = $wpdb->insert(
        $table_name,
        $enrollment_data,
        array('%d', '%d', '%s', '%s', '%d')
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
        'status' => $status
    );
    
    update_user_meta($user_id, '_tutor_enrolled_courses', $enrolled_courses);
    
    // Trigger TutorLMS enrollment action
    do_action('tutor_after_enrolled', $course_id, $user_id);
    
    return array(
        'success' => true,
        'message' => 'User successfully enrolled in course',
        'data' => array(
            'user_id' => $user_id,
            'course_id' => $course_id,
            'status' => $status,
            'enrolled_at' => $enrollment_data['enrolled_at']
        )
    );
}

/**
 * Register custom REST API endpoint for checking enrollments
 */
add_action('rest_api_init', function () {
    register_rest_route('tutor/v1', '/enrollments', array(
        'methods' => 'GET',
        'callback' => 'tutor_get_user_enrollments',
        'permission_callback' => '__return_true', // Allow public access for now
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
 * Get user enrollments
 */
function tutor_get_user_enrollments($request) {
    $user_id = $request->get_param('user_id');
    
    // Validate user exists
    $user = get_user_by('id', $user_id);
    if (!$user) {
        return new WP_Error('invalid_user', 'User not found', array('status' => 404));
    }
    
    // Get enrollments from database
    global $wpdb;
    $table_name = $wpdb->prefix . 'tutor_enrolled';
    
    $enrollments = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$table_name} WHERE user_id = %d ORDER BY enrolled_at DESC",
        $user_id
    ));
    
    return array(
        'success' => true,
        'data' => $enrollments
    );
}

