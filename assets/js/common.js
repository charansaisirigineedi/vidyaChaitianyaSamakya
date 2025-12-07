/**
 * @fileoverview Common JavaScript for Vidya Chaitanya Samakhya
 * @description Shared functionality across all pages including navigation, mobile menu,
 *              scroll effects, and animations. This module provides core UI interactions
 *              that are consistent across the entire website.
 * @author Vidya Chaitanya Samakhya
 * @version 1.0.0
 * @since 2025
 * @requires error-handler.js - Error handling utilities
 */

(function() {
    'use strict';

    /**
     * Application configuration constants
     * @type {Object}
     * @property {Object} AOS - Animate On Scroll library configuration
     * @property {number} AOS.duration - Animation duration in milliseconds
     * @property {string} AOS.easing - CSS easing function
     * @property {boolean} AOS.once - Whether to animate only once
     * @property {number} AOS.offset - Trigger offset in pixels
     * @property {number} AOS.delay - Initial delay in milliseconds
     * @property {number} SCROLL_THRESHOLD - Scroll position threshold for navbar styling
     * @property {number} BACK_TO_TOP_THRESHOLD - Scroll position to show back-to-top button
     */
    const CONFIG = {
        AOS: {
            duration: 700,
            easing: 'ease-out',
            once: true,
            offset: 50,
            delay: 0
        },
        SCROLL_THRESHOLD: 50,
        BACK_TO_TOP_THRESHOLD: 300
    };

    /**
     * Main initialization function
     * @description Initializes all common functionality when DOM is ready.
     *              Handles both immediate execution and deferred DOMContentLoaded event.
     * @returns {void}
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        try {
            initCurrentYear();
            initAOS();
            initNavbar();
            initMobileMenu();
            initScrollHandlers();
            initSmoothScroll();
        } catch (error) {
            // Use error handler if available, otherwise fallback to console
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Failed to initialize common functionality',
                    error,
                    type: 'Initialization Error',
                    context: { module: 'common.js' },
                    showUser: false // Don't show user notification for initialization errors
                });
            } else {
                console.error('Error initializing common functionality:', error);
            }
        }
    }

    /**
     * Initialize current year display in footer
     * @description Updates the copyright year element with the current year dynamically.
     *              This ensures the year stays current without manual updates.
     * @returns {void}
     */
    function initCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Initialize AOS (Animate On Scroll) library
     * @description Configures and initializes the AOS animation library for scroll-triggered
     *              animations. Only initializes if the AOS library is loaded.
     * @returns {void}
     */
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init(CONFIG.AOS);
        }
    }

    /**
     * Initialize navbar scroll effects
     * @description Manages navbar styling changes based on scroll position.
     *              Uses requestAnimationFrame for performance-optimized scroll handling.
     *              Adds shadow and background opacity changes when user scrolls down.
     * @returns {void}
     */
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let ticking = false;

        function updateNavbar() {
            if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
                navbar.classList.add('bg-white/80', 'shadow-2xl', 'navbar-scrolled');
                navbar.classList.remove('bg-white/60');
            } else {
                navbar.classList.remove('bg-white/80', 'shadow-2xl', 'navbar-scrolled');
                navbar.classList.add('bg-white/60');
            }
            ticking = false;
        }

        // Initial update
        updateNavbar();

        // Throttled scroll handler
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Initialize mobile menu functionality
     * @description Handles mobile menu toggle, overlay, and keyboard navigation.
     *              Manages menu state, body scroll lock, and icon toggling.
     *              Supports closing via overlay click, close button, escape key, or link click.
     * @returns {void}
     */
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const mobileMenuClose = document.getElementById('mobileMenuClose');
        const menuIcon = document.getElementById('menuIcon');
        const closeIcon = document.getElementById('closeIcon');

        if (!mobileMenuBtn || !mobileMenu) return;

        function openMobileMenu() {
            mobileMenu.classList.add('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (menuIcon) menuIcon.classList.add('hidden');
            if (closeIcon) closeIcon.classList.remove('hidden');
            
            // Update ARIA attributes
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
            }
            if (mobileMenu) {
                mobileMenu.setAttribute('aria-hidden', 'false');
            }
            
            // Announce to screen readers
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Mobile menu opened', 'polite');
            }
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
            
            // Update ARIA attributes
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
            if (mobileMenu) {
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
            
            // Return focus to menu button
            if (mobileMenuBtn) {
                mobileMenuBtn.focus();
            }
            
            // Announce to screen readers
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Mobile menu closed', 'polite');
            }
        }

        // Event listeners
        mobileMenuBtn.addEventListener('click', function() {
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }

        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        }

        // Close menu when clicking menu links
        document.querySelectorAll('.mobile-menu-link').forEach(function(link) {
            link.addEventListener('click', function() {
                setTimeout(closeMobileMenu, 200);
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    /**
     * Initialize scroll progress bar and back to top button
     * @description Manages scroll progress indicator and back-to-top button visibility.
     *              Uses requestAnimationFrame for smooth, performant scroll tracking.
     *              Progress bar shows scroll percentage, button appears after threshold.
     * @returns {void}
     */
    function initScrollHandlers() {
        const scrollProgress = document.getElementById('scrollProgress');
        const backToTop = document.getElementById('backToTop');

        if (!scrollProgress && !backToTop) return;

        let ticking = false;

        function updateScrollElements() {
            try {
                const scrollY = window.scrollY;
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

            // Update scroll progress bar
            if (scrollProgress) {
                const scrolled = windowHeight > 0 ? scrollY / windowHeight : 0;
                scrollProgress.style.transform = 'scaleX(' + scrolled + ') translateZ(0)';
                // Update ARIA value
                const percentage = Math.round(scrolled * 100);
                scrollProgress.setAttribute('aria-valuenow', percentage);
            }

                // Update back to top button
                if (backToTop) {
                    if (scrollY > CONFIG.BACK_TO_TOP_THRESHOLD) {
                        backToTop.classList.remove('hidden');
                        backToTop.classList.add('flex');
                    } else {
                        backToTop.classList.add('hidden');
                        backToTop.classList.remove('flex');
                    }
                }
            } catch (error) {
                if (window.ErrorHandler) {
                    window.ErrorHandler.handleError({
                        message: 'Error updating scroll elements',
                        error,
                        type: 'Scroll Handler Error',
                        showUser: false
                    });
                }
            } finally {
                ticking = false;
            }
        }

        // Throttled scroll handler
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollElements);
                ticking = true;
            }
        }, { passive: true });

        // Back to top button click handler
        if (backToTop) {
            backToTop.addEventListener('click', function() {
                try {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } catch (error) {
                    if (window.ErrorHandler) {
                        window.ErrorHandler.handleError({
                            message: 'Error scrolling to top',
                            error,
                            type: 'Scroll Error',
                            showUser: false
                        });
                    }
                }
            });
        }
    }

    /**
     * Initialize smooth scroll for anchor links
     * @description Adds smooth scrolling behavior to all anchor links that target
     *              elements on the same page. Prevents default jump behavior.
     * @returns {void}
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Start initialization
    init();
})();
