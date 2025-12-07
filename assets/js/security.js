/**
 * Security Utilities for Vidya Chaitanya Samakhya
 * - Email obfuscation
 * - Basic bot protection
 */

(function() {
    'use strict';

    /**
     * Email Obfuscation
     * Decodes obfuscated email addresses to prevent scraping
     */
    function decodeEmail(encoded) {
        // Simple ROT13-like decoding for email protection
        return encoded.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

    /**
     * Initialize email obfuscation
     * Replaces obfuscated email elements with clickable mailto links
     */
    function initEmailObfuscation() {
        const emailElements = document.querySelectorAll('[data-email]');
        emailElements.forEach(function(el) {
            const encoded = el.getAttribute('data-email');
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
            
            el.parentNode.replaceChild(link, el);
        });
    }

    /**
     * Phone Number Obfuscation
     * Replaces obfuscated phone numbers
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
     * Basic Bot Protection
     * Detects common bot patterns and adds protection
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
     * Initialize all security features when DOM is ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        initEmailObfuscation();
        initPhoneObfuscation();
        initBotProtection();
    }

    // Start initialization
    init();
})();
