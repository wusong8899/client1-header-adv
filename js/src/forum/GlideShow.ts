import { getActiveSlides, getTransitionTime } from './utils/SettingsManager';
import { getSlideShowGlideConfig, findContainer, initializeGlide, destroyGlide, carouselManager } from './utils/GlideConfig';
import type { SlideData } from '../common/types';
import type { GlideInstance } from '../common/types';

export class GlideShow {
  private glideInstance: GlideInstance | null = null;
  private isInitialized: boolean = false;
  private instanceId: string;

  constructor() {
    this.instanceId = `slideshow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async init(): Promise<void> {
    try {
      if (this.isInitialized && this.glideInstance && document.getElementById('client1-header-slideshow')) {
        return;
      }

      const activeSlides = getActiveSlides();
      
      if (activeSlides.length === 0) {
        return;
      }

      this.cleanupExistingWrappers();
      this.createDOM(activeSlides);
      await this.initGlide(activeSlides.length);
    } catch (error) {
      console.error('GlideShow initialization failed:', error);
    }
  }

  private cleanupExistingWrappers(): void {
    try {
      const existingWrappers = document.querySelectorAll('.client1-header-adv-wrapper.glideAdContainer');
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
    wrapper.className = 'client1-header-adv-wrapper glideAdContainer';

    const container = document.createElement('div');
    container.id = 'client1-header-slideshow';
    container.className = 'client1-slideshow-container';

    const glideContainer = document.createElement('div');
    glideContainer.className = 'glide';

    const glideTrack = document.createElement('div');
    glideTrack.className = 'glide__track';
    glideTrack.setAttribute('data-glide-el', 'track');

    const glideSlides = document.createElement('ul');
    glideSlides.className = 'glide__slides';

    slides.forEach((slide) => {
      const slideElement = this.createSlideElement(slide);
      glideSlides.appendChild(slideElement);
    });

    // Arrows will be created automatically by Glide.js with default configuration

    const bullets = document.createElement('div');
    bullets.className = 'glide__bullets';
    bullets.setAttribute('data-glide-el', 'controls[nav]');

    for (let i = 0; i < slides.length; i++) {
      const bullet = document.createElement('button');
      bullet.className = 'glide__bullet';
      bullet.setAttribute('data-glide-dir', `=${i}`);
      bullets.appendChild(bullet);
    }

    glideTrack.appendChild(glideSlides);
    glideContainer.appendChild(glideTrack);
    glideContainer.appendChild(bullets);

    container.appendChild(glideContainer);
    wrapper.appendChild(container);

    const insertionPoint = this.findBestInsertionPoint();
    if (insertionPoint.element && insertionPoint.method) {
      insertionPoint.method(wrapper, insertionPoint.element);
    }
  }

  private createSlideElement(slide: SlideData): HTMLElement {
    const slideItem = document.createElement('li');
    slideItem.className = 'glide__slide';
    slideItem.setAttribute('data-slide-id', slide.id);

    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';

    if (slide.image) {
      const img = document.createElement('img');
      img.src = slide.image;
      img.alt = `Slide ${slide.order}`;
      img.loading = 'lazy';
      
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
    }

    slideItem.appendChild(slideContent);
    return slideItem;
  }

  private async initGlide(slideCount: number): Promise<void> {
    const container = findContainer([
      '#client1-header-slideshow .glide',
      '.client1-slideshow-container .glide',
      '.header-slideshow .glide'
    ]);

    if (!container) {
      console.error('GlideShow: Glide container not found');
      return;
    }

    const track = container.querySelector('.glide__track') as HTMLElement;
    if (!track) {
      console.error('GlideShow: Glide track not found');
      return;
    }

    const transitionTime = getTransitionTime();
    const config = getSlideShowGlideConfig(slideCount, transitionTime);

    try {
      this.glideInstance = await initializeGlide(container, config, 'GlideShow');
      
      if (this.glideInstance) {
        carouselManager.register(this.instanceId, this.glideInstance, config);

        this.glideInstance.on('mount.after', () => {
          this.isInitialized = true;
          console.log(`GlideShow initialized (${slideCount} slides, type: ${config.type})`);
        });

        this.glideInstance.on('destroy', () => {
          this.isInitialized = false;
          carouselManager.unregister(this.instanceId);
          console.log('GlideShow destroyed');
        });

        this.glideInstance.on('move.start', () => {
          carouselManager.pauseOthers(this.instanceId);
        });
      }
    } catch (error) {
      console.error('Failed to initialize GlideShow:', error);
    }
  }

  destroy(): void {
    this.destroyGlide();
    this.cleanupExistingWrappers();
  }

  private destroyGlide(): void {
    if (this.glideInstance) {
      destroyGlide(this.glideInstance, '#client1-header-slideshow .glide');
      carouselManager.unregister(this.instanceId);
      this.glideInstance = null;
      this.isInitialized = false;
    }
  }

  private findBestInsertionPoint(): {
    element: HTMLElement | null;
    method: ((wrapper: HTMLElement, target: HTMLElement) => void) | null;
    location: string;
  } {
    const strategies = [
      {
        selector: '#tag-glide-container, .tag-glide-container',
        method: (wrapper: HTMLElement, target: HTMLElement) => target.parentNode?.insertBefore(wrapper, target),
        location: 'before TagGlide container'
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