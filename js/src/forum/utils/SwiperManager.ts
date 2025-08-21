import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { SwiperInstance, ExtensionError } from '../../common/types';
import { defaultConfig } from '../../common/config';
import { ErrorHandler } from './ErrorHandler';

/**
 * Enhanced Swiper management utility with proper lifecycle and error handling
 */
export class SwiperManager {
  private swiper: Swiper | null = null;
  private container: HTMLElement | null = null;
  private isInitialized = false;
  private readonly errorHandler: ErrorHandler;

  constructor() {
    this.errorHandler = new ErrorHandler('SwiperManager');
  }

  /**
   * Initialize Swiper instance with enhanced configuration
   */
  public initialize(
    containerSelector: string, 
    options: Partial<any> = {},
    transitionTime: number = defaultConfig.slider.defaultTransitionTime
  ): Promise<SwiperInstance | null> {
    return new Promise((resolve, reject) => {
      try {
        if (this.isInitialized) {
          this.errorHandler.logError('Swiper already initialized, destroying previous instance');
          this.destroy();
        }

        const container = document.querySelector(containerSelector) as HTMLElement;
        if (!container) {
          const error = new Error(`Swiper container not found: ${containerSelector}`) as ExtensionError;
          error.component = 'SwiperManager';
          error.context = { containerSelector };
          throw error;
        }

        this.container = container;

        const swiperConfig = this.buildSwiperConfig(options, transitionTime);
        
        this.swiper = new Swiper(container, swiperConfig);
        this.isInitialized = true;

        // Add event listeners for debugging
        this.addEventListeners();

        resolve(this.createSwiperInstance());
      } catch (error) {
        this.errorHandler.handleError(error as ExtensionError);
        reject(error);
      }
    });
  }

  /**
   * Build Swiper configuration with defaults and overrides
   */
  private buildSwiperConfig(options: Partial<any>, transitionTime: number): any {
    const config = defaultConfig.slider.swiper;
    
    return {
      // Core options
      autoplay: {
        delay: transitionTime,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      loop: true,
      spaceBetween: config.spaceBetween,
      effect: config.effect,
      centeredSlides: config.centeredSlides,
      slidesPerView: config.slidesPerView,
      
      // Coverflow effect
      coverflowEffect: {
        rotate: config.coverflowEffect.rotate,
        depth: config.coverflowEffect.depth,
        modifier: config.coverflowEffect.modifier,
        slideShadows: config.coverflowEffect.slideShadows,
        stretch: config.coverflowEffect.stretch,
      },
      
      // Pagination
      pagination: {
        el: config.pagination.el,
        type: config.pagination.type as any,
        clickable: true,
        dynamicBullets: true,
      },
      
      // Navigation
      navigation: {
        nextEl: config.navigation.nextEl,
        prevEl: config.navigation.prevEl,
      },
      
      // Modules
      modules: [EffectCoverflow, Navigation, Pagination, Autoplay],
      
      // Accessibility
      a11y: {
        enabled: true,
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        firstSlideMessage: 'This is the first slide',
        lastSlideMessage: 'This is the last slide',
      },
      
      // Keyboard control
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      
      // Touch resistance
      resistance: true,
      resistanceRatio: 0.15,
      
      // Performance optimizations
      preloadImages: false,
      lazy: {
        enabled: true,
        loadPrevNext: true,
      },
      
      // Responsive breakpoints
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 'auto',
          spaceBetween: config.spaceBetween,
        },
      },
      
      // Override with custom options
      ...options,
    };
  }

  /**
   * Add event listeners for debugging and monitoring
   */
  private addEventListeners(): void {
    if (!this.swiper) return;

    this.swiper.on('init', () => {
      this.errorHandler.logError('Swiper initialized successfully');
    });

    this.swiper.on('slideChange', () => {
      if (this.swiper) {
        this.errorHandler.logError(`Slide changed to: ${this.swiper.activeIndex}`);
      }
    });

    this.swiper.on('autoplayStop', () => {
      this.errorHandler.logError('Autoplay stopped');
    });

    this.swiper.on('autoplayStart', () => {
      this.errorHandler.logError('Autoplay started');
    });

    this.swiper.on('error', (error: any) => {
      this.errorHandler.handleError({
        name: 'SwiperError',
        message: 'Swiper internal error',
        component: 'SwiperManager',
        context: { error }
      } as ExtensionError);
    });
  }

  /**
   * Create a safe Swiper instance wrapper
   */
  private createSwiperInstance(): SwiperInstance {
    return {
      destroy: (deleteInstance = true, cleanStyles = true) => {
        try {
          if (this.swiper) {
            this.swiper.destroy(deleteInstance, cleanStyles);
            this.swiper = null;
            this.isInitialized = false;
          }
        } catch (error) {
          this.errorHandler.handleError(error as ExtensionError);
        }
      },
      
      update: () => {
        try {
          if (this.swiper) {
            this.swiper.update();
          }
        } catch (error) {
          this.errorHandler.handleError(error as ExtensionError);
        }
      },
      
      slideTo: (index: number, speed?: number, runCallbacks = true) => {
        try {
          if (this.swiper) {
            this.swiper.slideTo(index, speed, runCallbacks);
          }
        } catch (error) {
          this.errorHandler.handleError(error as ExtensionError);
        }
      },
      
      slideNext: (speed?: number, runCallbacks = true) => {
        try {
          if (this.swiper) {
            this.swiper.slideNext(speed, runCallbacks);
          }
        } catch (error) {
          this.errorHandler.handleError(error as ExtensionError);
        }
      },
      
      slidePrev: (speed?: number, runCallbacks = true) => {
        try {
          if (this.swiper) {
            this.swiper.slidePrev(speed, runCallbacks);
          }
        } catch (error) {
          this.errorHandler.handleError(error as ExtensionError);
        }
      },
    };
  }

  /**
   * Destroy Swiper instance and clean up
   */
  public destroy(): void {
    try {
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }
      
      if (this.container) {
        // Clean up any remaining elements
        this.container = null;
      }
      
      this.isInitialized = false;
    } catch (error) {
      this.errorHandler.handleError(error as ExtensionError);
    }
  }

  /**
   * Check if Swiper is initialized
   */
  public get initialized(): boolean {
    return this.isInitialized && this.swiper !== null;
  }

  /**
   * Get current slide index (safe)
   */
  public getCurrentSlide(): number {
    try {
      return this.swiper?.activeIndex ?? 0;
    } catch (error) {
      this.errorHandler.handleError(error as ExtensionError);
      return 0;
    }
  }

  /**
   * Get total number of slides (safe)
   */
  public getSlideCount(): number {
    try {
      return this.swiper?.slides?.length ?? 0;
    } catch (error) {
      this.errorHandler.handleError(error as ExtensionError);
      return 0;
    }
  }

  /**
   * Resume autoplay if paused
   */
  public resumeAutoplay(): void {
    try {
      if (this.swiper?.autoplay) {
        this.swiper.autoplay.start();
      }
    } catch (error) {
      this.errorHandler.handleError(error as ExtensionError);
    }
  }

  /**
   * Pause autoplay
   */
  public pauseAutoplay(): void {
    try {
      if (this.swiper?.autoplay) {
        this.swiper.autoplay.stop();
      }
    } catch (error) {
      this.errorHandler.handleError(error as ExtensionError);
    }
  }
}