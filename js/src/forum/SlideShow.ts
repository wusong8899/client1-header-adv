import { getActiveSlides, getTransitionTime } from './utils/SettingsManager';
import { getSlideShowConfig, findContainer, initializeSwiper, destroySwiper, validateAndPrepareSlides, cloneSlides } from './utils/SwiperConfig';
import type { SlideData } from '../common/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

/**
 * Simplified SlideShow Component
 * Handles header advertisement slideshow with shared utilities
 */
export class SlideShow {
  private swiper: any = null;
  private isInitialized: boolean = false;

  /**
   * Initialize the slideshow
   */
  async init(): Promise<void> {
    try {
      // Complete check: return if already initialized and DOM exists
      if (this.isInitialized && this.swiper && document.getElementById('client1-header-slideshow')) {
        return;
      }

      const activeSlides = getActiveSlides();
      
      if (activeSlides.length === 0) {
        return;
      }

      // Clean up any existing wrappers to prevent duplicates
      this.cleanupExistingWrappers();

      this.createDOM(activeSlides);
      await this.initSwiper(activeSlides.length);
    } catch (error) {
      console.error('SlideShow initialization failed:', error);
    }
  }


  /**
   * Clean up existing wrapper elements to prevent duplicates
   */
  private cleanupExistingWrappers(): void {
    try {
      // Remove all existing slideshow wrappers
      const existingWrappers = document.querySelectorAll('.client1-header-adv-wrapper.swiperAdContainer');
      existingWrappers.forEach(wrapper => {
        wrapper.remove();
      });
      
      // Also ensure the main slideshow container is removed
      const existingSlideshow = document.getElementById('client1-header-slideshow');
      if (existingSlideshow) {
        // Remove the parent wrapper if it exists
        const parentWrapper = existingSlideshow.closest('.client1-header-adv-wrapper');
        if (parentWrapper) {
          parentWrapper.remove();
        } else {
          existingSlideshow.remove();
        }
      }
      
      // Clean up any manually cloned slides from previous initializations
      const clonedSlides = document.querySelectorAll('.swiper-slide-clone-manual');
      clonedSlides.forEach(slide => {
        slide.remove();
      });
    } catch (error) {
      console.error('Error cleaning up existing wrappers:', error);
    }
  }

  /**
   * Create DOM structure for slideshow
   */
  private createDOM(slides: SlideData[]): void {
    const existingContainer = document.getElementById('client1-header-slideshow');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create main wrapper with proper CSS classes
    const wrapper = document.createElement('div');
    wrapper.className = 'client1-header-adv-wrapper swiperAdContainer';

    const container = document.createElement('div');
    container.id = 'client1-header-slideshow';
    container.className = 'client1-slideshow-container';

    const swiperContainer = document.createElement('div');
    swiperContainer.className = 'swiper';

    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';

    slides.forEach((slide) => {
      const slideElement = this.createSlideElement(slide);
      swiperWrapper.appendChild(slideElement);
    });

    // Add navigation
    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';

    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';

    // Add pagination
    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination';

    swiperContainer.appendChild(swiperWrapper);
    swiperContainer.appendChild(prevButton);
    swiperContainer.appendChild(nextButton);
    swiperContainer.appendChild(pagination);

    container.appendChild(swiperContainer);
    wrapper.appendChild(container);

    // Find the best insertion point for tags page
    const insertionPoint = this.findBestInsertionPoint();
    if (insertionPoint.element && insertionPoint.method) {
      insertionPoint.method(wrapper, insertionPoint.element);
    }
  }

  /**
   * Create individual slide element with enhanced attributes
   */
  private createSlideElement(slide: SlideData): HTMLElement {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'swiper-slide';
    slideDiv.setAttribute('data-slide-id', slide.id);

    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';

    if (slide.image) {
      const img = document.createElement('img');
      img.src = slide.image;
      img.alt = `Slide ${slide.order}`;
      img.loading = 'lazy';
      
      // Add Swiper lazy loading classes
      img.classList.add('swiper-lazy');
      
      // Add loading event listeners
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });

      if (slide.link) {
        const link = document.createElement('a');
        link.href = slide.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.appendChild(img);
        slideContent.appendChild(link);
      } else {
        slideContent.appendChild(img);
      }
      
      // Add lazy loading placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'swiper-lazy-preloader';
      slideContent.appendChild(placeholder);
    }

    slideDiv.appendChild(slideContent);
    return slideDiv;
  }

  /**
   * Initialize Swiper using shared configuration with enhanced slide validation
   */
  private async initSwiper(slideCount: number): Promise<void> {
    const container = findContainer([
      '#client1-header-slideshow .swiper',
      '.client1-slideshow-container .swiper',
      '.header-slideshow .swiper'
    ]);

    if (!container) {
      console.error('SlideShow: Swiper container not found');
      return;
    }

    const wrapper = container.querySelector('.swiper-wrapper') as HTMLElement;
    if (!wrapper) {
      console.error('SlideShow: Swiper wrapper not found');
      return;
    }

    const transitionTime = getTransitionTime();
    const config = getSlideShowConfig(slideCount, transitionTime);
    
    // Validate and prepare slides for loop mode
    const slides = wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-clone-manual)');
    const isMobile = window.innerWidth < 768;
    const requiredSlides = isMobile ? 2 : 4; // Match config calculation
    const validation = validateAndPrepareSlides(slides, requiredSlides);
    
    // Clone slides if needed and loop is desired but we don't have enough slides
    if (validation.needsCloning && slideCount > 1) {
      cloneSlides(wrapper, slides, requiredSlides);
      // Update config to enable loop after cloning
      config.loop = true;
      config.loopAddBlankSlides = true;
    }

    try {
      this.swiper = await initializeSwiper(container, {
        ...config,
        on: {
          ...config.on,
          init: () => {
            this.isInitialized = true;
            console.log(`SlideShow Swiper initialized (${slideCount} slides, loop: ${config.loop})`);
            
            // Force update after initialization to handle cloned slides
            if (validation.needsCloning) {
              setTimeout(() => {
                if (this.swiper && this.swiper.update) {
                  this.swiper.update();
                }
              }, 100);
            }
          },
          destroy: () => {
            this.isInitialized = false;
            console.log('SlideShow Swiper destroyed');
          },
          // Add lazy loading callback
          lazyImageLoad: (swiper: any, slideEl: HTMLElement, imageEl: HTMLImageElement) => {
            imageEl.classList.add('loaded');
          }
        }
      }, 'SlideShow');
    } catch (error) {
      console.error('Failed to initialize SlideShow:', error);
    }
  }

  /**
   * Destroy the slideshow
   */
  destroy(): void {
    this.destroySwiper();
    
    // Use cleanup method to ensure all wrappers are removed
    this.cleanupExistingWrappers();
  }

  /**
   * Safely destroy Swiper instance using shared utility
   */
  private destroySwiper(): void {
    destroySwiper(this.swiper, '#client1-header-slideshow .swiper');
    this.swiper = null;
    this.isInitialized = false;
  }

  /**
   * Find the best insertion point for the slideshow on tags page
   */
  private findBestInsertionPoint(): {
    element: HTMLElement | null;
    method: ((wrapper: HTMLElement, target: HTMLElement) => void) | null;
    location: string;
  } {
    const strategies = [
      {
        selector: '#tag-slider-container, .tag-slider-container',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.parentNode?.insertBefore(wrapper, target),
        location: 'before TagSwiper container'
      },
      {
        selector: '.TagTiles',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.parentNode?.insertBefore(wrapper, target),
        location: 'before TagTiles'
      },
      {
        selector: '.container > div:first-child',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.insertBefore(wrapper, target.firstChild),
        location: 'inside container div',
        condition: (element: HTMLElement) => element.children.length > 0
      },
      {
        selector: '.Hero, .IndexPage-hero',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.parentNode?.insertBefore(wrapper, target.nextSibling),
        location: 'after page hero'
      },
      {
        selector: '.App-content, .IndexPage',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.insertBefore(wrapper, target.firstChild),
        location: 'inside main content'
      },
      {
        selector: '.Header-primary, .Header',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.parentNode?.insertBefore(wrapper, target.nextSibling),
        location: 'after global header',
        condition: (element: HTMLElement) => !!element.parentNode
      }
    ];

    for (const strategy of strategies) {
      const element = document.querySelector(strategy.selector) as HTMLElement;
      if (element && (!strategy.condition || strategy.condition(element))) {
        return {
          element,
          method: strategy.method,
          location: strategy.location
        };
      }
    }

    return { element: null, method: null, location: 'none found' };
  }

  /**
   * Update slideshow with new settings
   */
  update(): void {
    this.destroy();
    this.init();
  }
}