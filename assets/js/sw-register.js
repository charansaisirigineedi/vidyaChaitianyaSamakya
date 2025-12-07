/**
 * Service Worker Registration
 * Registers the service worker for offline capability
 */

(function() {
    'use strict';

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('Service Worker registered successfully:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                console.log('New service worker available');
                            }
                        });
                    });
                })
                .catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
})();
