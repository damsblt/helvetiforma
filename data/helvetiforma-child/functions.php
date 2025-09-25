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


