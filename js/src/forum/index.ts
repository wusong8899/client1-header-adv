import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import Navigation from 'flarum/common/components/Navigation';
import MobileRegisterButton from './components/MobileRegisterButton';
import MobileBrandLogo from './components/MobileBrandLogo';

import { SlideshowManager } from './components/SlideshowManager';
import { UIManager } from './components/UIManager';
import { ErrorHandler } from './utils/ErrorHandler';
import { ConfigManager } from './utils/ConfigManager';
import { PageChangeObserver } from './utils/PageChangeObserver';
import { isMobileDevice, logDetectionState } from './utils/MobileDetection';
import { defaultConfig } from '../common/config';


// Global variables for lifecycle management
let slideshowManager: SlideshowManager | null = null;
let uiManager: UIManager | null = null;
let pageChangeObserver: PageChangeObserver | null = null;
let isSlideshowActive = false;

/**
 * Main extension initializer
 */
app.initializers.add(defaultConfig.app.extensionId, () => {
    const errorHandler = ErrorHandler.getInstance();
    const configManager = ConfigManager.getInstance();

    // Log initial mobile detection state for debugging
    logDetectionState('Extension Initialization');

    // Initialize error handling
    if (!errorHandler.initialize()) {
        return;
    }

    slideshowManager = new SlideshowManager();
    uiManager = new UIManager();
    pageChangeObserver = PageChangeObserver.getInstance();

    // Start page change observer to detect TagTiles appearance
    pageChangeObserver.startObserving(() => {
        errorHandler.handleSync(async () => {
            if (uiManager) {
                await uiManager.recheckAndTransform();
            }
        }, 'PageChangeObserver callback');
    });

    extend(HeaderPrimary.prototype, 'view', function (vnode) {
        errorHandler.handleSync(() => {
            const isOnTagsPage = configManager.isTagsPage();
            
            if (isOnTagsPage && !isSlideshowActive) {
                // Initialize slideshow on tags page if not already active
                initializeExtension(vnode, slideshowManager!, uiManager!);
                isSlideshowActive = true;
            } else if (!isOnTagsPage && isSlideshowActive) {
                // Clean up slideshow when navigating away from tags page
                cleanupExtension();
                isSlideshowActive = false;
            }
        }, 'HeaderPrimary view extension');
    });

    // Add mobile navigation components (register button for logged out users + brand logo)
    extend(Navigation.prototype, 'view', function (vnode) {
        errorHandler.handleSync(() => {
            // Only work on mobile devices (viewport width < 768px)
            if (!isMobileDevice()) {
                return;
            }

            // Only work on homepage (tags page)
            const routeName = app.current.get('routeName');
            if (routeName !== 'tags') {
                return;
            }

            if (!vnode || !vnode.children || !Array.isArray(vnode.children)) {
                return;
            }

            // Add register button and brand logo for logged out users
            if (!app.session.user) {
                const hasBrandLogo = vnode.children.some((child: any) =>
                    child && child.attrs && child.attrs.className &&
                    child.attrs.className.includes('Navigation-mobileBrandLogo')
                );

                if (!hasBrandLogo) {
                    vnode.children.push(MobileBrandLogo.component({
                        className: "item-brand Navigation-mobileBrandLogo"
                    }));
                }

                const hasRegisterButton = vnode.children.some((child: any) =>
                    child && child.attrs && child.attrs.className &&
                    child.attrs.className.includes('Navigation-mobileRegister')
                );

                if (!hasRegisterButton) {
                    vnode.children.push(MobileRegisterButton.component({
                        className: "item-register Navigation-mobileRegister"
                    }));
                }
            }


        }, 'Navigation mobile components extension');
    });

    // Add cleanup on page unload to stop observers
    window.addEventListener('beforeunload', () => {
        if (pageChangeObserver) {
            pageChangeObserver.stopObserving();
        }
    });
});

/**
 * Initialize extension components
 */
async function initializeExtension(
    vnode: any,
    slideshowManager: SlideshowManager,
    uiManager: UIManager
): Promise<void> {
    try {
        // Setup slideshow
        slideshowManager.attachAdvertiseHeader(vnode);

        // Setup UI components
        await setupUIComponents(uiManager);

    } catch {
        // Silently handle initialization errors
    }
}

/**
 * Setup UI components
 */
async function setupUIComponents(uiManager: UIManager): Promise<void> {
    try {
        // Use the new recheck method which handles state management better
        await uiManager.recheckAndTransform();
    } catch {
        // Silently handle UI setup errors
    }
}

/**
 * Clean up extension components when navigating away from tags page
 */
function cleanupExtension(): void {
    try {
        // Destroy slideshow
        if (slideshowManager) {
            slideshowManager.destroy();
        }

        // Clean up any UI modifications
        if (uiManager) {
            // Restore hidden elements if needed
            const tagTiles = document.querySelector(".TagTiles") as HTMLElement;
            if (tagTiles) {
                tagTiles.style.display = '';
            }
            
            // Clean up TagTiles transformation
            uiManager.cleanup();
        }

        // Note: We don't stop the PageChangeObserver here because it should 
        // continue monitoring for when we return to the tags page
    } catch {
        // Silently handle cleanup errors
    }
}






