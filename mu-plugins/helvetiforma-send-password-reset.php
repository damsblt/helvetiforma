<?php
/*
Plugin Name: HelvetiForma Password Reset on Registration
Description: Sends a password reset link to new users upon registration to ensure they can set their password.
Version: 1.0.0
Author: HelvetiForma
*/

if (!defined('ABSPATH')) { exit; }

// Send password reset link when a new user is registered
add_action('user_register', function ($user_id) {
    $user = get_user_by('id', $user_id);
    if (!$user || empty($user->user_email)) {
        return;
    }

    // Avoid sending to administrators and avoid duplicates
    $roles = is_array($user->roles) ? $user->roles : [];
    if (in_array('administrator', $roles, true)) {
        return;
    }
    if (get_user_meta($user_id, '_hvf_pw_mail_sent', true)) {
        return;
    }

    // Generate password reset key and URL
    $key = get_password_reset_key($user);
    if (is_wp_error($key)) {
        return; // If WordPress fails to generate a key, do not attempt to email
    }

    $reset_url = network_site_url('wp-login.php?action=rp&key=' . $key . '&login=' . rawurlencode($user->user_login), 'login');
    $site_name = wp_specialchars_decode(get_option('blogname'), ENT_QUOTES);

    // Email content (plain text)
    $subject = sprintf('[%s] Définissez votre mot de passe', $site_name);
    $lines   = [];
    $lines[] = sprintf('Bonjour %s,', $user->display_name ?: $user->user_login);
    $lines[] = '';
    $lines[] = sprintf('Votre compte a été créé sur %s.', $site_name);
    $lines[] = '';
    $lines[] = 'Pour définir votre mot de passe, cliquez sur le lien ci-dessous :';
    $lines[] = $reset_url;
    $lines[] = '';
    $lines[] = "Si vous n’êtes pas à l’origine de cette action, ignorez cet email.";
    $message = implode("\n", $lines);

    // Send email
    wp_mail($user->user_email, $subject, $message);

    // Mark as sent to prevent duplicates
    update_user_meta($user_id, '_hvf_pw_mail_sent', current_time('mysql'));
}, 20, 1);

?>


