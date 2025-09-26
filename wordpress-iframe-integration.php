<?php
/**
 * WordPress Iframe Integration Script
 * 
 * Add this code to your WordPress theme's functions.php file or create a plugin
 * This will enable communication between WordPress and your Next.js iframe
 */

// Add iframe detection and postMessage functionality
function helvetiforma_iframe_integration() {
    // Only run if we're in an iframe context
    if (!isset($_GET['iframe']) || $_GET['iframe'] !== '1') {
        return;
    }
    ?>
    <script type="text/javascript">
    (function() {
        // Check if we're in an iframe
        if (window.self === window.top) {
            return; // Not in iframe
        }

        // Get the parent origin from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const parentOrigin = urlParams.get('origin') || 'http://localhost:3000';

        // Function to send message to parent
        function sendMessageToParent(data) {
            try {
                window.parent.postMessage(JSON.stringify(data), parentOrigin);
            } catch (e) {
                console.warn('Failed to send message to parent:', e);
            }
        }

        // Listen for WordPress login and registration events
        document.addEventListener('DOMContentLoaded', function() {
            // Monitor login form submissions
            const loginForms = document.querySelectorAll('form[name="loginform"], #loginform, .tutor-login-form, .wp-login-form');
            
            loginForms.forEach(function(form) {
                form.addEventListener('submit', function(e) {
                    const formData = new FormData(form);
                    const username = formData.get('log') || formData.get('username') || formData.get('user_login');
                    const password = formData.get('pwd') || formData.get('password') || formData.get('user_pass');
                    
                    if (username && password) {
                        // Show loading state
                        sendMessageToParent({
                            type: 'tutor_auth',
                            action: 'login_attempt',
                            username: username
                        });
                    }
                });
            });

            // Monitor registration form submissions
            const registrationForms = document.querySelectorAll('form[name="registerform"], #registerform, .tutor-registration-form, .wp-registration-form, form[action*="register"]');
            
            registrationForms.forEach(function(form) {
                form.addEventListener('submit', function(e) {
                    const formData = new FormData(form);
                    const email = formData.get('user_email') || formData.get('email');
                    const username = formData.get('user_login') || formData.get('username');
                    
                    if (email) {
                        // Show loading state
                        sendMessageToParent({
                            type: 'tutor_auth',
                            action: 'registration_attempt',
                            email: email,
                            username: username
                        });
                    }
                });
            });

            // Monitor for login/registration success/error messages
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            const text = node.textContent.trim().toLowerCase();
                            
                            // Check for error messages
                            if (node.classList && (
                                node.classList.contains('login_error') ||
                                node.classList.contains('error') ||
                                node.classList.contains('tutor-alert-danger')
                            )) {
                                if (text.includes('register') || text.includes('inscription') || text.includes('account')) {
                                    sendMessageToParent({
                                        type: 'tutor_auth',
                                        action: 'registration_error',
                                        message: node.textContent.trim()
                                    });
                                } else {
                                    sendMessageToParent({
                                        type: 'tutor_auth',
                                        action: 'login_error',
                                        message: node.textContent.trim()
                                    });
                                }
                            }
                            
                            // Check for success messages
                            if (node.classList && (
                                node.classList.contains('message') ||
                                node.classList.contains('updated') ||
                                node.classList.contains('tutor-alert-success')
                            )) {
                                if (text.includes('verification') || text.includes('email') || text.includes('check')) {
                                    // Registration success with email verification
                                    const emailMatch = node.textContent.match(/[\w\.-]+@[\w\.-]+\.\w+/);
                                    sendMessageToParent({
                                        type: 'tutor_auth',
                                        action: 'registration_success',
                                        message: node.textContent.trim(),
                                        email: emailMatch ? emailMatch[0] : null
                                    });
                                } else {
                                    sendMessageToParent({
                                        type: 'tutor_auth',
                                        action: 'login_success',
                                        message: node.textContent.trim()
                                    });
                                }
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Monitor URL changes for redirect detection
            let currentUrl = window.location.href;
            setInterval(function() {
                if (window.location.href !== currentUrl) {
                    currentUrl = window.location.href;
                    
                    // If URL contains dashboard or profile, assume login success
                    if (currentUrl.includes('dashboard') || 
                        currentUrl.includes('profile') || 
                        currentUrl.includes('tableau-de-bord')) {
                        
                        sendMessageToParent({
                            type: 'tutor_auth',
                            action: 'login_success',
                            redirect_url: currentUrl
                        });
                    }
                }
            }, 1000);
        });

        // Hide WordPress admin bar in iframe
        const style = document.createElement('style');
        style.textContent = `
            #wpadminbar { display: none !important; }
            html { margin-top: 0 !important; }
            body { padding-top: 0 !important; }
            .tutor-container { padding-top: 20px; }
        `;
        document.head.appendChild(style);

        // Remove WordPress stats scripts
        const statsScripts = document.querySelectorAll('script[src*="stats.wp.com"]');
        statsScripts.forEach(function(script) {
            script.remove();
        });

    })();
    </script>
    <?php
}

// Hook into wp_footer for iframe pages
add_action('wp_footer', 'helvetiforma_iframe_integration');

// Disable WordPress stats for iframe requests
function helvetiforma_disable_stats_for_iframe() {
    if (isset($_GET['iframe']) && $_GET['iframe'] === '1') {
        // Disable Jetpack stats
        add_filter('jetpack_enable_open_graph', '__return_false');
        remove_action('wp_head', 'stats_add_shutdown_action');
        
        // Remove WordPress.com stats
        remove_action('wp_footer', 'stats_footer', 101);
    }
}
add_action('init', 'helvetiforma_disable_stats_for_iframe');

// Allow iframe embedding from your domain
function helvetiforma_allow_iframe_embedding() {
    if (isset($_GET['iframe']) && $_GET['iframe'] === '1') {
        // Remove X-Frame-Options header
        header_remove('X-Frame-Options');
        
        // Set custom headers to allow embedding
        header('X-Frame-Options: ALLOWALL');
        header('Content-Security-Policy: frame-ancestors *');
    }
}
add_action('send_headers', 'helvetiforma_allow_iframe_embedding');

?>
