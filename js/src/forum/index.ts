import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';

import { SlideShow } from './SlideShow';
import { TagSlider } from './TagSlider';

// Extension constants
const EXTENSION_ID = 'wusong8899-client1-header-adv';

// Global managers
let slideShow: SlideShow | null = null;
let tagSlider: TagSlider | null = null;

/**
 * Main extension initializer
 */
app.initializers.add(EXTENSION_ID, () => {
    slideShow = new SlideShow();
    tagSlider = new TagSlider();

    // Initialize slideshow on header render
    extend(HeaderPrimary.prototype, 'view', function (_vnode) {
        try {
            // Initialize slideshow
            if (slideShow && isTagsPage()) {
                slideShow.init();
            }

            // Transform tags if on tags page
            if (tagSlider && isTagsPage() && hasTagTiles()) {
                setTimeout(() => {
                    tagSlider?.transform();
                }, 100); // Small delay to ensure DOM is ready
            }
        } catch (error) {
            console.error('Extension initialization error:', error);
        }
    });

    // Clean up on page navigation
    app.history.push = new Proxy(app.history.push, {
        apply(target, thisArg, argumentsList) {
            cleanupExtension();
            return Reflect.apply(target, thisArg, argumentsList);
        }
    });
});

/**
 * Check if current page is tags page
 */
function isTagsPage(): boolean {
    const routeName = app.current.get('routeName');
    return routeName === 'tags' || routeName === 'index';
}

/**
 * Check if TagTiles exist on the page
 */
function hasTagTiles(): boolean {
    return document.querySelectorAll('.TagTile').length > 0;
}

/**
 * Clean up extension components
 */
function cleanupExtension(): void {
    try {
        if (slideShow) {
            slideShow.destroy();
        }
        
        if (tagSlider) {
            tagSlider.cleanup();
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}