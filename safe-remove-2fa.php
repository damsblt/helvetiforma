<?php
/**
 * Safe Remove 2FA Message - Must-Use Plugin
 * Simple and safe version to remove 2FA messages
 */

// Only run if WordPress is loaded
if (!defined('ABSPATH')) {
    return;
}

// Remove 2FA login messages
add_filter('login_message', function($message) {
    if (empty($message)) {
        return $message;
    }
    
    // Simple check for 2FA message
    if (strpos($message, '2FA') !== false || 
        strpos($message, 'incorrect') !== false || 
        strpos($message, 'setup') !== false) {
        return '';
    }
    
    return $message;
}, 999);

// Add JavaScript to remove client-side messages
add_action('login_head', function() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        function remove2FA() {
            var elements = document.querySelectorAll('*');
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                if (el.textContent && el.textContent.indexOf('Login failed due to incorrect 2FA setup') !== -1) {
                    el.style.display = 'none';
                }
            }
        }
        remove2FA();
        setTimeout(remove2FA, 100);
    });
    </script>
    <?php
});
?>

