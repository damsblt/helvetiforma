<?php
// Enqueue app-like styles and fonts
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_style(
    'hf-app',
    get_stylesheet_directory_uri() . '/assets/helvetiforma-app.css',
    [],
    '1.0.0'
  );
  wp_enqueue_style(
    'hf-fonts',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    [],
    null
  );
});

// Register a primary menu location
add_action('after_setup_theme', function () {
  register_nav_menus([
    'primary' => __('Navigation principale', 'helvetiforma'),
  ]);
});

// Expose Tutor LMS product ID via REST without a plugin (very lightweight)
add_action('init', function () {
  // Tutor commonly uses post type slug 'courses' (sometimes 'tutor_course'). Support both.
  foreach (['courses', 'tutor_course'] as $post_type) {
    register_post_meta($post_type, '_tutor_course_product_id', [
      'type'          => 'integer',
      'single'        => true,
      'show_in_rest'  => true,
      'auth_callback' => '__return_true', // public read-only
    ]);
  }
});

// Also add a top-level REST field "product_id" for easy consumption
add_action('rest_api_init', function () {
  foreach (['courses', 'tutor_course'] as $post_type) {
    register_rest_field($post_type, 'product_id', [
      'get_callback' => function ($object) {
        return (int) get_post_meta((int) $object['id'], '_tutor_course_product_id', true);
      },
      'schema' => [ 'type' => 'integer', 'context' => ['view'] ],
    ]);
  }
});

// Remove X-Frame-Options header to allow iframe embedding
add_action('send_headers', function () {
  header_remove('X-Frame-Options');
});

// Add custom headers for iframe embedding
add_action('wp_headers', function ($headers) {
  // Allow framing from HelvetiForma domains
  $headers['X-Frame-Options'] = 'ALLOWALL';
  $headers['Content-Security-Policy'] = "frame-ancestors 'self' https://helvetiforma.ch https://*.helvetiforma.ch https://helvetiforma.vercel.app https://*.vercel.app http://localhost:3000;";
  return $headers;
});

// Add permissions policy for payment and other features in iframes
add_action('wp_head', function () {
  echo '<meta http-equiv="Permissions-Policy" content="payment=*, fullscreen=*, camera=*, microphone=*, geolocation=*">' . "\n";
});

// Disable WordPress.com stats if causing issues
add_action('wp_enqueue_scripts', function () {
  // Remove WordPress.com stats if present
  wp_dequeue_script('stats');
  wp_deregister_script('stats');
}, 100);

// Suppress WordPress.com stats via filter if available
add_filter('option_blog_public', function ($value) {
  // This can help disable some tracking scripts
  return $value;
});

// Alternative method to disable Jetpack stats if present
add_filter('jetpack_enable_open_graph', '__return_false');
add_filter('jetpack_disable_eu_cookie_law_widget', '__return_true');


