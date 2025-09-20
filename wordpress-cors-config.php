<?php
/**
 * WordPress CORS Configuration for WooCommerce API
 * Add this to your WordPress functions.php or create as a plugin
 */

// Add CORS headers for WooCommerce REST API
add_action('rest_api_init', function() {
    // Remove default CORS headers if any
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    
    // Add custom CORS headers
    add_filter('rest_pre_serve_request', function($value) {
        // Get the origin from the request
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        
        // Define allowed origins (replace with your Vercel domain)
        $allowed_origins = [
            'https://helvetiforma.vercel.app',
            'https://helvetiforma-ch.vercel.app',
            'https://helvetiforma-git-main.vercel.app',
            'http://localhost:3000', // For development
        ];
        
        // Check if origin is allowed
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept, User-Agent');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400'); // 24 hours
        
        return $value;
    });
});

// Handle preflight OPTIONS requests
add_action('init', function() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        
        $allowed_origins = [
            'https://helvetiforma.vercel.app',
            'https://helvetiforma-ch.vercel.app',
            'https://helvetiforma-git-main.vercel.app',
            'http://localhost:3000',
        ];
        
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept, User-Agent');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        
        http_response_code(200);
        exit();
    }
});

// Add security headers for WooCommerce API
add_action('rest_api_init', function() {
    add_filter('rest_pre_serve_request', function($value) {
        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        return $value;
    });
});

// Rate limiting for WooCommerce API (optional)
add_action('rest_api_init', function() {
    add_filter('rest_pre_dispatch', function($result, $server, $request) {
        // Only apply to WooCommerce endpoints
        if (strpos($request->get_route(), '/wc/') !== false) {
            // Implement basic rate limiting here if needed
            // This is a simple example - you might want to use a more sophisticated solution
        }
        
        return $result;
    }, 10, 3);
});

// Log WooCommerce API requests for debugging
add_action('rest_api_init', function() {
    add_filter('rest_pre_dispatch', function($result, $server, $request) {
        if (strpos($request->get_route(), '/wc/') !== false) {
            error_log('WooCommerce API Request: ' . $request->get_method() . ' ' . $request->get_route());
        }
        
        return $result;
    }, 10, 3);
});
?>
