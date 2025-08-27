import type { SwiperOptions } from 'swiper/types';
import app from 'flarum/forum/app';
export function getSlideShowConfig(slideCount: number, transitionTime: number): SwiperOptions {
    const isMobile = window.innerWidth < 768;
    const requiredSlides = isMobile ? 2 : 4;
    const enableLoop = slideCount >= requiredSlides;

  return {
    slidesPerView: 2,
    spaceBetween: 30,
    centeredSlides: true,

    effect: 'coverflow',
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    autoplay: {
      delay: transitionTime,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
      stopOnLastSlide: false,
      waitForTransition: true
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      dynamicBullets: true
    },

    loop: enableLoop,
    loopAddBlankSlides: enableLoop,
    centerInsufficientSlides: !enableLoop,

    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    threshold: 5,
    preventClicks: true,
    preventClicksPropagation: true,
    
    touchStartPreventDefault: false,
    passiveListeners: true,

    preloadImages: false,
    lazy: {
      enabled: true,
      loadPrevNext: true,
      loadPrevNextAmount: 2,
      checkInView: true
    },

    ...getSpaSettings(),
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 30
      },
      480: {
        slidesPerView: 2,
        spaceBetween: 30  
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 2,
        spaceBetween: 30,
      }
    },
  };
}

export function getTagSwiperConfig(): SwiperOptions {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;

  return {
    slidesPerView: isMobile ? 'auto' : isTablet ? 2.1 : 'auto',
    spaceBetween: isMobile ? 15 : 20,
    centeredSlides: false,
    slideToClickedSlide: true,

    effect: isMobile ? 'slide' : 'coverflow',
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },

    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: !isMobile,
      stopOnLastSlide: false,
      waitForTransition: true
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      dynamicBullets: true,
    },

    loop: false,

    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    threshold: 5,

    touchStartPreventDefault: false,
    passiveListeners: true,

    preloadImages: false,
    updateOnImagesReady: true,

    ...getSpaSettings(),
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

    a11y: {
      enabled: true,
      prevSlideMessage: app.translator.trans('core.lib.previous'),
      nextSlideMessage: app.translator.trans('core.lib.next'),
    }
  };
}
function getSpaSettings(): Partial<SwiperOptions> {
  return {
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
  };
}

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

export function findContainer(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
  }
  return null;
}

export function destroySwiper(swiper: any, containerSelector?: string): void {
  if (swiper && typeof swiper.destroy === 'function') {
    try {
      swiper.destroy(true, true);
      
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

function addTouchClickDifferentiation(config: SwiperOptions): SwiperOptions {
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 10;
  
  return {
    ...config,
    on: {
      ...config.on,
      touchStart: function(swiper: any, event: TouchEvent) {
        if (config.on?.touchStart) {
          config.on.touchStart(swiper, event);
        }
        
        if (event.touches && event.touches.length > 0) {
          touchStartX = event.touches[0].clientX;
          touchStartY = event.touches[0].clientY;
        }
        
        if (config.autoplay && !swiper.autoplay.running) {
          swiper.autoplay.start();
        }
      },
      touchEnd: function(swiper: any, event: TouchEvent) {
        if (config.on?.touchEnd) {
          config.on.touchEnd(swiper, event);
        }
        
        if (event.changedTouches && event.changedTouches.length > 0) {
          const deltaX = Math.abs(event.changedTouches[0].clientX - touchStartX);
          const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartY);
          
          if (deltaX < SWIPE_THRESHOLD && deltaY < SWIPE_THRESHOLD) {
            console.log('Touch detected as click/tap');
          } else {
            console.log('Touch detected as swipe');
          }
        }
      }
    }
  };
}

export async function initializeSwiper(
  container: HTMLElement,
  config: SwiperOptions,
  componentName: string
): Promise<any> {
  const { default: Swiper } = await import('swiper/bundle');
  
  if (!Swiper) {
    throw new Error(`${componentName}: Swiper class not found`);
  }

  try {
    const enhancedConfig = addTouchClickDifferentiation({
      ...config,
      on: {
        ...config.on,
        ...getEventCallbacks(componentName),
        slideChange: function(swiper: any) {
          if (config.on?.slideChange) {
            config.on.slideChange(swiper);
          }
        }
      }
    });

    const swiper = new Swiper(container, enhancedConfig);

    (container as any).swiperInstance = swiper;
    
    return swiper;
  } catch (error) {
    console.error(`Failed to initialize ${componentName}:`, error);
    throw error;
  }
}