<?php
/**
 * Block Theme 2FA Fix - Add to functions.php
 * 
 * INSTRUCTIONS:
 * 1. Download this file
 * 2. Go to: wp-content/themes/twentytwentyfive/
 * 3. Edit: functions.php
 * 4. Add the code at the END of the file
 * 5. Save the file
 */

// Add this code to the END of your functions.php file
// This will add JavaScript to remove the 2FA message

add_action('wp_head', function() {
    // Only add to login page
    if (is_admin() || (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'wp-login.php') !== false)) {
        echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("2FA Message Remover: Starting...");
            
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
                var errorDivs = document.querySelectorAll(".error, .message, .notice, .login-message");
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
            
            console.log("2FA Message Remover: Setup complete");
        });
        </script>';
    }
});

// Log that this fix is active
error_log('2FA Message Remover: Active in functions.php');
?>

