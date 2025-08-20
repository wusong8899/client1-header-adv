import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';

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
            if (app.session.user) {
                // Logged in users: show money display and user avatar (hide header icon)
                hideHeaderIcon();
                addMoneyDisplay();
                addUserAvatar();
            } else {
                // Not logged in: show header icon only
                addHeaderIcon();
            }
            
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
        moneyText.innerHTML = '<span style="font-size:16px;"><i class="fab fa-bitcoin" style="padding-right: 8px;color: gold;"></i></span>' + userMoneyText;
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
 * Add user avatar dropdown to the right side of navigation
 */
function addUserAvatar(): void {
    if (!app.session.user) {
        return;
    }

    let userAvatarContainer = document.getElementById("userAvatarContainer");
    const appNavigation = document.getElementById("app-navigation");

    // Create container if it doesn't exist
    if (userAvatarContainer === null) {
        userAvatarContainer = document.createElement("div");
        userAvatarContainer.id = "userAvatarContainer";
        userAvatarContainer.style.position = "absolute";
        userAvatarContainer.style.right = "10px";
        userAvatarContainer.style.top = "50%";
        userAvatarContainer.style.transform = "translateY(-50%)";

        if (appNavigation) {
            appNavigation.appendChild(userAvatarContainer);
        }
    }

    // Always try to add avatar if container exists but is empty
    if (userAvatarContainer && userAvatarContainer.children.length === 0) {
        // Try multiple selectors to find the original dropdown
        let originalDropdown = document.querySelector("#header-secondary .item-session .SessionDropdown");
        if (!originalDropdown) {
            originalDropdown = document.querySelector(".SessionDropdown");
        }
        if (!originalDropdown) {
            originalDropdown = document.querySelector(".item-session");
        }

        if (originalDropdown) {
            const avatarClone = originalDropdown.cloneNode(true) as HTMLElement;
            avatarClone.id = "avatarClone";
            
            // Add click handler to the dropdown toggle button to trigger new discussion
            const dropdownToggle = avatarClone.querySelector('.Dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Open the new discussion composer
                    app.composer.load(DiscussionComposer, {
                        user: app.session.user
                    });
                    app.composer.show();
                });
            }
            
            // Add transfer money button click handler
            const transferButton = avatarClone.querySelector('.item-transferMoney button');
            if (transferButton) {
                transferButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Try to access TransferMoneyModal through the extension registry
                    try {
                        const extensions = (window as any).flarum?.reg?.data || {};
                        const moneyTransferExtension = extensions['wusong8899-transfer-money'];
                        
                        if (moneyTransferExtension && moneyTransferExtension.TransferMoneyModal) {
                            app.modal.show(moneyTransferExtension.TransferMoneyModal);
                        } else {
                            // Fallback: try to trigger the original button if it exists
                            const originalTransferButton = document.querySelector('#header-secondary .item-transferMoney button');
                            if (originalTransferButton) {
                                (originalTransferButton as HTMLElement).click();
                            } else {
                                console.warn('TransferMoneyModal not available');
                            }
                        }
                    } catch (error) {
                        console.error('Error accessing TransferMoneyModal:', error);
                        // Fallback to original button
                        const originalTransferButton = document.querySelector('#header-secondary .item-transferMoney button');
                        if (originalTransferButton) {
                            (originalTransferButton as HTMLElement).click();
                        }
                    }
                });
            }

            userAvatarContainer.appendChild(avatarClone);
            console.log('Avatar clone added successfully');
        } else {
            console.warn('Original dropdown not found for cloning');
        }
    }
}


