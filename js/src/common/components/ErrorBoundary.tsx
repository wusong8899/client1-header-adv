import app from 'flarum/common/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import { ExtensionError } from '../types';
import { ErrorHandler } from '../../forum/utils/ErrorHandler';

interface ErrorBoundaryAttrs {
  fallback?: () => any;
  context?: string;
  showRetry?: boolean;
  children?: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: ExtensionError | null;
  errorInfo: any;
  retryCount: number;
}

/**
 * Error boundary component for catching and handling component errors
 * Provides graceful degradation and recovery options
 */
export default class ErrorBoundary extends Component<ErrorBoundaryAttrs> {
  private state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  private readonly errorHandler: ErrorHandler;
  private readonly maxRetries = 3;

  constructor(attrs: ErrorBoundaryAttrs, children: any) {
    super(attrs, children);
    this.errorHandler = ErrorHandler.getInstance(attrs.context || 'ErrorBoundary');
  }

  oninit(vnode: any) {
    super.oninit(vnode);
    
    // Set up error handling
    this.setupErrorHandling();
  }

  /**
   * Set up component error handling
   */
  private setupErrorHandling(): void {
    // Wrap component lifecycle methods to catch errors
    const originalOncreate = this.oncreate;
    const originalOnupdate = this.onupdate;

    this.oncreate = (vnode: any) => {
      try {
        if (originalOncreate) {
          originalOncreate.call(this, vnode);
        }
      } catch (error) {
        this.handleError(error as Error, 'oncreate');
      }
    };

    this.onupdate = (vnode: any) => {
      try {
        if (originalOnupdate) {
          originalOnupdate.call(this, vnode);
        }
      } catch (error) {
        this.handleError(error as Error, 'onupdate');
      }
    };
  }

  /**
   * Handle component errors
   */
  private handleError(error: Error, phase?: string): void {
    const extensionError: ExtensionError = {
      name: error.name || 'ComponentError',
      message: error.message,
      component: this.attrs.context || 'ErrorBoundary',
      context: {
        phase,
        retryCount: this.state.retryCount,
        componentAttrs: this.attrs
      },
      timestamp: new Date(),
      stack: error.stack
    };

    this.state.hasError = true;
    this.state.error = extensionError;
    this.state.errorInfo = { phase };

    this.errorHandler.handleError(extensionError);
    
    // Trigger re-render
    m.redraw();
  }

  /**
   * Retry the failed operation
   */
  private retry(): void {
    if (this.state.retryCount >= this.maxRetries) {
      this.errorHandler.logError('Maximum retry attempts reached', {
        context: this.attrs.context,
        retryCount: this.state.retryCount
      });
      return;
    }

    this.state.retryCount++;
    this.state.hasError = false;
    this.state.error = null;
    this.state.errorInfo = null;

    this.errorHandler.logInfo(`Retrying component (attempt ${this.state.retryCount})`, {
      context: this.attrs.context
    });

    // Force re-render
    m.redraw();
  }

  /**
   * Reset error state
   */
  private reset(): void {
    this.state.hasError = false;
    this.state.error = null;
    this.state.errorInfo = null;
    this.state.retryCount = 0;
    m.redraw();
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(): string {
    if (!this.state.error) return 'An unknown error occurred';

    const { error } = this.state;

    // Customize messages based on error type
    if (error.component?.includes('Swiper')) {
      return 'The slideshow component failed to load. You can try refreshing the page.';
    }

    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return 'Unable to load content due to a network issue. Please check your connection.';
    }

    if (error.component?.includes('Settings')) {
      return 'Settings could not be loaded. Default values will be used.';
    }

    return 'A component failed to load properly. The page will continue to work normally.';
  }

  view() {
    // If there's an error, show error UI
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.attrs.fallback) {
        return this.attrs.fallback();
      }

      // Default error UI
      return (
        <div className="ErrorBoundary">
          <div className="ErrorBoundary-content">
            <div className="Alert Alert--error">
              <div className="ErrorBoundary-header">
                <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <h4>Something went wrong</h4>
              </div>
              
              <div className="ErrorBoundary-message">
                {this.getUserFriendlyMessage()}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="ErrorBoundary-details">
                  <summary>Technical Details (Development Mode)</summary>
                  <pre className="ErrorBoundary-stack">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\nStack trace:\n' + this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="ErrorBoundary-actions">
                {this.attrs.showRetry !== false && this.state.retryCount < this.maxRetries && (
                  <Button
                    className="Button Button--primary"
                    onclick={() => this.retry()}
                  >
                    <i className="fas fa-redo" aria-hidden="true"></i>
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}

                <Button
                  className="Button Button--link"
                  onclick={() => this.reset()}
                >
                  Dismiss
                </Button>

                <Button
                  className="Button Button--link"
                  onclick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    try {
      return this.children;
    } catch (error) {
      this.handleError(error as Error, 'render');
      return null;
    }
  }

  /**
   * Report error to external service (if configured)
   */
  private reportError(error: ExtensionError): void {
    // Only report in production
    if (process.env.NODE_ENV !== 'production') return;

    try {
      // This could be enhanced to send to an error reporting service
      const errorReport = {
        message: error.message,
        component: error.component,
        context: error.context,
        timestamp: error.timestamp?.toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: app.session?.user?.id() || 'anonymous'
      };

      // Example: Send to error reporting service
      // fetch('/api/error-reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      this.errorHandler.logInfo('Error report generated', errorReport);
    } catch (reportingError) {
      this.errorHandler.logError('Failed to report error', { reportingError });
    }
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<T extends Record<string, any>>(
  WrappedComponent: any,
  errorBoundaryProps?: Partial<ErrorBoundaryAttrs>
) {
  return class extends Component<T> {
    view() {
      return (
        <ErrorBoundary {...errorBoundaryProps}>
          <WrappedComponent {...this.attrs} />
        </ErrorBoundary>
      );
    }
  };
}

/**
 * Hook for error boundaries in functional components style
 */
export function useErrorBoundary(context?: string) {
  const errorHandler = ErrorHandler.getInstance(context || 'useErrorBoundary');
  
  return {
    catchError: (error: Error, errorInfo?: any) => {
      const extensionError: ExtensionError = {
        name: error.name,
        message: error.message,
        component: context || 'Unknown',
        context: errorInfo,
        timestamp: new Date(),
        stack: error.stack
      };
      
      errorHandler.handleError(extensionError);
    },
    
    resetError: () => {
      // Reset logic would depend on the specific implementation
      m.redraw();
    }
  };
}