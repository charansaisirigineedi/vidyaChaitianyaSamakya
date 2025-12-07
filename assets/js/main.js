/**
 * @fileoverview Main JavaScript Entry Point
 * @description Central entry point for all JavaScript modules. This file coordinates
 *              the initialization of all JavaScript functionality across the site.
 *              Individual modules are loaded separately for better performance.
 * @author Vidya Chaitanya Samakhya
 * @version 1.0.0
 * 
 * @module Main
 * 
 * @requires assets/js/common.js - Common functionality (navigation, scroll, etc.)
 * @requires assets/js/security.js - Security utilities (email obfuscation, bot protection)
 * @requires assets/js/sw-register.js - Service worker registration
 * @requires assets/js/gallery.js - Gallery functionality (gallery.html only)
 */

/**
 * JavaScript Module Structure:
 * 
 * 1. common.js - Shared functionality across all pages
 *    - Navigation and mobile menu
 *    - Scroll progress and back-to-top button
 *    - AOS animations initialization
 *    - Smooth scrolling
 * 
 * 2. security.js - Security and privacy features
 *    - Email obfuscation/decoding
 *    - Phone number handling
 *    - Basic bot protection
 * 
 * 3. sw-register.js - Progressive Web App features
 *    - Service worker registration
 *    - Offline capability
 * 
 * 4. gallery.js - Gallery-specific functionality
 *    - Image loading and lazy loading
 *    - Lightbox functionality
 *    - Category filtering
 *    - Only loaded on gallery.html
 * 
 * Usage:
 * - All modules are self-initializing (IIFE pattern)
 * - Modules are loaded via <script> tags in HTML
 * - No manual initialization required
 * 
 * Performance:
 * - All scripts use defer attribute for non-blocking loading
 * - Modules are separated for better caching
 * - Common functionality is shared across pages
 */

// This file serves as documentation only
// Actual initialization happens in individual module files
// Each module is an IIFE (Immediately Invoked Function Expression)
// that initializes itself when the DOM is ready

console.log('Vidya Chaitanya Samakhya - JavaScript modules loaded');
