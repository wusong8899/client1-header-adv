import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';

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
            // Add header icon for all users, on all pages
            addHeaderIcon();
            
            // Only initialize full extension on tags page
            if (configManager.isTagsPage()) {
                initializeExtension(vnode, slideshowManager, uiManager);
            }
        }, 'HeaderPrimary view extension');
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
 * Add header icon for branding
 */
function addHeaderIcon(): void {
    let headerIconContainer = document.getElementById(defaultConfig.ui.headerIconId);

    if (headerIconContainer === null) {
        // Get header icon URL from settings, fallback to default config
        const headerIconUrl = app.forum.attribute('Client1HeaderAdvHeaderIconUrl') || defaultConfig.ui.headerIconUrl;

        headerIconContainer = document.createElement("div");
        headerIconContainer.id = defaultConfig.ui.headerIconId;
        headerIconContainer.style.display = 'inline-block';
        headerIconContainer.style.marginTop = '8px';
        headerIconContainer.innerHTML = `<img src="${headerIconUrl}" style="height: 24px;" />`;

        const backControl = document.querySelector("#app-navigation .App-backControl");
        if (backControl) {
            backControl.insertBefore(headerIconContainer, backControl.firstChild);
        }
    }
}


