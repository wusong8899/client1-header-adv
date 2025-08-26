import { extend, override } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import TagsPage from 'flarum/tags/forum/components/TagsPage';
import Navigation from 'flarum/forum/components/Navigation';
import { hasContent, reloadSettings, getActiveSocialLinks } from './utils/SettingsManager';
import { SlideShow } from './SlideShow';
import TagSwiper from './components/TagSwiper';
import SocialMediaButtons from './components/SocialMediaButtons';
import MobileRegisterButton from './components/MobileRegisterButton';
import MobileBrandLogo from './components/MobileBrandLogo';
import { errorHandler } from './utils/ErrorHandler';
import m from 'mithril';

// Extension constants
const EXTENSION_ID = 'wusong8899-client1-header-adv';

// Global managers
let slideShow: SlideShow | null = null;

/**
 * Main extension initializer
 */
app.initializers.add(EXTENSION_ID, () => {
    // Defer slideshow initialization until first use
    // This avoids accessing app.forum before it's initialized

    // Note: SlideShow initialization moved to oncreate to prevent duplicate calls
    // The view method is called on every render, causing multiple slideshow containers

    // Extend oncreate to initialize slideshow (called only once per component lifecycle)
    extend(TagsPage.prototype, 'oncreate', function () {
        try {
            // Initialize slideshow when TagsPage component is created
            if (isTagsPage()) {
                // Initialize slideshow only when needed and if content exists
                if (!slideShow && hasContent()) {
                    slideShow = new SlideShow();
                }
                
                // Initialize slideshow after DOM is fully ready
                if (slideShow) {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            slideShow.init();
                        }, 150);
                    });
                }
            }
        } catch (error) {
            console.error('SlideShow oncreate initialization error:', error);
        }
    });

    // Override TagsPage tagTileListView to use our TagSwiper component
    override(TagsPage.prototype, 'tagTileListView', function (original, pinned) {
        try {
            // Use TagSwiper if we have pinned tags and conditions are met
            if (shouldUseTagSwiper(pinned)) {
                return m(TagSwiper, { tags: pinned });
            }

            // Fall back to original rendering
            return original(pinned);
        } catch (error) {
            console.error('TagSwiper override error:', error);
            // Always fall back to original on error
            return original(pinned);
        }
    });

    // Extend TagsPage view to add social media buttons
    extend(TagsPage.prototype, 'view', function (vnode) {
        const result = vnode;

        try {
            // Only add social buttons on tags page
            if (isTagsPage()) {
                // Add social media buttons to the page content
                setTimeout(() => {
                    this.addSocialMediaButtons();
                }, 200);
            }
        } catch (error) {
            console.error('SocialMediaButtons integration error:', error);
        }

        return result;
    });

    // Add method to TagsPage for social media buttons
    TagsPage.prototype.addSocialMediaButtons = function () {
        try {
            // Get active social links
            const socialLinks = getActiveSocialLinks();
            
            if (!socialLinks || socialLinks.length === 0) {
                return; // No social links to display
            }

            // Find the container where we want to add social buttons
            const container = document.querySelector('.TagTiles') ||
                document.querySelector('.tag-slider-container') ||
                document.querySelector('.container');

            if (!container || document.querySelector('.social-buttons-container')) {
                return; // Container not found or buttons already exist
            }

            // Create a wrapper div for social buttons
            const socialWrapper = document.createElement('div');
            socialWrapper.className = 'social-media-wrapper';

            // Insert after the main content
            if (container.parentNode) {
                container.parentNode.insertBefore(socialWrapper, container.nextSibling);

                // Render social media buttons using Mithril with social links as props
                m.render(socialWrapper, m(SocialMediaButtons, { socialLinks }));
            }
        } catch (error) {
            console.error('SocialMediaButtons addSocialMediaButtons error:', error);
        }
    };

    // Add mobile navigation components (register button for logged out users + brand logo)
    extend(Navigation.prototype, 'view', function (vnode) {
        return errorHandler.handleSync(() => {
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

    // Clean up on page navigation
    const originalPush = app.history.push;
    app.history.push = function (...args) {
        cleanupExtension();
        return originalPush.apply(this, args);
    };
});

/**
 * Determine whether to use TagSwiper for the given tags
 */
function shouldUseTagSwiper(tags: any[]): boolean {
    // Only use TagSwiper if:
    // 1. We have tags to display
    // 2. Not too many tags (performance consideration)
    // 3. Not on mobile (optional - can be adjusted)

    if (!tags || tags.length === 0) {
        return false;
    }

    // Don't use carousel for too many tags (fallback to grid)
    if (tags.length > 12) {
        return false;
    }

    // Always use TagSwiper for now (can add more conditions later)
    return true;
}

/**
 * Check if current page is tags page
 */
function isTagsPage(): boolean {
    try {
        const routeName = app.current.get('routeName');
        return routeName === 'tags';
    } catch {
        return false;
    }
}

/**
 * Check if current device is mobile (viewport width < 768px)
 */
function isMobileDevice(): boolean {
    return window.innerWidth < 768;
}

/**
 * Clean up extension components
 */
function cleanupExtension(): void {
    try {
        if (slideShow) {
            slideShow.destroy();
        }
        // Clear settings cache for fresh data on next page
        reloadSettings();
        // TagSwiper components are automatically cleaned up by Mithril lifecycle
    } catch (error) {
        console.error('Extension cleanup error:', error);
    }
}