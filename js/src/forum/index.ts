import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import SessionDropdown from 'flarum/forum/components/SessionDropdown';
import m from 'mithril';

import { SlideshowManager } from './components/SlideshowManager';
import { UIManager } from './components/UIManager';
import { ErrorHandler } from './utils/ErrorHandler';
import { ConfigManager } from './utils/ConfigManager';
import { defaultConfig } from '../common/config';

// Track mounted component for cleanup
let navSessionMount: HTMLElement | null = null;

/**
 * Check if current device is mobile
 */
function isMobile(): boolean {
    return window.innerWidth <= 767.98; // Matches Flarum's @phone breakpoint
}

/**
 * Mount SessionDropdown in navigation bar (mobile tags page only)
 */
function mountSessionDropdownInNav(configManager: any): void {
    // Only proceed on mobile tags page for logged-in users
    if (!app.session.user || !isMobile() || !configManager.isTagsPage()) {
        cleanupNavSession();
        return;
    }
    
    // Clean up any existing mount
    cleanupNavSession();
    
    // Create mount point in navigation bar
    const appNavigation = document.getElementById('app-navigation');
    if (appNavigation) {
        navSessionMount = document.createElement('div');
        navSessionMount.id = 'nav-session-mount';
        navSessionMount.className = 'nav-session-dropdown';
        appNavigation.appendChild(navSessionMount);
        
        // Mount SessionDropdown component
        try {
            m.mount(navSessionMount, SessionDropdown);
        } catch (error) {
            console.warn('Failed to mount SessionDropdown in navigation:', error);
            cleanupNavSession();
        }
    }
}

/**
 * Cleanup function for unmounting SessionDropdown
 */
function cleanupNavSession(): void {
    if (navSessionMount) {
        try {
            m.mount(navSessionMount, null); // Unmount component
            navSessionMount.remove();
        } catch {
            // Silent cleanup - just remove the element
            navSessionMount.remove();
        }
        navSessionMount = null;
    }
}

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
                if (app.session.user) {
                    // Logged in users on tags page: show money display
                    hideHeaderIcon();
                    addMoneyDisplay();
                    
                    // Mount SessionDropdown in navigation bar for mobile
                    mountSessionDropdownInNav(configManager);
                } else {
                    // Not logged in on tags page: show header icon only
                    addHeaderIcon();
                    cleanupNavSession(); // Ensure cleanup for non-logged users
                }

                // Initialize full extension (slideshow, etc.)
                initializeExtension(vnode, slideshowManager, uiManager);
            } else {
                // On other pages: hide any custom header elements that might be showing
                cleanupNavSession(); // Cleanup SessionDropdown from navigation bar
                
                if (app.session.user) {
                    hideMoneyDisplay();
                    addHeaderIcon(); // Show header icon for branding on other pages
                } else {
                    addHeaderIcon(); // Always show header icon for non-logged users
                }
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
 * Add header icon for branding (only for non-logged users)
 */
function addHeaderIcon(): void {
    // Only show header icon if user is not logged in
    if (app.session.user) {
        return;
    }

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
    } else {
        // Make sure it's visible for non-logged users
        headerIconContainer.style.display = 'inline-block';
    }
}

/**
 * Hide header icon when user is logged in
 */
function hideHeaderIcon(): void {
    const headerIconContainer = document.getElementById(defaultConfig.ui.headerIconId);
    if (headerIconContainer) {
        headerIconContainer.style.display = 'none';
    }
}

/**
 * Add money display component with withdrawal button (replaces header icon position when logged in)
 */
function addMoneyDisplay(): void {
    let moneyDisplayContainer = document.getElementById("moneyDisplayContainer");

    if (moneyDisplayContainer === null && app.session.user) {
        const appNavigation = document.getElementById("app-navigation");
        const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
        const userMoneyText = moneyName.replace('[money]', app.session.user.attribute("money"));

        moneyDisplayContainer = document.createElement("div");
        moneyDisplayContainer.id = "moneyDisplayContainer";
        moneyDisplayContainer.className = "clientCustomizeWithdrawalHeaderTotalMoney";

        const moneyText = document.createElement("div");
        moneyText.innerHTML = '<span><i class="fab fa-bitcoin" style="padding-right: 8px;color: gold;"></i></span>' + userMoneyText;
        moneyText.className = "clientCustomizeWithdrawalHeaderText";

        const moneyIcon = document.createElement("div");
        moneyIcon.innerHTML = '<i class="fas fa-wallet"></i>';
        moneyIcon.className = "clientCustomizeWithdrawalHeaderIcon";

        // Add withdrawal button next to wallet icon
        const withdrawalButton = document.createElement("div");
        withdrawalButton.innerHTML = '<i class="fas fa-money-bill-transfer"></i><span style="margin-left: 4px; font-size: 12px;">提款</span>';
        withdrawalButton.className = "clientCustomizeWithdrawalButton";
        withdrawalButton.style.cursor = "pointer";
        withdrawalButton.title = "提款";

        // Add click handler for withdrawal button
        withdrawalButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Navigate to withdrawal page
            window.location.href = '/withdrawal';
        });

        moneyDisplayContainer.appendChild(moneyText);
        moneyDisplayContainer.appendChild(moneyIcon);
        moneyDisplayContainer.appendChild(withdrawalButton);

        if (appNavigation) {
            appNavigation.appendChild(moneyDisplayContainer);
        }
    } else if (moneyDisplayContainer) {
        // Make sure it's visible for logged-in users
        moneyDisplayContainer.style.display = 'flex';
    }
}

/**
 * Hide money display component
 */
function hideMoneyDisplay(): void {
    const moneyDisplayContainer = document.getElementById("moneyDisplayContainer");
    if (moneyDisplayContainer) {
        moneyDisplayContainer.style.display = 'none';
    }
}

// Note: hideUserAvatar() function removed - now using CSS repositioning
// The original SessionDropdown in HeaderSecondary is repositioned via CSS


