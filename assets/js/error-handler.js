/**
 * @fileoverview Error Handling Utility
 * @description Centralized error handling, logging, and user-friendly error messages.
 *              Provides error boundaries, structured logging, and graceful error recovery.
 * @author Vidya Chaitanya Samakhya
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Log levels for structured logging
     * @enum {string}
     */
    const LogLevel = {
        DEBUG: 'DEBUG',
        INFO: 'INFO',
        WARN: 'WARN',
        ERROR: 'ERROR',
        FATAL: 'FATAL'
    };

    /**
     * Error Handler Configuration
     * @type {Object}
     */
    const CONFIG = {
        enableConsoleLogging: true,
        enableUserNotifications: true,
        logToServer: false, // Can be enabled for production error tracking
        serverEndpoint: '/api/logs',
        maxRetries: 3,
        retryDelay: 1000
    };

    /**
     * Error Handler Class
     * @description Centralized error handling and logging system
     * @class
     */
    class ErrorHandler {
        constructor() {
            this.errorCount = 0;
            this.maxErrors = 10; // Prevent error spam
            this.errorHistory = [];
            this.initGlobalErrorHandlers();
        }

        /**
         * Initialize global error handlers
         * @description Sets up window-level error handlers for uncaught errors
         * @returns {void}
         */
        initGlobalErrorHandlers() {
            // Handle uncaught JavaScript errors
            window.addEventListener('error', (event) => {
                this.handleError({
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error,
                    type: 'JavaScript Error'
                });
            });

            // Handle unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError({
                    message: event.reason?.message || 'Unhandled Promise Rejection',
                    error: event.reason,
                    type: 'Promise Rejection'
                });
                // Prevent default browser console error
                event.preventDefault();
            });
        }

        /**
         * Log a message with specified level
         * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, FATAL)
         * @param {string} message - Log message
         * @param {Object} [context] - Additional context data
         * @returns {void}
         */
        log(level, message, context = {}) {
            if (!CONFIG.enableConsoleLogging) return;

            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                context,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // Console logging with appropriate method
            const consoleMethod = this.getConsoleMethod(level);
            if (context && Object.keys(context).length > 0) {
                consoleMethod(`[${level}] ${message}`, context);
            } else {
                consoleMethod(`[${level}] ${message}`);
            }

            // Store in history (keep last 50 entries)
            this.errorHistory.push(logEntry);
            if (this.errorHistory.length > 50) {
                this.errorHistory.shift();
            }

            // Send to server if enabled
            if (CONFIG.logToServer && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
                this.sendToServer(logEntry);
            }
        }

        /**
         * Get appropriate console method for log level
         * @param {string} level - Log level
         * @returns {Function} Console method
         * @private
         */
        getConsoleMethod(level) {
            switch (level) {
                case LogLevel.DEBUG:
                    return console.debug || console.log;
                case LogLevel.INFO:
                    return console.info || console.log;
                case LogLevel.WARN:
                    return console.warn || console.log;
                case LogLevel.ERROR:
                case LogLevel.FATAL:
                    return console.error || console.log;
                default:
                    return console.log;
            }
        }

        /**
         * Send log entry to server
         * @param {Object} logEntry - Log entry to send
         * @returns {void}
         * @private
         */
        sendToServer(logEntry) {
            if (!CONFIG.logToServer || !CONFIG.serverEndpoint) return;

            // Use sendBeacon for reliable delivery (doesn't block page unload)
            if (navigator.sendBeacon) {
                try {
                    const data = JSON.stringify(logEntry);
                    navigator.sendBeacon(CONFIG.serverEndpoint, data);
                } catch (error) {
                    console.warn('Failed to send log to server:', error);
                }
            }
        }

        /**
         * Handle an error with full context
         * @param {Object} errorInfo - Error information object
         * @param {string} errorInfo.message - Error message
         * @param {Error} [errorInfo.error] - Error object
         * @param {string} [errorInfo.type] - Error type/category
         * @param {string} [errorInfo.filename] - Source filename
         * @param {number} [errorInfo.lineno] - Line number
         * @param {number} [errorInfo.colno] - Column number
         * @param {Object} [errorInfo.context] - Additional context
         * @param {boolean} [errorInfo.showUser] - Whether to show user notification
         * @returns {void}
         */
        handleError(errorInfo) {
            this.errorCount++;

            // Prevent error spam
            if (this.errorCount > this.maxErrors) {
                if (this.errorCount === this.maxErrors + 1) {
                    console.warn('[ErrorHandler] Maximum error count reached. Suppressing further errors.');
                }
                return;
            }

            const {
                message = 'An unexpected error occurred',
                error,
                type = 'Unknown Error',
                filename,
                lineno,
                colno,
                context = {},
                showUser = true
            } = errorInfo;

            // Extract error details
            const errorMessage = error?.message || message;
            const stack = error?.stack || '';
            const errorName = error?.name || type;

            // Log error
            this.log(LogLevel.ERROR, errorMessage, {
                type: errorName,
                stack,
                filename,
                lineno,
                colno,
                ...context
            });

            // Show user-friendly notification if enabled
            if (showUser && CONFIG.enableUserNotifications) {
                this.showUserNotification(errorMessage, type);
            }
        }

        /**
         * Show user-friendly error notification
         * @param {string} message - Error message
         * @param {string} type - Error type
         * @returns {void}
         * @private
         */
        showUserNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'error-notification';
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'polite');

            // Determine user-friendly message based on error type
            const userMessage = this.getUserFriendlyMessage(message, type);

            notification.innerHTML = `
                <div class="error-notification__content">
                    <div class="error-notification__icon" aria-hidden="true">⚠️</div>
                    <div class="error-notification__text">
                        <strong>Something went wrong</strong>
                        <p>${this.escapeHtml(userMessage)}</p>
                    </div>
                    <button class="error-notification__close" aria-label="Close notification">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l4 4M10 6l-4 4"/>
                        </svg>
                    </button>
                </div>
            `;

            // Add to page
            document.body.appendChild(notification);

            // Animate in
            requestAnimationFrame(() => {
                notification.classList.add('error-notification--visible');
            });

            // Auto-dismiss after 8 seconds
            const autoDismiss = setTimeout(() => {
                this.dismissNotification(notification);
            }, 8000);

            // Manual dismiss
            const closeBtn = notification.querySelector('.error-notification__close');
            closeBtn.addEventListener('click', () => {
                clearTimeout(autoDismiss);
                this.dismissNotification(notification);
            });

            // Store reference for cleanup
            notification._autoDismiss = autoDismiss;
        }

        /**
         * Dismiss error notification
         * @param {HTMLElement} notification - Notification element
         * @returns {void}
         * @private
         */
        dismissNotification(notification) {
            notification.classList.remove('error-notification--visible');
            notification.classList.add('error-notification--dismissing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }

        /**
         * Get user-friendly error message
         * @param {string} technicalMessage - Technical error message
         * @param {string} type - Error type
         * @returns {string} User-friendly message
         * @private
         */
        getUserFriendlyMessage(technicalMessage, type) {
            // Map technical errors to user-friendly messages
            const errorMessages = {
                'NetworkError': 'Unable to connect. Please check your internet connection and try again.',
                'Failed to fetch': 'Unable to load content. Please check your internet connection.',
                '404': 'The requested content could not be found.',
                '500': 'Our server encountered an issue. Please try again later.',
                'Timeout': 'The request took too long. Please try again.',
                'TypeError': 'Something unexpected happened. Please refresh the page.',
                'ReferenceError': 'A page error occurred. Please refresh the page.',
                'SyntaxError': 'There was a problem loading the page. Please refresh.',
                'Promise Rejection': 'An operation failed. Please try again.',
                'JavaScript Error': 'A page error occurred. Please refresh the page.'
            };

            // Check for specific error patterns
            for (const [key, message] of Object.entries(errorMessages)) {
                if (technicalMessage.includes(key) || type.includes(key)) {
                    return message;
                }
            }

            // Default user-friendly message
            return 'We encountered an unexpected issue. Please try refreshing the page or contact us if the problem persists.';
        }

        /**
         * Escape HTML to prevent XSS
         * @param {string} text - Text to escape
         * @returns {string} Escaped text
         * @private
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Wrap a function with error handling
         * @param {Function} fn - Function to wrap
         * @param {string} [context] - Context description for error logging
         * @returns {Function} Wrapped function
         */
        wrapFunction(fn, context = 'Unknown') {
            return (...args) => {
                try {
                    const result = fn(...args);
                    // Handle promises
                    if (result && typeof result.then === 'function') {
                        return result.catch((error) => {
                            this.handleError({
                                message: error.message || 'Promise rejection',
                                error,
                                type: 'Promise Rejection',
                                context: { functionContext: context }
                            });
                            throw error;
                        });
                    }
                    return result;
                } catch (error) {
                    this.handleError({
                        message: error.message || 'Function execution error',
                        error,
                        type: 'Function Error',
                        context: { functionContext: context }
                    });
                    throw error;
                }
            };
        }

        /**
         * Create error boundary for async operations
         * @param {Function} asyncFn - Async function to wrap
         * @param {string} [context] - Context description
         * @param {Object} [options] - Options
         * @param {boolean} [options.showUser] - Show user notification
         * @param {Function} [options.onError] - Custom error handler
         * @returns {Promise} Wrapped promise
         */
        async errorBoundary(asyncFn, context = 'Async Operation', options = {}) {
            const { showUser = true, onError } = options;

            try {
                return await asyncFn();
            } catch (error) {
                this.handleError({
                    message: error.message || 'Async operation failed',
                    error,
                    type: 'Async Error',
                    context: { asyncContext: context },
                    showUser
                });

                if (onError) {
                    onError(error);
                }

                // Re-throw to allow caller to handle if needed
                throw error;
            }
        }

        /**
         * Get error history
         * @returns {Array} Array of error log entries
         */
        getErrorHistory() {
            return [...this.errorHistory];
        }

        /**
         * Clear error history
         * @returns {void}
         */
        clearErrorHistory() {
            this.errorHistory = [];
            this.errorCount = 0;
        }
    }

    // Create global error handler instance
    const errorHandler = new ErrorHandler();

    // Export for use in other modules
    window.ErrorHandler = errorHandler;
    window.LogLevel = LogLevel;

    // Convenience methods
    window.logDebug = (message, context) => errorHandler.log(LogLevel.DEBUG, message, context);
    window.logInfo = (message, context) => errorHandler.log(LogLevel.INFO, message, context);
    window.logWarn = (message, context) => errorHandler.log(LogLevel.WARN, message, context);
    window.logError = (message, context) => errorHandler.log(LogLevel.ERROR, message, context);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            errorHandler.log(LogLevel.INFO, 'Error handler initialized');
        });
    } else {
        errorHandler.log(LogLevel.INFO, 'Error handler initialized');
    }
})();
