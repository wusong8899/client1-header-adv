import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import Navigation from 'flarum/common/components/Navigation';
import MobileHeaderIcon from './components/MobileHeaderIcon';

import { SlideshowManager } from './components/SlideshowManager';
import { UIManager } from './components/UIManager';
import { ErrorHandler } from './utils/ErrorHandler';
import { ConfigManager } from './utils/ConfigManager';
import { defaultConfig } from '../common/config';


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

    const slideshowManager = new SlideshowManager();
    const uiManager = new UIManager();

    extend(HeaderPrimary.prototype, 'view', function (vnode) {
        errorHandler.handleSync(() => {
            // Only show these elements on the tags page (main page)
            if (configManager.isTagsPage()) {
                // Initialize full extension (slideshow, etc.)
                initializeExtension(vnode, slideshowManager, uiManager);
            }
        }, 'HeaderPrimary view extension');
    });

    // Add mobile navigation extension similar to move-session-dropdown
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

            // Check if we already added the header icon component to avoid duplication
            const hasHeaderIcon = vnode.children.some((child: any) =>
                child && child.attrs && child.attrs.className &&
                child.attrs.className.includes('Navigation-mobileHeaderIcon')
            );

            if (!hasHeaderIcon) {
                // Add MobileHeaderIcon component to navigation
                vnode.children.push(MobileHeaderIcon.component({
                    className: "item-header Navigation-mobileHeaderIcon"
                }));
            }
        }, 'Navigation mobile header icon extension');
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






