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
    $home_url  = home_url('/');

    // Email content (HTML)
    $subject = sprintf('Bienvenue chez %s – Active ton compte', $site_name);

    $first_name = get_user_meta($user_id, 'first_name', true);
    $display = $first_name ?: ($user->display_name ?: $user->user_login);

    $message = '';
    $message .= '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#ffffff;color:#111">';
    $message .= '<h2 style="margin:0 0 16px;font-size:22px;">Bienvenue chez ' . esc_html($site_name) . ' 👋</h2>';
    $message .= '<p style="margin:0 0 12px;">Bonjour ' . esc_html($display) . ',</p>';
    $message .= '<p style="margin:0 0 12px;">Nous avons le plaisir de te compter parmi les étudiant·e·s de <strong>' . esc_html($site_name) . '</strong>.</p>';
    $message .= '<p style="margin:0 0 16px;">Pour définir ton mot de passe et te connecter, clique sur le bouton ci-dessous&nbsp;:</p>';
    $message .= '<p style="margin:24px 0;"><a href="' . esc_url($reset_url) . '" style="background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block">Définir mon mot de passe</a></p>';
    $message .= '<p style="margin:0 0 8px;font-size:14px;color:#555;">Si le bouton ne fonctionne pas, copie/colle ce lien dans ton navigateur&nbsp;:<br>' . esc_html($reset_url) . '</p>';
    $message .= '<hr style="border:0;border-top:1px solid #eee;margin:20px 0" />';
    $message .= '<p style="margin:0 0 8px;font-size:14px;color:#555;">Tu pourras ensuite te connecter depuis&nbsp;: <a href="' . esc_url($home_url) . 'login" style="color:#111">' . esc_html($home_url) . 'login</a></p>';
    $message .= '<p style="margin:0;font-size:12px;color:#777;">Si tu n’es pas à l’origine de cette action, ignore simplement cet email.</p>';
    $message .= '</div>';

    // Send email as HTML
    $headers = [ 'Content-Type: text/html; charset=UTF-8' ];
    wp_mail($user->user_email, $subject, $message, $headers);

    // Mark as sent to prevent duplicates
    update_user_meta($user_id, '_hvf_pw_mail_sent', current_time('mysql'));
}, 20, 1);

?>


