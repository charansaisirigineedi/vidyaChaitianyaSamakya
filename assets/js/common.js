/**
 * Common JavaScript for Vidya Chaitanya Samakhya
 * Shared functionality across all pages
 */

(function() {
    'use strict';

    // Configuration
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
     * Initialize when DOM is ready
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
            console.error('Error initializing common functionality:', error);
        }
    }

    /**
     * Set current year in footer
     */
    function initCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Initialize AOS (Animate On Scroll) library
     */
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init(CONFIG.AOS);
        }
    }

    /**
     * Initialize navbar scroll effects
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
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
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
     */
    function initScrollHandlers() {
        const scrollProgress = document.getElementById('scrollProgress');
        const backToTop = document.getElementById('backToTop');

        if (!scrollProgress && !backToTop) return;

        let ticking = false;

        function updateScrollElements() {
            const scrollY = window.scrollY;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

            // Update scroll progress bar
            if (scrollProgress) {
                const scrolled = windowHeight > 0 ? scrollY / windowHeight : 0;
                scrollProgress.style.transform = 'scaleX(' + scrolled + ') translateZ(0)';
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

            ticking = false;
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
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Initialize smooth scroll for anchor links
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
