/**
 * Mobile device detection utility using viewport width (pixel-based detection)
 */

/**
 * Breakpoint values aligned with Flarum core @phone breakpoint
 * @phone corresponds to max-width: 767px in Flarum
 */
const MOBILE_BREAKPOINT = 768; // Mobile devices: width < 768px
const TABLET_BREAKPOINT = 1024; // Tablet devices: 768px <= width < 1024px

/**
 * Check if the current device is mobile based on viewport width
 * @returns {boolean} True if mobile device (viewport width < 768px)
 */
export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') {
        return false; // SSR fallback
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Check if the current device is tablet
 * @returns {boolean} True if tablet device (768px <= width < 1024px)
 */
export function isTabletDevice(): boolean {
    if (typeof window === 'undefined') {
        return false; // SSR fallback
    }
    return window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT;
}

/**
 * Check if the current device is desktop
 * @returns {boolean} True if desktop device (width >= 1024px)
 */
export function isDesktopDevice(): boolean {
    if (typeof window === 'undefined') {
        return false; // SSR fallback
    }
    return window.innerWidth >= TABLET_BREAKPOINT;
}

/**
 * Get current viewport width
 * @returns {number} Current viewport width in pixels
 */
export function getViewportWidth(): number {
    if (typeof window === 'undefined') {
        return TABLET_BREAKPOINT; // SSR fallback assumes desktop
    }
    return window.innerWidth;
}

/**
 * Get event type based on device
 * @returns {string} 'touchend' for mobile, 'click' for desktop
 */
export function getEventType(): string {
    return isMobileDevice() ? 'touchend' : 'click';
}

/**
 * Get responsive configuration for Swiper based on viewport width
 * @returns {object} Configuration object with mobile-specific settings
 */
export function getSwiperConfig() {
    const mobile = isMobileDevice();
    const tablet = isTabletDevice();
    
    if (mobile) {
        return {
            spaceBetween: 90,
            slidesPerView: 2,
        };
    } else if (tablet) {
        return {
            spaceBetween: 50,
            slidesPerView: 4,
        };
    } else {
        return {
            spaceBetween: 10,
            slidesPerView: 7,
        };
    }
}

/**
 * Get responsive configuration for tag Swiper based on viewport width
 * @returns {object} Configuration object with mobile-specific settings
 */
export function getTagSwiperConfig() {
    const mobile = isMobileDevice();
    const tablet = isTabletDevice();
    
    if (mobile) {
        return {
            spaceBetween: 80,
            slidesPerView: 4,
        };
    } else if (tablet) {
        return {
            spaceBetween: 40,
            slidesPerView: 5,
        };
    } else {
        return {
            spaceBetween: 10,
            slidesPerView: 7,
        };
    }
}

/**
 * Add event listener for viewport resize changes
 * Useful for responsive components that need to update on window resize
 * @param {Function} callback - Function to call when viewport changes device category
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 250)
 * @returns {Function} Cleanup function to remove the listener
 */
export function onViewportChange(callback: () => void, debounceMs: number = 250): () => void {
    if (typeof window === 'undefined') {
        return () => {}; // SSR fallback
    }
    
    let timeoutId: number;
    let lastDeviceType = getDeviceType();
    
    const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            const currentDeviceType = getDeviceType();
            if (currentDeviceType !== lastDeviceType) {
                lastDeviceType = currentDeviceType;
                callback();
            }
        }, debounceMs);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
    };
}

/**
 * Get current device type as string
 * @returns {'mobile' | 'tablet' | 'desktop'} Current device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (isMobileDevice()) return 'mobile';
    if (isTabletDevice()) return 'tablet';
    return 'desktop';
}

/**
 * Log current detection state for debugging
 * @param {string} context - Context description for the log
 */
export function logDetectionState(context: string = 'Mobile Detection'): void {
    if (typeof window !== 'undefined' && typeof console !== 'undefined') {
        const width = getViewportWidth();
        const device = getDeviceType();
        console.log(`[${context}] Viewport: ${width}px | Device: ${device} | Mobile: ${isMobileDevice()} | Tablet: ${isTabletDevice()} | Desktop: ${isDesktopDevice()}`);
    }
}
