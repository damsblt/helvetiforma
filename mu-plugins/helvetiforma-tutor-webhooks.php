<?php
/**
 * Plugin Name: HelvetiForma Tutor Course Webhooks
 * Description: Sends webhooks to Next.js app when TutorLMS courses are created/updated
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Returns the Next.js base URL where webhooks should be sent
 */
function hf_get_nextjs_base_url() {
	// Prefer explicit option, fallback to production Next.js domain
	$option = get_option('helvetiforma_nextjs_url');
	$default = 'https://helvetiforma.ch';
	return rtrim($option ? $option : $default, '/');
}

/**
 * Sends a JSON webhook to the Next.js app
 */
function hf_send_nextjs_webhook($path, $payload = array()) {
	$base = hf_get_nextjs_base_url();
	$url = $base . $path;

	$args = array(
		'body' => wp_json_encode($payload),
		'headers' => array(
			'Content-Type' => 'application/json',
			'X-Webhook-Source' => 'wordpress',
		),
		'timeout' => 8,
		'blocking' => false,
	);

	wp_remote_post($url, $args);
}

/**
 * Hook into TutorLMS course creation and updates
 * We try to support both Classic (post save) and Tutor-specific hooks if available.
 */
function hf_tutor_course_after_save($post_id, $post, $update) {
	// Ensure this is a TutorLMS Course post type
	if (get_post_type($post_id) !== 'courses') {
		return;
	}

	// Only fire on publish or update statuses
	if (!in_array($post->post_status, array('publish', 'draft', 'pending'), true)) {
		return;
	}

	$action = $update ? 'course_updated' : 'course_created';

	// Gather key meta (price, price type) from post meta
	$price = '';
	$price_type = '';
	// Prefer Tutor utils when available
	if (function_exists('tutor_utils')) {
		try {
			$utils = tutor_utils();
			$price_raw = method_exists($utils, 'get_course_price') ? $utils->get_course_price($post_id) : '';
			$price_type_raw = method_exists($utils, 'get_course_price_type') ? $utils->get_course_price_type($post_id) : '';
			$price = is_string($price_raw) ? $price_raw : (string) $price_raw;
			$price_type = is_string($price_type_raw) ? $price_type_raw : (string) $price_type_raw;
		} catch (\Throwable $e) {}
	}
	// Fallback to post meta
	if ($price === '' || $price === null) {
		$price = get_post_meta($post_id, '_course_price', true);
		if ($price === '' || $price === null) {
			$price = get_post_meta($post_id, '_tutor_course_price', true);
		}
	}
	if ($price_type === '' || $price_type === null) {
		$price_type = get_post_meta($post_id, '_course_price_type', true);
		if ($price_type === '' || $price_type === null) {
			$price_type = get_post_meta($post_id, '_tutor_course_price_type', true);
		}
	}
	// Sanitize price to decimal string
	if (is_string($price)) {
		$price = preg_replace('/[^0-9\.,]/', '', $price);
		$price = str_replace(',', '.', $price);
		if ($price !== '' && is_numeric($price)) {
			$price = number_format((float) $price, 2, '.', '');
		}
	}

	// Send to Next.js webhooks (course-created endpoint handles both create/update logic)
	hf_send_nextjs_webhook('/api/webhooks/tutor-course-created', array(
		'course_id' => (int) $post_id,
		'action' => $action,
		'wp_rest' => true,
		'post_status' => $post->post_status,
		'title' => get_the_title($post_id),
		'course_price' => (string) $price,
		'course_price_type' => (string) $price_type,
	));

	// Also send explicitly to the update endpoint for clarity when updating
	if ($update) {
		hf_send_nextjs_webhook('/api/webhooks/tutor-course-updated', array(
			'course_id' => (int) $post_id,
			'action' => 'course_updated',
			'wp_rest' => true,
			'post_status' => $post->post_status,
			'title' => get_the_title($post_id),
			'course_price' => (string) $price,
			'course_price_type' => (string) $price_type,
		));
	}
}
add_action('save_post', 'hf_tutor_course_after_save', 10, 3);

/**
 * If TutorLMS exposes specific hooks, also attach for redundancy
 */
function hf_tutor_specific_hooks_support() {
	// When TutorLMS explicitly signals a course is created
	if (has_action('tutor_course_created')) {
		add_action('tutor_course_created', function($course_id) {
			$price = get_post_meta($course_id, '_course_price', true);
			if ($price === '' || $price === null) {
				$alt_price = get_post_meta($course_id, '_tutor_course_price', true);
				$price = ($alt_price !== '' && $alt_price !== null) ? $alt_price : '';
			}
			$price_type = get_post_meta($course_id, '_course_price_type', true);
			if ($price_type === '' || $price_type === null) {
				$alt_price_type = get_post_meta($course_id, '_tutor_course_price_type', true);
				$price_type = ($alt_price_type !== '' && $alt_price_type !== null) ? $alt_price_type : '';
			}
			hf_send_nextjs_webhook('/api/webhooks/tutor-course-created', array(
				'course_id' => (int) $course_id,
				'action' => 'course_created',
				'wp_rest' => true,
				'course_price' => (string) $price,
				'course_price_type' => (string) $price_type,
			));
		});
	}

	// When TutorLMS explicitly signals a course is updated
	if (has_action('tutor_course_updated')) {
		add_action('tutor_course_updated', function($course_id) {
			$price = get_post_meta($course_id, '_course_price', true);
			if ($price === '' || $price === null) {
				$alt_price = get_post_meta($course_id, '_tutor_course_price', true);
				$price = ($alt_price !== '' && $alt_price !== null) ? $alt_price : '';
			}
			$price_type = get_post_meta($course_id, '_course_price_type', true);
			if ($price_type === '' || $price_type === null) {
				$alt_price_type = get_post_meta($course_id, '_tutor_course_price_type', true);
				$price_type = ($alt_price_type !== '' && $alt_price_type !== null) ? $alt_price_type : '';
			}
			hf_send_nextjs_webhook('/api/webhooks/tutor-course-updated', array(
				'course_id' => (int) $course_id,
				'action' => 'course_updated',
				'wp_rest' => true,
				'course_price' => (string) $price,
				'course_price_type' => (string) $price_type,
			));
		});
	}
}
add_action('init', 'hf_tutor_specific_hooks_support');

/**
 * Trigger update webhook when price-related meta changes
 */
function hf_tutor_price_meta_updated($meta_id, $object_id, $meta_key, $_meta_value) {
	if (get_post_type($object_id) !== 'courses') {
		return;
	}
	$tracked_keys = array('_course_price', '_tutor_course_price', '_course_price_type', '_tutor_course_price_type');
	if (!in_array($meta_key, $tracked_keys, true)) {
		return;
	}
	// Re-compute and send update webhook
	$post = get_post($object_id);
	if (!$post) return;
	hf_tutor_course_after_save($object_id, $post, true);
}
add_action('updated_post_meta', 'hf_tutor_price_meta_updated', 10, 4);


