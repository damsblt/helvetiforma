// ==UserScript==
// @name         Aggressive 2FA Message Remover - HelvetiForma
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Aggressively remove 2FA messages from WordPress login
// @author       You
// @match        https://api.helvetiforma.ch/wp-login.php*
// @match        https://api.helvetiforma.ch/wp-admin*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Aggressive 2FA Message Remover loaded');

    // Function to remove 2FA messages
    function remove2FAMessage() {
        // Strategy 1: Remove by text content
        const errorElements = document.querySelectorAll('*');
        errorElements.forEach(element => {
            if (element.textContent && element.textContent.includes('Login failed due to incorrect 2FA setup')) {
                console.log('🗑️ Removing 2FA message by text content');
                element.remove();
            }
        });

        // Strategy 2: Remove by class names
        const classSelectors = [
            '.error',
            '.notice',
            '.notice-error',
            '.wp-die-message',
            '.login-error',
            '.message',
            '.alert'
        ];
        
        classSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.textContent && element.textContent.includes('2FA')) {
                    console.log('🗑️ Removing 2FA message by class:', selector);
                    element.remove();
                }
            });
        });

        // Strategy 3: Remove by ID
        const idSelectors = [
            '#login_error',
            '#error',
            '#notice',
            '#message'
        ];
        
        idSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element && element.textContent && element.textContent.includes('2FA')) {
                console.log('🗑️ Removing 2FA message by ID:', selector);
                element.remove();
            }
        });

        // Strategy 4: Remove by data attributes
        const dataElements = document.querySelectorAll('[data-message*="2FA"], [data-error*="2FA"]');
        dataElements.forEach(element => {
            console.log('🗑️ Removing 2FA message by data attribute');
            element.remove();
        });
    }

    // Strategy 5: Override console.error to catch 2FA messages
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('2FA') || message.includes('Two-Factor')) {
            console.log('🚫 Blocked 2FA console error:', message);
            return;
        }
        originalConsoleError.apply(console, args);
    };

    // Strategy 6: Override alert/confirm to block 2FA messages
    const originalAlert = window.alert;
    window.alert = function(message) {
        if (message && message.includes('2FA')) {
            console.log('🚫 Blocked 2FA alert:', message);
            return;
        }
        originalAlert(message);
    };

    // Strategy 7: Monitor DOM mutations
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.textContent && node.textContent.includes('2FA')) {
                        console.log('🗑️ Removing 2FA message from DOM mutation');
                        node.remove();
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Strategy 8: Continuous removal every 100ms
    setInterval(remove2FAMessage, 100);

    // Strategy 9: Remove on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', remove2FAMessage);
    } else {
        remove2FAMessage();
    }

    // Strategy 10: Remove on window load
    window.addEventListener('load', remove2FAMessage);

    console.log('✅ Aggressive 2FA Message Remover active - monitoring every 100ms');
})();

