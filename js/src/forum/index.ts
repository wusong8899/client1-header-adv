import { extend, override } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import TagsPage from 'flarum/tags/forum/components/TagsPage';

import { SlideShow } from './SlideShow';
import TagSwiper from './components/TagSwiper';

// Extension constants
const EXTENSION_ID = 'wusong8899-client1-header-adv';

// Global managers
let slideShow: SlideShow | null = null;

/**
 * Main extension initializer
 */
app.initializers.add(EXTENSION_ID, () => {
    // Initialize slideshow manager
    slideShow = new SlideShow();

    // Extend TagsPage view to initialize slideshow
    extend(TagsPage.prototype, 'view', function (vnode) {
        const result = vnode;
        
        try {
            // Initialize slideshow after TagsPage renders, but only if on tags page
            if (slideShow && isTagsPage()) {
                // Use a small delay to ensure DOM is fully rendered
                setTimeout(() => {
                    slideShow.init();
                }, 100);
            }
        } catch (error) {
            console.error('SlideShow initialization error:', error);
        }
        
        return result;
    });

    // Also extend oncreate to ensure initialization after DOM creation
    extend(TagsPage.prototype, 'oncreate', function () {
        try {
            // Initialize slideshow when TagsPage component is created
            if (slideShow && isTagsPage()) {
                // Delay initialization to allow DOM to be fully ready
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        slideShow.init();
                    }, 150);
                });
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

    // Clean up on page navigation
    const originalPush = app.history.push;
    app.history.push = function(...args) {
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
        const isTagsRoute = routeName === 'tags';
        console.log('SlideShow: Page check - Route:', routeName, 'Is tags page:', isTagsRoute);
        return isTagsRoute;
    } catch (error) {
        console.log('SlideShow: Page check failed:', error);
        return false;
    }
}

/**
 * Clean up extension components
 */
function cleanupExtension(): void {
    try {
        if (slideShow) {
            slideShow.destroy();
        }
        // TagSwiper components are automatically cleaned up by Mithril lifecycle
    } catch (error) {
        console.error('Extension cleanup error:', error);
    }
}