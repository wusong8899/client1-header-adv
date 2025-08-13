import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';

import { SlideshowManager } from './components/SlideshowManager';
import { UIManager } from './components/UIManager';
import { DataLoader } from './services/DataLoader';
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
        console.error('Failed to initialize extension error handling');
        return;
    }

    const slideshowManager = new SlideshowManager();
    const uiManager = new UIManager();
    const dataLoader = DataLoader.getInstance();

    extend(HeaderPrimary.prototype, 'view', function (vnode) {
        errorHandler.handleSync(() => {
            if (configManager.isTagsPage()) {
                initializeExtension(vnode, slideshowManager, uiManager, dataLoader);
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
    uiManager: UIManager,
    dataLoader: DataLoader
): Promise<void> {
    try {
        // Setup slideshow
        slideshowManager.attachAdvertiseHeader(vnode);

        // Load all data
        await dataLoader.loadAllData();

        // Setup UI components
        await setupUIComponents(uiManager);

        // Add header icon for non-logged users
        if (!app.session.user) {
            addHeaderIcon();
        }

    } catch (error) {
        console.error('Failed to initialize extension:', error);
    }
}

/**
 * Setup UI components after data is loaded
 */
async function setupUIComponents(uiManager: UIManager): Promise<void> {
    const checkDataTask = setInterval(async () => {
        const dataLoader = DataLoader.getInstance();
        const linksQueueList = dataLoader.getLinksQueueList();
        const buttonsCustomizationList = dataLoader.getButtonsCustomizationList();

        if (linksQueueList !== null && buttonsCustomizationList !== null) {
            clearInterval(checkDataTask);

            if (!document.getElementById("swiperTagContainer")) {
                await uiManager.changeCategoryLayout();
                // Additional UI setup would go here
            }
        }
    }, defaultConfig.slider.dataCheckInterval);
}

/**
 * Add header icon for branding
 */
function addHeaderIcon(): void {
    let headerIconContainer = document.getElementById(defaultConfig.ui.headerIconId);

    if (headerIconContainer === null) {
        headerIconContainer = document.createElement("div");
        headerIconContainer.id = defaultConfig.ui.headerIconId;
        headerIconContainer.style.display = 'inline-block';
        headerIconContainer.style.marginTop = '8px';
        headerIconContainer.innerHTML = `<img src="${defaultConfig.ui.headerIconUrl}" style="height: 24px;" />`;

        const backControl = document.querySelector("#app-navigation .App-backControl");
        if (backControl) {
            backControl.insertBefore(headerIconContainer, backControl.firstChild);
        }
    }
}


