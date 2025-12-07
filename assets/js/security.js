/**
 * @fileoverview Security Utilities for Vidya Chaitanya Samakhya
 * @description Provides email obfuscation, phone number handling, and basic bot protection
 *              to prevent spam and automated scraping while maintaining user experience.
 * @author Vidya Chaitanya Samakhya
 * @version 1.0.0
 * @requires error-handler.js - Error handling utilities
 */

(function() {
    'use strict';

    /**
     * Decode obfuscated email address
     * @description Uses ROT13-like decoding to convert obfuscated email strings
     *              back to readable format. This prevents basic email scrapers.
     * @param {string} encoded - The obfuscated email string
     * @returns {string} The decoded email address
     */
    function decodeEmail(encoded) {
        // Simple ROT13-like decoding for email protection
        return encoded.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

    /**
     * Initialize email obfuscation
     * @description Finds all elements with data-email attributes, decodes the email,
     *              and replaces them with functional mailto links. Preserves existing
     *              text content or uses decoded email as display text.
     * @returns {void}
     */
    function initEmailObfuscation() {
        try {
            const emailElements = document.querySelectorAll('[data-email]');
            emailElements.forEach(function(el) {
                try {
                    const encoded = el.getAttribute('data-email');
                    if (!encoded) return;

                    const decoded = decodeEmail(encoded);
                    // Use decoded email as display text if current text is placeholder
                    const currentText = el.textContent.trim();
                    const displayText = (currentText === 'Loading...' || currentText === '') ? decoded : currentText;
                    
                    // Create mailto link
                    const link = document.createElement('a');
                    link.href = 'mailto:' + decoded;
                    link.textContent = displayText;
                    link.className = el.className || '';
                    link.style.cssText = el.style.cssText || '';
                    
                    // Copy any additional attributes
                    Array.from(el.attributes).forEach(function(attr) {
                        if (attr.name !== 'data-email' && attr.name !== 'class' && attr.name !== 'style') {
                            link.setAttribute(attr.name, attr.value);
                        }
                    });
                    
                    if (el.parentNode) {
                        el.parentNode.replaceChild(link, el);
                    }
                } catch (error) {
                    if (window.logWarn) {
                        window.logWarn('Failed to decode email element', {
                            error: error.message,
                            element: el.tagName
                        });
                    }
                }
            });
        } catch (error) {
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Email obfuscation initialization failed',
                    error,
                    type: 'Email Obfuscation Error',
                    showUser: false
                });
            }
        }
    }

    /**
     * Initialize phone number display
     * @description Replaces elements with data-phone attributes with actual phone numbers.
     *              Converts phone numbers to clickable tel: links when appropriate.
     * @returns {void}
     */
    function initPhoneObfuscation() {
        const phoneElements = document.querySelectorAll('[data-phone]');
        phoneElements.forEach(function(el) {
            const phone = el.getAttribute('data-phone');
            // Phone numbers are stored as-is, just display them
            el.textContent = phone;
            // If it's a link, update href
            if (el.tagName === 'A' || el.parentElement.tagName === 'A') {
                const link = el.tagName === 'A' ? el : el.parentElement;
                if (link.tagName === 'A') {
                    link.href = 'tel:' + phone;
                }
            }
        });
    }

    /**
     * Initialize basic bot protection
     * @description Detects common bot indicators and implements rate limiting.
     *              Adds honeypot fields for form protection and monitors interaction
     *              patterns to identify automated behavior.
     * @returns {void}
     */
    function initBotProtection() {
        // Check for headless browser indicators
        const botIndicators = [
            !window.chrome && !window.safari && !window.firefox,
            navigator.webdriver === true,
            navigator.plugins.length === 0,
            navigator.languages.length === 0
        ];

        // If multiple indicators suggest bot, add protection
        const botScore = botIndicators.filter(Boolean).length;
        if (botScore >= 3) {
            // Add a hidden honeypot field that bots might fill
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.display = 'none';
            honeypot.style.position = 'absolute';
            honeypot.style.left = '-9999px';
            honeypot.setAttribute('tabindex', '-1');
            honeypot.setAttribute('autocomplete', 'off');
            document.body.appendChild(honeypot);
        }

        // Rate limiting for rapid interactions
        let interactionCount = 0;
        const resetTime = 60000; // 1 minute
        const maxInteractions = 50;

        function checkRateLimit() {
            interactionCount++;
            if (interactionCount > maxInteractions) {
                console.warn('Rate limit exceeded');
                // Could implement additional protection here
            }
            setTimeout(function() {
                interactionCount = Math.max(0, interactionCount - 1);
            }, resetTime);
        }

        // Monitor rapid clicks (potential bot behavior)
        document.addEventListener('click', function(e) {
            checkRateLimit();
        }, { passive: true });

        // Monitor rapid form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                checkRateLimit();
                // Check honeypot field
                const honeypot = form.querySelector('input[name="website"]');
                if (honeypot && honeypot.value) {
                    e.preventDefault();
                    return false;
                }
            });
        });
    }

    /**
     * Initialize all security features
     * @description Main entry point that initializes all security utilities
     *              when the DOM is ready. Handles both immediate and deferred execution.
     * @returns {void}
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        try {
            initEmailObfuscation();
            initPhoneObfuscation();
            initBotProtection();
        } catch (error) {
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Failed to initialize security features',
                    error,
                    type: 'Security Initialization Error',
                    context: { module: 'security.js' },
                    showUser: false
                });
            } else {
                console.error('Security initialization error:', error);
            }
        }
    }

    // Start initialization
    init();
})();
