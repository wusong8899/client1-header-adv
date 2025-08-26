import type { SwiperOptions } from 'swiper/types';
import app from 'flarum/forum/app';

/**
 * Shared Swiper Configuration
 * 
 * Provides centralized Swiper configuration for both SlideShow and TagSwiper components.
 * Includes responsive breakpoints, accessibility, and SPA-critical settings.
 */

/**
 * Get base configuration for SlideShow (header advertisements)
 */
export function getSlideShowConfig(slideCount: number, transitionTime: number): SwiperOptions {
    const enableLoop = slideCount >= 3; // Need at least 3 slides for safe loop mode

  return {
    // Basic configuration
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: true,

    // Effect
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },

    // Autoplay
    autoplay: {
      delay: transitionTime,
      disableOnInteraction: false,
    },

    // Navigation
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Pagination
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },

    // Loop
    loop: enableLoop,

    // SPA-critical settings
    ...getSpaSettings(),

    // Responsive breakpoints for slideshow
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 'auto',
        spaceBetween: 20,
      },
    },
  };
}

/**
 * Get configuration for TagSwiper (tag carousel)
 */
export function getTagSwiperConfig(): SwiperOptions {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;

  return {
    // Basic configuration - responsive
    slidesPerView: isMobile ? 1 : isTablet ? 2 : 'auto',
    spaceBetween: 20,
    centeredSlides: !isMobile,

    // Effect - slide on mobile for better performance
    effect: isMobile ? 'slide' : 'coverflow',
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },

    // Autoplay - slower for tags
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    // Navigation
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Pagination
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      dynamicBullets: true,
    },

    // No loop for tags to avoid duplication
    loop: false,

    // SPA-critical settings
    ...getSpaSettings(),

    // Responsive breakpoints for tags
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
        effect: 'slide',
      },
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 15,
        effect: 'coverflow',
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
        effect: 'coverflow',
      },
      1440: {
        slidesPerView: 'auto',
        spaceBetween: 25,
        effect: 'coverflow',
      }
    },

    // Accessibility for tags
    a11y: {
      enabled: true,
      prevSlideMessage: app.translator.trans('core.lib.previous'),
      nextSlideMessage: app.translator.trans('core.lib.next'),
    }
  };
}

/**
 * Get SPA-critical settings required for Flarum
 * These settings ensure proper operation in single-page applications
 */
function getSpaSettings(): Partial<SwiperOptions> {
  return {
    // SPA-critical settings for Flarum
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
  };
}

/**
 * Get common event callbacks
 */
export function getEventCallbacks(componentName: string) {
  return {
    init: () => {
      console.log(`${componentName} Swiper initialized`);
    },
    destroy: () => {
      console.log(`${componentName} Swiper destroyed`);
    }
  };
}

/**
 * Utility: Find Swiper container with multiple strategies
 */
export function findContainer(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
  }
  return null;
}

/**
 * Utility: Safe Swiper destruction
 */
export function destroySwiper(swiper: any, containerSelector?: string): void {
  if (swiper && typeof swiper.destroy === 'function') {
    try {
      swiper.destroy(true, true);
      
      // Clear container reference if provided
      if (containerSelector) {
        const container = document.querySelector(containerSelector) as any;
        if (container) {
          container.swiperInstance = null;
        }
      }
    } catch (error) {
      console.error('Error destroying Swiper:', error);
    }
  }
}

/**
 * Utility: Initialize Swiper with error handling
 */
export async function initializeSwiper(
  container: HTMLElement,
  config: SwiperOptions,
  componentName: string
): Promise<any> {
  // Check if Swiper is available
  const { default: Swiper } = await import('swiper/bundle');
  
  if (!Swiper) {
    throw new Error(`${componentName}: Swiper class not found`);
  }

  try {
    const swiper = new Swiper(container, {
      ...config,
      on: {
        ...config.on,
        ...getEventCallbacks(componentName)
      }
    });

    // Store reference for cleanup
    (container as any).swiperInstance = swiper;
    
    return swiper;
  } catch (error) {
    console.error(`Failed to initialize ${componentName}:`, error);
    throw error;
  }
}