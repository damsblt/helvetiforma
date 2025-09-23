// ==UserScript==
// @name         Nuclear 2FA Message Remover - HelvetiForma
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Nuclear option to remove 2FA messages and block extension interference
// @author       You
// @match        https://api.helvetiforma.ch/wp-login.php*
// @match        https://api.helvetiforma.ch/wp-admin*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Nuclear 2FA Message Remover loaded - BLOCKING ALL EXTENSIONS');

    // BLOCK ALL EXTENSION SCRIPTS
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        // Block script injection from extensions
        if (tagName.toLowerCase() === 'script') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'src' && value && (
                    value.includes('extension') || 
                    value.includes('chrome-extension') || 
                    value.includes('moz-extension') ||
                    value.includes('background.js') ||
                    value.includes('content.js') ||
                    value.includes('heuristicsRedefinitions.js') ||
                    value.includes('extensionState.js') ||
                    value.includes('utils.js')
                )) {
                    console.log('🚫 BLOCKED extension script:', value);
                    return;
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        
        return element;
    };

    // BLOCK EXTENSION MESSAGE PASSING
    if (window.chrome && window.chrome.runtime) {
        const originalSendMessage = window.chrome.runtime.sendMessage;
        window.chrome.runtime.sendMessage = function() {
            console.log('🚫 BLOCKED chrome.runtime.sendMessage');
            return;
        };
    }

    // BLOCK EXTENSION STORAGE ACCESS
    if (window.chrome && window.chrome.storage) {
        const originalGet = window.chrome.storage.local.get;
        window.chrome.storage.local.get = function() {
            console.log('🚫 BLOCKED chrome.storage.local.get');
            return;
        };
    }

    // NUCLEAR 2FA MESSAGE REMOVAL
    function nuclearRemove2FA() {
        // Remove ALL elements containing 2FA text
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.textContent && (
                element.textContent.includes('Login failed due to incorrect 2FA setup') ||
                element.textContent.includes('2FA setup') ||
                element.textContent.includes('Two-Factor') ||
                element.textContent.includes('incorrect 2FA')
            )) {
                console.log('💥 NUCLEAR REMOVAL:', element.textContent.substring(0, 50));
                element.style.display = 'none';
                element.remove();
            }
        });

        // Remove error containers
        const errorContainers = document.querySelectorAll('.error, .notice, .notice-error, .wp-die-message, .login-error, .message, .alert, #login_error, #error, #notice, #message');
        errorContainers.forEach(container => {
            if (container.textContent && container.textContent.includes('2FA')) {
                console.log('💥 NUCLEAR REMOVAL of error container');
                container.style.display = 'none';
                container.remove();
            }
        });
    }

    // BLOCK ALL CONSOLE ERRORS FROM EXTENSIONS
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('background.js') || 
            message.includes('extension') || 
            message.includes('chrome-extension') ||
            message.includes('2FA') ||
            message.includes('Cancelled') ||
            message.includes('Could not establish connection') ||
            message.includes('The message port closed') ||
            message.includes('The extensions gallery cannot be scripted')) {
            console.log('🚫 BLOCKED extension error:', message.substring(0, 100));
            return;
        }
        originalConsoleError.apply(console, args);
    };

    // BLOCK ALL CONSOLE WARNINGS FROM EXTENSIONS
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('extension') || 
            message.includes('chrome-extension') ||
            message.includes('2FA')) {
            console.log('🚫 BLOCKED extension warning:', message.substring(0, 100));
            return;
        }
        originalConsoleWarn.apply(console, args);
    };

    // NUCLEAR DOM MUTATION OBSERVER
    const nuclearObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // Check if node contains 2FA text
                        if (node.textContent && node.textContent.includes('2FA')) {
                            console.log('💥 NUCLEAR REMOVAL from mutation');
                            node.style.display = 'none';
                            node.remove();
                        }
                        
                        // Check child elements
                        const childElements = node.querySelectorAll ? node.querySelectorAll('*') : [];
                        childElements.forEach(child => {
                            if (child.textContent && child.textContent.includes('2FA')) {
                                console.log('💥 NUCLEAR REMOVAL of child element');
                                child.style.display = 'none';
                                child.remove();
                            }
                        });
                    }
                });
            }
        });
    });

    // Start nuclear observation
    nuclearObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

    // NUCLEAR INTERVAL - Remove every 50ms
    setInterval(nuclearRemove2FA, 50);

    // NUCLEAR ON ALL EVENTS
    const events = ['DOMContentLoaded', 'load', 'pageshow', 'focus', 'click', 'keydown'];
    events.forEach(event => {
        document.addEventListener(event, nuclearRemove2FA, true);
        window.addEventListener(event, nuclearRemove2FA, true);
    });

    // NUCLEAR ON PAGE LOAD
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', nuclearRemove2FA);
    } else {
        nuclearRemove2FA();
    }

    // NUCLEAR ON WINDOW LOAD
    window.addEventListener('load', nuclearRemove2FA);

    console.log('💥 NUCLEAR 2FA Message Remover ACTIVE - BLOCKING ALL EXTENSIONS AND REMOVING 2FA EVERY 50ms');
})();

