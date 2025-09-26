<?php
/**
 * WordPress Registration Fix Plugin
 * 
 * This plugin helps resolve registration permission issues
 * Add this to your WordPress site as a plugin or in functions.php
 */

// Enable user registration programmatically
function helvetiforma_enable_registration() {
    // Allow registration for API requests
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
        add_filter('option_users_can_register', '__return_true');
    }
}
add_action('init', 'helvetiforma_enable_registration');

// Custom registration endpoint for HelvetiForma
function helvetiforma_custom_registration_endpoint() {
    register_rest_route('helvetiforma/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'helvetiforma_handle_registration',
        'permission_callback' => '__return_true', // Allow public access
        'args' => array(
            'username' => array(
                'required' => true,
                'type' => 'string',
            ),
            'email' => array(
                'required' => true,
                'type' => 'string',
                'format' => 'email',
            ),
            'password' => array(
                'required' => true,
                'type' => 'string',
            ),
            'first_name' => array(
                'required' => false,
                'type' => 'string',
            ),
            'last_name' => array(
                'required' => false,
                'type' => 'string',
            ),
            'role' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'subscriber',
            ),
        ),
    ));
}
add_action('rest_api_init', 'helvetiforma_custom_registration_endpoint');

// Handle custom registration
function helvetiforma_handle_registration($request) {
    $username = sanitize_user($request['username']);
    $email = sanitize_email($request['email']);
    $password = $request['password'];
    $first_name = sanitize_text_field($request['first_name'] ?? '');
    $last_name = sanitize_text_field($request['last_name'] ?? '');
    $role = sanitize_text_field($request['role'] ?? 'subscriber');

    // Validate inputs
    if (empty($username) || empty($email) || empty($password)) {
        return new WP_Error('missing_fields', 'Username, email, and password are required.', array('status' => 400));
    }

    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
    }

    if (username_exists($username)) {
        return new WP_Error('username_exists', 'Username already exists.', array('status' => 400));
    }

    if (email_exists($email)) {
        return new WP_Error('email_exists', 'Email already exists.', array('status' => 400));
    }

    // Create user
    $user_data = array(
        'user_login' => $username,
        'user_email' => $email,
        'user_pass' => $password,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'role' => $role,
        'show_admin_bar_front' => false,
    );

    $user_id = wp_insert_user($user_data);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
    }

    // Send welcome email
    wp_new_user_notification($user_id, null, 'both');

    // Return user data
    $user = get_user_by('id', $user_id);
    
    return array(
        'id' => $user_id,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'roles' => $user->roles,
        'message' => 'User registered successfully. Please check your email for verification instructions.'
    );
}

// Allow public registration via standard WordPress endpoint
function helvetiforma_allow_public_registration($result, $request, $route) {
    // Allow user creation for specific routes
    if ($route === '/wp/v2/users' && $request->get_method() === 'POST') {
        // Temporarily enable registration
        add_filter('option_users_can_register', '__return_true');
        
        // Allow the request to proceed
        return $result;
    }
    
    return $result;
}
add_filter('rest_pre_dispatch', 'helvetiforma_allow_public_registration', 10, 3);

// Custom permission callback for user creation
function helvetiforma_user_creation_permissions($permission, $request, $key) {
    if ($key === 'create_users' && $request->get_route() === '/wp/v2/users') {
        // Allow user creation from our frontend
        $origin = $request->get_header('origin');
        $allowed_origins = array(
            'http://localhost:3000',
            'https://helvetiforma.vercel.app',
            'https://helvetiforma.ch'
        );
        
        if (in_array($origin, $allowed_origins)) {
            return true;
        }
    }
    
    return $permission;
}
add_filter('rest_user_collection_params', 'helvetiforma_user_creation_permissions', 10, 3);

// Modify user registration capability check
function helvetiforma_modify_user_caps($allcaps, $cap, $args) {
    // Allow user creation for API requests from our domain
    if (in_array('create_users', $cap)) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed_origins = array(
            'http://localhost:3000',
            'https://helvetiforma.vercel.app',
            'https://helvetiforma.ch'
        );
        
        if (in_array($origin, $allowed_origins)) {
            $allcaps['create_users'] = true;
        }
    }
    
    return $allcaps;
}
add_filter('user_has_cap', 'helvetiforma_modify_user_caps', 10, 3);

// Log registration attempts for debugging
function helvetiforma_log_registration_attempts() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (isset($data['email']) && (isset($data['username']) || isset($data['user_login']))) {
            error_log('HelvetiForma Registration Attempt: ' . print_r(array(
                'email' => $data['email'],
                'username' => $data['username'] ?? $data['user_login'] ?? 'unknown',
                'route' => $_SERVER['REQUEST_URI'],
                'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'unknown',
                'timestamp' => current_time('mysql')
            ), true));
        }
    }
}
add_action('init', 'helvetiforma_log_registration_attempts');

?>
