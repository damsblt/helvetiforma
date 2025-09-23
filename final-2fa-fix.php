<?php
/**
 * Final 2FA Fix - Add this to your WordPress theme's functions.php
 * This will remove the 2FA message that's being injected client-side
 */

// Add this code to the END of your active theme's functions.php file
// Location: wp-content/themes/twentytwentyfive/functions.php

add_action('login_head', function() {
    echo '<script>
    document.addEventListener("DOMContentLoaded", function() {
        console.log("2FA Message Remover: Starting...");
        
        function remove2FAMessage() {
            // Remove any element containing the exact 2FA message
            var allElements = document.querySelectorAll("*");
            var removedCount = 0;
            
            for (var i = 0; i < allElements.length; i++) {
                var element = allElements[i];
                if (element.textContent && element.textContent.indexOf("Login failed due to incorrect 2FA setup") !== -1) {
                    console.log("2FA Message Remover: Removing element with 2FA message");
                    element.style.display = "none";
                    element.remove();
                    removedCount++;
                }
            }
            
            // Also remove any error/message divs that might contain 2FA text
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
        
        // Run immediately
        remove2FAMessage();
        
        // Run again after delays to catch dynamically loaded content
        setTimeout(remove2FAMessage, 100);
        setTimeout(remove2FAMessage, 500);
        setTimeout(remove2FAMessage, 1000);
        
        // Watch for new content being added dynamically
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
});
?>

