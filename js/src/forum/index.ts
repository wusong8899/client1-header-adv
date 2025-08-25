import { extend, override } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
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

    // Initialize slideshow on header render (for header advertisements)
    extend(HeaderPrimary.prototype, 'view', function (_vnode) {
        try {
            // Initialize slideshow only if we have slide settings
            if (slideShow && isTagsPage()) {
                slideShow.init();
            }
        } catch (error) {
            console.error('SlideShow initialization error:', error);
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
        return routeName === 'tags';
    } catch {
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