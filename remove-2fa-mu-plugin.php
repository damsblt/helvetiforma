<?php
/**
 * Remove 2FA Message - Must-Use Plugin
 * 
 * INSTRUCTIONS:
 * 1. Download this file
 * 2. Upload it to: wp-content/mu-plugins/
 * 3. The 2FA message will be removed automatically
 * 
 * This is a mu-plugin that will run automatically without needing admin access
 */

// Only run if WordPress is loaded
if (!defined('ABSPATH')) {
    return;
}

// Add JavaScript to remove 2FA messages on login page
add_action('login_head', function() {
    echo '<script>
    document.addEventListener("DOMContentLoaded", function() {
        console.log("2FA Message Remover Mu-Plugin: Starting...");
        
        function remove2FAMessage() {
            var allElements = document.querySelectorAll("*");
            var removedCount = 0;
            
            for (var i = 0; i < allElements.length; i++) {
                var element = allElements[i];
                if (element.textContent && element.textContent.indexOf("Login failed due to incorrect 2FA setup") !== -1) {
                    console.log("2FA Message Remover: Removing 2FA message element");
                    element.style.display = "none";
                    element.remove();
                    removedCount++;
                }
            }
            
            // Also remove error divs
            var errorDivs = document.querySelectorAll(".error, .message, .notice");
            for (var j = 0; j < errorDivs.length; j++) {
                var errorDiv = errorDivs[j];
                if (errorDiv.textContent && (
                    errorDiv.textContent.indexOf("2FA") !== -1 ||
                    errorDiv.textContent.indexOf("incorrect") !== -1 ||
                    errorDiv.textContent.indexOf("setup") !== -1
                )) {
                    console.log("2FA Message Remover: Removing error div");
                    errorDiv.style.display = "none";
                    errorDiv.remove();
                    removedCount++;
                }
            }
            
            if (removedCount > 0) {
                console.log("2FA Message Remover: Removed " + removedCount + " elements");
            }
        }
        
        // Run immediately and with delays
        remove2FAMessage();
        setTimeout(remove2FAMessage, 100);
        setTimeout(remove2FAMessage, 500);
        setTimeout(remove2FAMessage, 1000);
        
        // Watch for dynamically added content
        if (typeof MutationObserver !== "undefined") {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length > 0) {
                        remove2FAMessage();
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        console.log("2FA Message Remover Mu-Plugin: Setup complete");
    });
    </script>';
});

// Log that this mu-plugin is active
error_log('2FA Message Remover Mu-Plugin: Loaded successfully');
?>

