import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';

import { SlideshowManager } from './components/SlideshowManager';
import { UIManager } from './components/UIManager';
import { DataLoader } from './services/DataLoader';
import { MobileDetection } from './utils/MobileDetection';
import { ErrorHandler } from './utils/ErrorHandler';
import { ConfigManager } from './utils/ConfigManager';

/**
 * Main extension initializer
 */
app.initializers.add('wusong8899-client1-header-adv', () => {
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
        const tronscanList = dataLoader.getTronscanList();
        const linksQueueList = dataLoader.getLinksQueueList();
        const buttonsCustomizationList = dataLoader.getButtonsCustomizationList();

        if (tronscanList !== null && linksQueueList !== null && buttonsCustomizationList !== null) {
            clearInterval(checkDataTask);

            if (!document.getElementById("swiperTagContainer")) {
                await uiManager.changeCategoryLayout();
                // Additional UI setup would go here
            }
        }
    }, 100);
}

/**
 * Add header icon for branding
 */
function addHeaderIcon(): void {
    let headerIconContainer = document.getElementById("wusong8899Client1HeaderIcon");

    if (headerIconContainer === null) {
        headerIconContainer = document.createElement("div");
        headerIconContainer.id = "wusong8899Client1HeaderIcon";
        headerIconContainer.style.display = 'inline-block';
        headerIconContainer.style.marginTop = '8px';
        headerIconContainer.innerHTML = '<img src="https://lg666.cc/assets/files/2023-01-18/1674049401-881154-test-16.png" style="height: 24px;" />';

        const backControl = document.querySelector("#app-navigation .App-backControl");
        if (backControl) {
            backControl.insertBefore(headerIconContainer, backControl.firstChild);
        }
    }
}


