/**
 * ErrorHandler Utility
 * 
 * Provides safe error handling to prevent extension failures from breaking the main application.
 * All extension operations should be wrapped with errorHandler to ensure graceful degradation.
 */

const PREFIX = 'Client1HeaderAdv';

/**
 * Handle synchronous operations with error catching
 * 
 * @param operation - Function to execute safely
 * @param context - Description of the operation for error logging
 * @returns Result of operation or undefined if error occurred
 */
export function handleSync<T>(operation: () => T, context: string = 'Unknown operation'): T | undefined {
  try {
    return operation();
  } catch (error) {
    console.error(`${PREFIX} Error in ${context}:`, error);
    return undefined;
  }
}

/**
 * Handle asynchronous operations with error catching
 * 
 * @param operation - Async function to execute safely  
 * @param context - Description of the operation for error logging
 * @returns Promise that resolves to result or undefined if error occurred
 */
export async function handleAsync<T>(operation: () => Promise<T>, context: string = 'Unknown async operation'): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${PREFIX} Async Error in ${context}:`, error);
    return undefined;
  }
}

/**
 * Log informational messages with consistent prefix
 */
export function info(message: string, data?: any): void {
  console.info(`${PREFIX}:`, message, data || '');
}

/**
 * Log warning messages with consistent prefix
 */
export function warn(message: string, data?: any): void {
  console.warn(`${PREFIX} Warning:`, message, data || '');
}

/**
 * Log error messages with consistent prefix
 */
export function error(message: string, error?: Error): void {
  console.error(`${PREFIX} Error:`, message, error || '');
}

// Export object for convenient use
export const errorHandler = {
  handleSync,
  handleAsync,
  info,
  warn,
  error
};