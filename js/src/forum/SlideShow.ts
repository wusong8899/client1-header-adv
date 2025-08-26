import { getActiveSlides, getTransitionTime } from './utils/SettingsManager';
import { getSlideShowConfig, findContainer, initializeSwiper, destroySwiper, validateAndPrepareSlides, cloneSlides } from './utils/SwiperConfig';
import type { SlideData } from '../common/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export class SlideShow {
  private swiper: any = null;
  private isInitialized: boolean = false;

  async init(): Promise<void> {
    try {
      if (this.isInitialized && this.swiper && document.getElementById('client1-header-slideshow')) {
        return;
      }

      const activeSlides = getActiveSlides();
      
      if (activeSlides.length === 0) {
        return;
      }

      this.cleanupExistingWrappers();

      this.createDOM(activeSlides);
      await this.initSwiper(activeSlides.length);
    } catch (error) {
      console.error('SlideShow initialization failed:', error);
    }
  }

  private cleanupExistingWrappers(): void {
    try {
      const existingWrappers = document.querySelectorAll('.client1-header-adv-wrapper.swiperAdContainer');
      existingWrappers.forEach(wrapper => {
        wrapper.remove();
      });
      
      const existingSlideshow = document.getElementById('client1-header-slideshow');
      if (existingSlideshow) {
        const parentWrapper = existingSlideshow.closest('.client1-header-adv-wrapper');
        if (parentWrapper) {
          parentWrapper.remove();
        } else {
          existingSlideshow.remove();
        }
      }
      
      const clonedSlides = document.querySelectorAll('.swiper-slide-clone-manual');
      clonedSlides.forEach(slide => {
        slide.remove();
      });
    } catch (error) {
      console.error('Error cleaning up existing wrappers:', error);
    }
  }

  private createDOM(slides: SlideData[]): void {
    const existingContainer = document.getElementById('client1-header-slideshow');
    if (existingContainer) {
      existingContainer.remove();
    }

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

    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';

    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';

    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination';

    swiperContainer.appendChild(swiperWrapper);
    swiperContainer.appendChild(prevButton);
    swiperContainer.appendChild(nextButton);
    swiperContainer.appendChild(pagination);

    container.appendChild(swiperContainer);
    wrapper.appendChild(container);

    const insertionPoint = this.findBestInsertionPoint();
    if (insertionPoint.element && insertionPoint.method) {
      insertionPoint.method(wrapper, insertionPoint.element);
    }
  }

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
      
      img.classList.add('swiper-lazy');
      
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
      
      const placeholder = document.createElement('div');
      placeholder.className = 'swiper-lazy-preloader';
      slideContent.appendChild(placeholder);
    }

    slideDiv.appendChild(slideContent);
    return slideDiv;
  }

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
    
    const slides = wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-clone-manual)');
    const isMobile = window.innerWidth < 768;
    const requiredSlides = isMobile ? 2 : 4;
    const validation = validateAndPrepareSlides(slides, requiredSlides);
    
    if (validation.needsCloning && slideCount > 1) {
      cloneSlides(wrapper, slides, requiredSlides);
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
          lazyImageLoad: (swiper: any, slideEl: HTMLElement, imageEl: HTMLImageElement) => {
            imageEl.classList.add('loaded');
          }
        }
      }, 'SlideShow');
    } catch (error) {
      console.error('Failed to initialize SlideShow:', error);
    }
  }

  destroy(): void {
    this.destroySwiper();
    
    this.cleanupExistingWrappers();
  }

  private destroySwiper(): void {
    destroySwiper(this.swiper, '#client1-header-slideshow .swiper');
    this.swiper = null;
    this.isInitialized = false;
  }

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

  update(): void {
    this.destroy();
    this.init();
  }
}