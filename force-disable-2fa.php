<?php
/**
 * Force Disable 2FA - Must-Use Plugin
 * This plugin completely disables all 2FA functionality and removes any 2FA messages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Force disable all 2FA plugins and functionality
add_action('init', function() {
    // Remove all 2FA hooks and filters
    remove_all_actions('login_form');
    remove_all_actions('wp_login');
    remove_all_actions('login_init');
    remove_all_actions('authenticate');
    remove_all_filters('authenticate');
    remove_all_filters('login_message');
    remove_all_filters('wp_login_errors');
    
    // Disable Wordfence 2FA
    if (class_exists('wfConfig')) {
        wfConfig::set('loginSecurityEnabled', false);
        wfConfig::set('twoFactor', false);
        wfConfig::set('twoFactorUsers', array());
    }
    
    // Disable iThemes Security 2FA
    if (class_exists('ITSEC_Two_Factor')) {
        remove_action('login_form', array('ITSEC_Two_Factor', 'login_form'));
        remove_action('wp_login', array('ITSEC_Two_Factor', 'wp_login'));
    }
    
    // Disable WP 2FA plugin
    if (class_exists('WP_2FA')) {
        remove_action('login_form', array('WP_2FA', 'login_form'));
        remove_action('wp_login', array('WP_2FA', 'wp_login'));
    }
    
    // Disable any other 2FA plugins
    remove_action('login_form', 'wp_2fa_login_form');
    remove_action('wp_login', 'wp_2fa_wp_login');
    remove_action('login_init', 'wp_2fa_login_init');
});

// Completely clear any 2FA login messages
add_filter('login_message', function($message) {
    // Remove any message containing 2FA, two factor, or similar
    if (preg_match('/2fa|two.?factor|mfa|multi.?factor|incorrect.*setup|setup.*incorrect/i', $message)) {
        return '';
    }
    return $message;
}, 999);

// Clear login errors
add_filter('wp_login_errors', function($errors) {
    if (is_wp_error($errors)) {
        $codes = $errors->get_error_codes();
        foreach ($codes as $code) {
            if (preg_match('/2fa|two.?factor|mfa|multi.?factor/i', $code)) {
                $errors->remove($code);
            }
        }
    }
    return $errors;
}, 999);

// Force remove 2FA from all users on every login
add_action('wp_login', function($user_login, $user) {
    if ($user && $user->ID) {
        // Remove all possible 2FA meta fields
        $mfa_fields = array(
            'two_factor_enabled',
            'two_factor_secret',
            'two_factor_backup_codes',
            'wordfence_2fa_secret',
            'wordfence_2fa_recovery_codes',
            'ithemes_2fa_secret',
            'ithemes_2fa_backup_codes',
            'wp_2fa_enabled',
            'wp_2fa_secret',
            'wp_2fa_backup_codes',
            '2fa_enabled',
            '2fa_secret',
            'mfa_enabled',
            'mfa_secret',
            'two_factor_auth_enabled',
            'two_factor_auth_secret',
            'two_factor_auth_backup_codes',
            'tfa_enabled',
            'tfa_secret',
            'tfa_backup_codes'
        );
        
        foreach ($mfa_fields as $field) {
            delete_user_meta($user->ID, $field);
        }
        
        // Set explicit disable flags
        update_user_meta($user->ID, 'two_factor_enabled', '0');
        update_user_meta($user->ID, '2fa_enabled', '0');
        update_user_meta($user->ID, 'mfa_enabled', '0');
        update_user_meta($user->ID, 'wp_2fa_enabled', '0');
    }
}, 10, 2);

// Override authentication to bypass 2FA
add_filter('authenticate', function($user, $username, $password) {
    if (is_wp_error($user)) {
        $codes = $user->get_error_codes();
        foreach ($codes as $code) {
            if (preg_match('/2fa|two.?factor|mfa|multi.?factor/i', $code)) {
                $user->remove($code);
            }
        }
    }
    return $user;
}, 999, 3);

// Add JavaScript to remove any client-side 2FA messages
add_action('login_head', function() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Remove any 2FA error messages
        const errorMessages = document.querySelectorAll('.message, .error, .notice');
        errorMessages.forEach(function(msg) {
            if (msg.textContent.includes('2FA') || 
                msg.textContent.includes('two factor') || 
                msg.textContent.includes('incorrect') ||
                msg.textContent.includes('setup')) {
                msg.style.display = 'none';
                msg.remove();
            }
        });
        
        // Remove any overlays or popups
        const overlays = document.querySelectorAll('[style*="overlay"], [style*="z-index"], .overlay, .popup');
        overlays.forEach(function(overlay) {
            if (overlay.textContent.includes('Password') || 
                overlay.textContent.includes('déverrouiller') ||
                overlay.textContent.includes('2FA')) {
                overlay.style.display = 'none';
                overlay.remove();
            }
        });
        
        // Force remove any injected content
        const allElements = document.querySelectorAll('*');
        allElements.forEach(function(el) {
            if (el.textContent && (
                el.textContent.includes('Login failed due to incorrect 2FA setup') ||
                el.textContent.includes('Password dans la barre d\'outils') ||
                el.textContent.includes('déverrouiller')
            )) {
                el.style.display = 'none';
                el.remove();
            }
        });
    });
    </script>
    <?php
});

// Disable 2FA plugins at the database level
add_action('plugins_loaded', function() {
    // Deactivate 2FA plugins
    $mfa_plugins = array(
        'wordfence/wordfence.php',
        'ithemes-security-pro/ithemes-security-pro.php',
        'wp-2fa/wp-2fa.php',
        'two-factor/two-factor.php',
        'wp-security-audit-log/wp-security-audit-log.php'
    );
    
    foreach ($mfa_plugins as $plugin) {
        if (is_plugin_active($plugin)) {
            deactivate_plugins($plugin);
        }
    }
});

// Log successful 2FA removal
add_action('wp_login', function($user_login, $user) {
    error_log("2FA FORCE DISABLED: User {$user_login} (ID: {$user->ID}) logged in successfully after 2FA removal");
}, 20, 2);
?>

