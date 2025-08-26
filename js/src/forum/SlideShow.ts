import { getActiveSlides, getTransitionTime } from './utils/SettingsManager';
import { getSlideShowConfig, findContainer, initializeSwiper, destroySwiper } from './utils/SwiperConfig';
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
      // Prevent duplicate initialization
      if (this.isInitialized && this.swiper) {
        return;
      }

      const activeSlides = getActiveSlides();
      
      if (activeSlides.length === 0) {
        return;
      }

      this.createDOM(activeSlides);
      await this.initSwiper(activeSlides.length);
    } catch (error) {
      console.error('SlideShow initialization failed:', error);
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
   * Create individual slide element
   */
  private createSlideElement(slide: SlideData): HTMLElement {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'swiper-slide';

    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';

    if (slide.image) {
      const img = document.createElement('img');
      img.src = slide.image;
      img.alt = `Slide ${slide.order}`;
      img.loading = 'lazy';

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
    }

    slideDiv.appendChild(slideContent);
    return slideDiv;
  }

  /**
   * Initialize Swiper using shared configuration
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

    const transitionTime = getTransitionTime();
    const config = getSlideShowConfig(slideCount, transitionTime);

    try {
      this.swiper = await initializeSwiper(container, {
        ...config,
        on: {
          ...config.on,
          init: () => {
            this.isInitialized = true;
            console.log('SlideShow Swiper initialized');
          },
          destroy: () => {
            this.isInitialized = false;
            console.log('SlideShow Swiper destroyed');
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

    const container = document.getElementById('client1-header-slideshow');
    if (container) {
      container.remove();
    }
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