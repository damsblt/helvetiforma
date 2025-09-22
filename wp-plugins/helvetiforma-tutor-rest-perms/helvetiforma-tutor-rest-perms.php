<?php
/*
Plugin Name: HelvetiForma Tutor REST Permissions
Description: Allow WordPress Admins (including via Application Password) to access TutorLMS REST routes and create enrollments.
Author: HelvetiForma
Version: 1.0.1
*/

if (!defined('ABSPATH')) { exit; }

// Hardened permission override for all TutorLMS routes, admins only
add_filter('rest_endpoints', function ($endpoints) {
    $allow_admin = function () {
        return current_user_can('manage_options');
    };

    foreach ($endpoints as $route => $handlers) {
        if (strpos($route, '/tutor/v1/') !== 0 || !is_array($handlers)) {
            continue;
        }
        foreach ($handlers as $idx => $handler) {
            if (is_array($handler)) {
                $handler['permission_callback'] = $allow_admin;
                $endpoints[$route][$idx] = $handler;
            }
        }
    }
    return $endpoints;
}, 999);

// Safety net: if a route still blocks in its permission callback chain, allow admins right before callbacks execute
add_filter('rest_request_before_callbacks', function ($response, $handler, $request) {
    $route = is_callable([$request, 'get_route']) ? $request->get_route() : '';
    if (strpos($route, '/tutor/v1/') === 0 && current_user_can('manage_options')) {
        return null; // Continue to callbacks as authorized
    }
    return $response;
}, 5, 3);


