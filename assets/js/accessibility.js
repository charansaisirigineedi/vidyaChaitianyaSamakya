/**
 * @fileoverview Accessibility Utilities
 * @description Provides accessibility enhancements including keyboard navigation,
 *              focus management, ARIA live regions, and WCAG 2.1 AA compliance features.
 * @author Vidya Chaitanya Samakhya
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Accessibility Manager Class
     * @description Manages accessibility features including focus trapping,
     *              ARIA live regions, and keyboard navigation enhancements.
     * @class
     */
    class AccessibilityManager {
        constructor() {
            this.focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'textarea:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ].join(', ');
            
            this.init();
        }

        /**
         * Initialize accessibility features
         * @returns {void}
         */
        init() {
            this.setupARIALiveRegions();
            this.enhanceKeyboardNavigation();
            this.setupFocusManagement();
        }

        /**
         * Setup ARIA live regions
         * @description Creates ARIA live regions for dynamic content announcements
         * @returns {void}
         */
        setupARIALiveRegions() {
            // Create polite live region for non-urgent updates
            if (!document.getElementById('aria-live-polite')) {
                const politeRegion = document.createElement('div');
                politeRegion.id = 'aria-live-polite';
                politeRegion.className = 'sr-only';
                politeRegion.setAttribute('aria-live', 'polite');
                politeRegion.setAttribute('aria-atomic', 'true');
                document.body.appendChild(politeRegion);
            }

            // Create assertive live region for urgent updates
            if (!document.getElementById('aria-live-assertive')) {
                const assertiveRegion = document.createElement('div');
                assertiveRegion.id = 'aria-live-assertive';
                assertiveRegion.className = 'sr-only';
                assertiveRegion.setAttribute('aria-live', 'assertive');
                assertiveRegion.setAttribute('aria-atomic', 'true');
                document.body.appendChild(assertiveRegion);
            }
        }

        /**
         * Announce message to screen readers
         * @param {string} message - Message to announce
         * @param {string} [priority='polite'] - Priority: 'polite' or 'assertive'
         * @returns {void}
         */
        announce(message, priority = 'polite') {
            const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
            const region = document.getElementById(regionId);
            
            if (region) {
                // Clear previous message
                region.textContent = '';
                
                // Set new message after a brief delay to ensure announcement
                setTimeout(() => {
                    region.textContent = message;
                }, 100);
            }
        }

        /**
         * Enhance keyboard navigation
         * @description Adds keyboard navigation enhancements
         * @returns {void}
         */
        enhanceKeyboardNavigation() {
            // Trap focus in modals
            this.setupFocusTrap();
            
            // Handle escape key for closing modals
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.handleEscapeKey(e);
                }
            });

            // Enhance tab navigation
            this.enhanceTabNavigation();
        }

        /**
         * Setup focus trap for modals
         * @description Traps focus within modal dialogs
         * @returns {void}
         */
        setupFocusTrap() {
            const modals = document.querySelectorAll('[role="dialog"], .lightbox, .mobile-menu');
            
            modals.forEach(modal => {
                if (!modal.hasAttribute('data-focus-trap-setup')) {
                    modal.setAttribute('data-focus-trap-setup', 'true');
                    
                    modal.addEventListener('keydown', (e) => {
                        if (e.key !== 'Tab') return;
                        
                        const focusableElements = modal.querySelectorAll(this.focusableSelectors);
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];

                        if (e.shiftKey) {
                            // Shift + Tab
                            if (document.activeElement === firstElement) {
                                e.preventDefault();
                                lastElement.focus();
                            }
                        } else {
                            // Tab
                            if (document.activeElement === lastElement) {
                                e.preventDefault();
                                firstElement.focus();
                            }
                        }
                    });
                }
            });
        }

        /**
         * Handle escape key
         * @param {KeyboardEvent} e - Keyboard event
         * @returns {void}
         */
        handleEscapeKey(e) {
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                const closeBtn = document.getElementById('mobileMenuClose');
                if (closeBtn) {
                    closeBtn.click();
                    e.preventDefault();
                    return;
                }
            }

            // Close lightbox if open
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) {
                const closeBtn = document.getElementById('lightboxClose');
                if (closeBtn) {
                    closeBtn.click();
                    e.preventDefault();
                    return;
                }
            }
        }

        /**
         * Enhance tab navigation
         * @description Improves tab navigation experience
         * @returns {void}
         */
        enhanceTabNavigation() {
            // Add visual focus indicators
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            // Remove keyboard navigation class on mouse use
            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
        }

        /**
         * Setup focus management
         * @description Manages focus for better accessibility
         * @returns {void}
         */
        setupFocusManagement() {
            // Store focus when opening modals
            let previousFocus = null;

            // Observe modal openings
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const modal = node.classList?.contains('active') ? node : 
                                         node.querySelector?.('.active[role="dialog"], .active.lightbox, .active.mobile-menu');
                            
                            if (modal && (modal.getAttribute('role') === 'dialog' || 
                                modal.classList.contains('lightbox') || 
                                modal.classList.contains('mobile-menu'))) {
                                previousFocus = document.activeElement;
                                
                                // Focus first focusable element in modal
                                setTimeout(() => {
                                    const firstFocusable = modal.querySelector(this.focusableSelectors);
                                    if (firstFocusable) {
                                        firstFocusable.focus();
                                    }
                                }, 100);
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }

        /**
         * Get all focusable elements in a container
         * @param {HTMLElement} container - Container element
         * @returns {Array<HTMLElement>} Array of focusable elements
         */
        getFocusableElements(container) {
            const elements = container.querySelectorAll(this.focusableSelectors);
            return Array.from(elements).filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.accessibilityManager = new AccessibilityManager();
        });
    } else {
        window.accessibilityManager = new AccessibilityManager();
    }

    // Export convenience function
    window.announceToScreenReader = (message, priority) => {
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(message, priority);
        }
    };
})();
