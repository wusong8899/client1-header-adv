import app from 'flarum/forum/app';
import { ConfigManager } from './ConfigManager';

/**
 * Error handling and logging utility
 */
export class ErrorHandler {
    private static instance: ErrorHandler;
    private configManager: ConfigManager;
    private errorLog: Array<{ timestamp: Date, error: Error, context: string }> = [];

    private constructor() {
        this.configManager = ConfigManager.getInstance();
        this.setupGlobalErrorHandler();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Setup global error handler
     */
    private setupGlobalErrorHandler(): void {
        window.addEventListener('error', (event) => {
            this.logError(event.error, 'Global Error Handler');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError(new Error(event.reason), 'Unhandled Promise Rejection');
        });
    }

    /**
     * Log error with context
     * @param {Error} error - Error object
     * @param {string} context - Error context
     */
    logError(error: Error, context: string = 'Unknown'): void {
        const errorEntry = {
            timestamp: new Date(),
            error,
            context
        };

        this.errorLog.push(errorEntry);

        // Keep only last 50 errors to prevent memory issues
        if (this.errorLog.length > 50) {
            this.errorLog.shift();
        }

        console.error(`[${context}] ${error.message}`, error);
    }

    /**
     * Handle async operation with error catching
     * @param {Function} operation - Async operation to execute
     * @param {string} context - Operation context
     * @param {any} fallbackValue - Value to return on error
     * @returns {Promise<any>} Operation result or fallback value
     */
    async handleAsync<T>(
        operation: () => Promise<T>,
        context: string,
        fallbackValue: T | null = null
    ): Promise<T | null> {
        try {
            return await operation();
        } catch (error) {
            this.logError(error as Error, context);
            return fallbackValue;
        }
    }

    /**
     * Handle synchronous operation with error catching
     * @param {Function} operation - Operation to execute
     * @param {string} context - Operation context
     * @param {any} fallbackValue - Value to return on error
     * @returns {any} Operation result or fallback value
     */
    handleSync<T>(
        operation: () => T,
        context: string,
        fallbackValue: T | null = null
    ): T | null {
        try {
            return operation();
        } catch (error) {
            this.logError(error as Error, context);
            return fallbackValue;
        }
    }

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL
     */
    isValidUrl(url: string): boolean {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            const _ = new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate slide configuration
     * @param {number} slideNumber - Slide number
     * @param {string} imageUrl - Image URL
     * @param {string} linkUrl - Link URL
     * @returns {object} Validation result
     */
    validateSlideConfig(slideNumber: number, imageUrl: string, linkUrl: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!Number.isInteger(slideNumber) || slideNumber < 1 || slideNumber > 30) {
            errors.push('Slide number must be between 1 and 30');
        }

        if (!imageUrl || !this.isValidUrl(imageUrl)) {
            errors.push('Image URL is required and must be valid');
        }

        if (linkUrl && !this.isValidUrl(linkUrl)) {
            errors.push('Link URL must be valid if provided');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate DOM element exists
     * @param {string} selector - CSS selector
     * @param {string} context - Context for error reporting
     * @returns {Element | null} Element if found, null otherwise
     */
    validateElement(selector: string, context: string = 'Element validation'): Element | null {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                this.logError(new Error(`Element not found: ${selector}`), context);
            }
            return element;
        } catch (error) {
            this.logError(error as Error, context);
            return null;
        }
    }

    /**
     * Safely execute DOM operation
     * @param {Function} operation - DOM operation
     * @param {string} context - Operation context
     * @returns {any} Operation result or null
     */
    safeDOMOperation<T>(operation: () => T, context: string): T | null {
        return this.handleSync(operation, `DOM Operation: ${context}`);
    }

    /**
     * Create error notification
     * @param {string} message - Error message
     * @param {string} type - Notification type
     */
    showErrorNotification(message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
        try {
            // Use Flarum's notification system if available
            if (app.alerts && app.alerts.show) {
                app.alerts.show({
                    type,
                    message
                });
            } else {
                // Fallback to console
                console.warn(`[${type.toUpperCase()}] ${message}`);
            }
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    /**
     * Get error log
     * @returns {Array} Array of error entries
     */
    getErrorLog(): Array<{ timestamp: Date, error: Error, context: string }> {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    clearErrorLog(): void {
        this.errorLog = [];
    }

    /**
     * Export error log as JSON
     * @returns {string} JSON string of error log
     */
    exportErrorLog(): string {
        const exportData = this.errorLog.map(entry => ({
            timestamp: entry.timestamp.toISOString(),
            message: entry.error.message,
            stack: entry.error.stack,
            context: entry.context
        }));

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Check if extension dependencies are available
     * @returns {object} Dependency check results
     */
    checkDependencies(): { isValid: boolean, missing: string[] } {
        const missing: string[] = [];

        // Check for required globals
        if (typeof app === 'undefined') {
            missing.push('Flarum app object');
        }

        if (typeof $ === 'undefined') {
            missing.push('jQuery');
        }

        // Check for Swiper
        try {
            // This will be checked when Swiper is actually imported
        } catch {
            missing.push('Swiper library');
        }

        return {
            isValid: missing.length === 0,
            missing
        };
    }

    /**
     * Validate extension configuration
     * @returns {object} Configuration validation results
     */
    validateConfiguration(): { isValid: boolean, issues: string[] } {
        const issues: string[] = [];
        const config = this.configManager.getExtensionConfig() as any;

        if (!config.extensionId) {
            issues.push('Extension ID is not configured');
        }

        if (config.maxSlides < 1 || config.maxSlides > 50) {
            issues.push('Max slides should be between 1 and 50');
        }

        if (config.transitionTime < 1000 || config.transitionTime > 30000) {
            issues.push('Transition time should be between 1 and 30 seconds');
        }

        const validSlideCount = this.configManager.getValidSlideCount();
        if (validSlideCount === 0) {
            issues.push('No valid slides configured');
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Initialize error handling for the extension
     * @returns {boolean} True if initialization successful
     */
    initialize(): boolean {
        try {
            const depCheck = this.checkDependencies();
            if (!depCheck.isValid) {
                this.logError(
                    new Error(`Missing dependencies: ${depCheck.missing.join(', ')}`),
                    'Dependency Check'
                );
                return false;
            }

            const configCheck = this.validateConfiguration();
            if (!configCheck.isValid) {
                this.logError(
                    new Error(`Configuration issues: ${configCheck.issues.join(', ')}`),
                    'Configuration Check'
                );
                // Don't return false for config issues, just log them
            }

            return true;
        } catch (error) {
            this.logError(error as Error, 'Error Handler Initialization');
            return false;
        }
    }
}
