import { ConfigManager } from './ConfigManager';
import { ErrorHandler } from './ErrorHandler';

/**
 * Observer for detecting page changes and DOM updates in Flarum SPA
 * Monitors for TagTiles appearance and triggers transformations as needed
 */
export class PageChangeObserver {
    private static instance: PageChangeObserver;
    private observer: MutationObserver | null = null;
    private periodicCheckInterval: number | null = null;
    private isObserving = false;
    private readonly configManager: ConfigManager;
    private readonly errorHandler: ErrorHandler;
    private lastTagsPageCheck = false;
    private onTagTilesDetected: (() => void) | null = null;

    private constructor() {
        this.configManager = ConfigManager.getInstance();
        this.errorHandler = ErrorHandler.getInstance();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): PageChangeObserver {
        if (!PageChangeObserver.instance) {
            PageChangeObserver.instance = new PageChangeObserver();
        }
        return PageChangeObserver.instance;
    }

    /**
     * Start observing page changes
     * @param callback Function to call when TagTiles are detected
     */
    startObserving(callback: () => void): void {
        if (this.isObserving) {
            return;
        }

        this.onTagTilesDetected = callback;
        this.isObserving = true;

        // Start MutationObserver
        this.startMutationObserver();

        // Start periodic check as fallback
        this.startPeriodicCheck();
    }

    /**
     * Stop observing page changes
     */
    stopObserving(): void {
        if (!this.isObserving) {
            return;
        }

        this.isObserving = false;
        this.onTagTilesDetected = null;

        // Stop MutationObserver
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Stop periodic check
        if (this.periodicCheckInterval) {
            clearInterval(this.periodicCheckInterval);
            this.periodicCheckInterval = null;
        }
    }

    /**
     * Start MutationObserver to watch for DOM changes
     */
    private startMutationObserver(): void {
        try {
            this.observer = new MutationObserver((mutations) => {
                this.errorHandler.handleSync(() => {
                    this.handleMutations(mutations);
                }, 'PageChangeObserver mutation handling');
            });

            // Observe changes in the main content area
            const contentArea = document.querySelector('#content .container');
            if (contentArea) {
                this.observer.observe(contentArea, {
                    childList: true,
                    subtree: true,
                    attributes: false
                });
            }
        } catch (error) {
            console.error('Failed to start MutationObserver:', error);
        }
    }

    /**
     * Handle mutation events
     */
    private handleMutations(mutations: MutationRecord[]): void {
        let shouldCheck = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                // Check if any added nodes contain TagTiles or TagsPage-content
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        if (this.containsTagTiles(element)) {
                            shouldCheck = true;
                            break;
                        }
                    }
                }

                if (shouldCheck) break;
            }
        }

        if (shouldCheck) {
            // Delay check to ensure DOM is fully rendered
            setTimeout(() => {
                this.checkForTagsPageTransformation();
            }, 100);
        }
    }

    /**
     * Check if element contains TagTiles
     */
    private containsTagTiles(element: Element): boolean {
        return element.matches('.TagTiles') || 
               element.querySelector('.TagTiles') !== null ||
               element.matches('.TagsPage-content') ||
               element.querySelector('.TagsPage-content') !== null;
    }

    /**
     * Start periodic check as fallback mechanism
     */
    private startPeriodicCheck(): void {
        this.periodicCheckInterval = setInterval(() => {
            this.errorHandler.handleSync(() => {
                this.checkForTagsPageTransformation();
            }, 'PageChangeObserver periodic check');
        }, 500); // Check every 500ms
    }

    /**
     * Check if we need to apply TagTiles transformation
     */
    private checkForTagsPageTransformation(): void {
        const isOnTagsPage = this.configManager.isTagsPage();
        const tagTilesExist = document.querySelector('.TagTiles') !== null;
        const transformationAlreadyApplied = document.querySelector('#swiperTagContainer') !== null;

        // Only proceed if we're on tags page, TagTiles exist, and transformation hasn't been applied
        if (isOnTagsPage && tagTilesExist && !transformationAlreadyApplied) {
            if (this.onTagTilesDetected) {
                this.onTagTilesDetected();
            }
        }

        // Update state tracking
        this.lastTagsPageCheck = isOnTagsPage;
    }

    /**
     * Force a recheck of the current page state
     */
    forceRecheck(): void {
        if (this.isObserving) {
            this.checkForTagsPageTransformation();
        }
    }

    /**
     * Check if currently observing
     */
    isActivelyObserving(): boolean {
        return this.isObserving;
    }

    /**
     * Get current observation state for debugging
     */
    getObserverState(): {
        isObserving: boolean;
        hasObserver: boolean;
        hasPeriodicCheck: boolean;
        lastTagsPageCheck: boolean;
    } {
        return {
            isObserving: this.isObserving,
            hasObserver: this.observer !== null,
            hasPeriodicCheck: this.periodicCheckInterval !== null,
            lastTagsPageCheck: this.lastTagsPageCheck
        };
    }
}