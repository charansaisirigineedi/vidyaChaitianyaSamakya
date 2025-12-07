/**
 * @fileoverview Service Worker Registration
 * @description Registers the service worker for offline capability and PWA features.
 *              Handles service worker updates and provides console logging for debugging.
 * @author Vidya Chaitanya Samakhya
 * @version 1.0.0
 * @requires error-handler.js - Error handling utilities
 */

(function() {
    'use strict';

    /**
     * Register service worker if supported
     * @description Checks for service worker support and registers the worker.
     *              Listens for updates and logs registration status.
     * @returns {void}
     */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    if (window.logInfo) {
                        window.logInfo('Service Worker registered successfully', {
                            scope: registration.scope
                        });
                    } else {
                        console.log('Service Worker registered successfully:', registration.scope);
                    }
                    
                    // Check for updates
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New service worker available
                                    if (window.logInfo) {
                                        window.logInfo('New service worker available');
                                    } else {
                                        console.log('New service worker available');
                                    }
                                }
                            });
                        }
                    });
                })
                .catch(function(error) {
                    if (window.ErrorHandler) {
                        window.ErrorHandler.handleError({
                            message: 'Service Worker registration failed',
                            error,
                            type: 'Service Worker Error',
                            context: { 
                                url: '/sw.js',
                                userAgent: navigator.userAgent
                            },
                            showUser: false // Service worker failures shouldn't interrupt user
                        });
                    } else {
                        console.log('Service Worker registration failed:', error);
                    }
                });
        });
    } else {
        // Log that service workers are not supported
        if (window.logDebug) {
            window.logDebug('Service Workers not supported in this browser');
        }
    }
})();
