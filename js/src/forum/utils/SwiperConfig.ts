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
    const isMobile = window.innerWidth < 768;
    // Enhanced loop validation - require at least slidesPerView * 2 for Swiper 9+
    const requiredSlides = isMobile ? 2 : 4; // 1.2 * 2 on mobile, 2 * 2 on desktop
    const enableLoop = slideCount >= requiredSlides;

  return {
    // Basic configuration with decimal slidesPerView for preview effect
    slidesPerView: isMobile ? 1.1 : 1,
    spaceBetween: isMobile ? 15 : 30,
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

    // Enhanced autoplay with iOS compatibility
    autoplay: {
      delay: transitionTime,
      disableOnInteraction: false, // Critical for mobile
      pauseOnMouseEnter: false,    // Disabled for touch devices
      stopOnLastSlide: false,
      waitForTransition: true
    },

    // Navigation
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Enhanced pagination
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      dynamicBullets: true
    },

    // Loop with better validation
    loop: enableLoop,
    loopAddBlankSlides: enableLoop,
    centerInsufficientSlides: !enableLoop,

    // Mobile touch optimization
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    threshold: 5,
    preventClicks: true,
    preventClicksPropagation: true,
    
    // iOS-specific fixes
    touchStartPreventDefault: false,
    passiveListeners: true,

    // Performance optimizations
    preloadImages: false,
    lazy: {
      enabled: true,
      loadPrevNext: true,
      loadPrevNextAmount: 2,
      checkInView: true
    },

    // SPA-critical settings
    ...getSpaSettings(),

    // Enhanced responsive breakpoints
    breakpoints: {
      320: {
        slidesPerView: 1.1,
        spaceBetween: 10
      },
      480: {
        slidesPerView: 1.2,
        spaceBetween: 15  
      },
      640: {
        slidesPerView: 1.3,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2.1,
        spaceBetween: 25,
      },
      1024: {
        slidesPerView: 2.5,
        spaceBetween: 30,
      }
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
    // Enhanced basic configuration with decimal slidesPerView
    slidesPerView: isMobile ? 'auto' : isTablet ? 2.1 : 'auto',
    spaceBetween: isMobile ? 15 : 20,
    centeredSlides: false,
    slideToClickedSlide: true,

    // Effect - slide on mobile for better performance
    effect: isMobile ? 'slide' : 'coverflow',
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },

    // Enhanced autoplay with iOS compatibility
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: !isMobile, // Only on desktop
      stopOnLastSlide: false,
      waitForTransition: true
    },

    // Navigation
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Enhanced pagination
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      dynamicBullets: true,
    },

    // No loop for tags to avoid duplication
    loop: false,

    // Mobile touch optimization
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    threshold: 5,

    // iOS-specific fixes
    touchStartPreventDefault: false,
    passiveListeners: true,

    // Performance optimizations
    preloadImages: false,
    updateOnImagesReady: true,

    // SPA-critical settings
    ...getSpaSettings(),

    // Enhanced responsive breakpoints with decimal values
    breakpoints: {
      320: {
        slidesPerView: 1.1,
        spaceBetween: 10,
        effect: 'slide',
        centeredSlides: false,
      },
      480: {
        slidesPerView: 1.3,
        spaceBetween: 15,
        effect: 'slide',
      },
      640: {
        slidesPerView: 1.8,
        spaceBetween: 20,
        centeredSlides: false,
      },
      768: {
        slidesPerView: 2.1,
        spaceBetween: 15,
        effect: 'coverflow',
      },
      1024: {
        slidesPerView: 2.8,
        spaceBetween: 20,
        effect: 'coverflow',
      },
      1440: {
        slidesPerView: 3.5,
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
 * Validate and prepare slides for loop mode
 * Ensures we have enough slides for proper loop functionality in Swiper 9+
 */
export function validateAndPrepareSlides(
  slides: NodeListOf<Element> | Element[], 
  requiredSlides: number
): { shouldUseLoop: boolean; needsCloning: boolean } {
  const slideCount = slides.length;
  const shouldUseLoop = slideCount >= requiredSlides;
  const needsCloning = !shouldUseLoop && slideCount > 1;
  
  return {
    shouldUseLoop,
    needsCloning
  };
}

/**
 * Clone slides to meet minimum loop requirements
 * This function clones existing slides to ensure smooth loop operation
 */
export function cloneSlides(
  wrapper: HTMLElement, 
  slides: NodeListOf<Element> | Element[], 
  requiredSlides: number
): void {
  const slideArray = Array.from(slides);
  const originalCount = slideArray.length;
  
  if (originalCount === 0) return;
  
  let clonesNeeded = Math.max(requiredSlides - originalCount, originalCount);
  let cloneIndex = 0;
  
  for (let i = 0; i < clonesNeeded; i++) {
    const originalSlide = slideArray[cloneIndex % originalCount];
    const clone = originalSlide.cloneNode(true) as HTMLElement;
    
    // Add clone identifier for debugging
    clone.classList.add('swiper-slide-clone-manual');
    clone.setAttribute('data-cloned-from', cloneIndex.toString());
    
    wrapper.appendChild(clone);
    cloneIndex++;
  }
  
  console.log(`Cloned ${clonesNeeded} slides for loop compatibility (${originalCount} -> ${originalCount + clonesNeeded})`);
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
 * Add touch/click differentiation logic
 */
function addTouchClickDifferentiation(config: SwiperOptions): SwiperOptions {
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 10;
  
  return {
    ...config,
    on: {
      ...config.on,
      touchStart: function(swiper: any, event: TouchEvent) {
        // Handle original touchStart if exists
        if (config.on?.touchStart) {
          config.on.touchStart(swiper, event);
        }
        
        // Store initial touch position
        if (event.touches && event.touches.length > 0) {
          touchStartX = event.touches[0].clientX;
          touchStartY = event.touches[0].clientY;
        }
        
        // iOS autoplay restart fix
        if (config.autoplay && !swiper.autoplay.running) {
          swiper.autoplay.start();
        }
      },
      touchEnd: function(swiper: any, event: TouchEvent) {
        // Handle original touchEnd if exists
        if (config.on?.touchEnd) {
          config.on.touchEnd(swiper, event);
        }
        
        // Differentiate between click and swipe
        if (event.changedTouches && event.changedTouches.length > 0) {
          const deltaX = Math.abs(event.changedTouches[0].clientX - touchStartX);
          const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartY);
          
          if (deltaX < SWIPE_THRESHOLD && deltaY < SWIPE_THRESHOLD) {
            // This was a click/tap - allow default link behavior
            console.log('Touch detected as click/tap');
          } else {
            // This was a swipe - prevent click events
            console.log('Touch detected as swipe');
          }
        }
      }
    }
  };
}

/**
 * Utility: Initialize Swiper with error handling and iOS fixes
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
    // Add touch/click differentiation
    const enhancedConfig = addTouchClickDifferentiation({
      ...config,
      on: {
        ...config.on,
        ...getEventCallbacks(componentName),
        // Enhanced slide change handling
        slideChange: function(swiper: any) {
          // Handle original slideChange if exists
          if (config.on?.slideChange) {
            config.on.slideChange(swiper);
          }
        }
      }
    });

    const swiper = new Swiper(container, enhancedConfig);

    // Store reference for cleanup
    (container as any).swiperInstance = swiper;
    
    return swiper;
  } catch (error) {
    console.error(`Failed to initialize ${componentName}:`, error);
    throw error;
  }
}