<?php
/**
 * Plugin Name: Helvetiforma Tutor Woo Fix
 * Description: Prevent Tutor Woo hook from running on REST order creation (no WC session).
 * Version: 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

add_action('plugins_loaded', function () {
    if (!class_exists('TUTOR\WooCommerce')) {
        return;
    }
    
    // Remove the hook that crashes on REST orders (WC()->session is null)
    // Original: add_action('woocommerce_new_order_item', [TUTOR\WooCommerce::instance(), 'course_placing_order_from_customer'], 10, 3);
    try {
        remove_action(
            'woocommerce_new_order_item',
            [TUTOR\WooCommerce::instance(), 'course_placing_order_from_customer'],
            10
        );
        
        // Log that the fix was applied
        error_log('Helvetiforma Tutor Woo Fix: Removed problematic Tutor WooCommerce hook');
    } catch (\Throwable $e) {
        error_log('Helvetiforma Tutor Woo Fix: Error removing hook - ' . $e->getMessage());
    }
});
