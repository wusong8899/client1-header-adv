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
import { defaultConfig } from '../common/config';


// Global variables for lifecycle management
let slideshowManager: SlideshowManager | null = null;
let uiManager: UIManager | null = null;
let isSlideshowActive = false;

/**
 * Main extension initializer
 */
app.initializers.add(defaultConfig.app.extensionId, () => {
    const errorHandler = ErrorHandler.getInstance();
    const configManager = ConfigManager.getInstance();

    // Initialize error handling
    if (!errorHandler.initialize()) {
        return;
    }

    slideshowManager = new SlideshowManager();
    uiManager = new UIManager();

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
            // Only work on mobile devices (viewport width <= 768px)
            if (window.innerWidth > 768) {
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
        if (!document.getElementById("swiperTagContainer")) {
            await uiManager.changeCategoryLayout();
            // Additional UI setup would go here
        }
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
        }
    } catch {
        // Silently handle cleanup errors
    }
}






