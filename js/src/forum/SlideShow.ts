import app from 'flarum/forum/app';
import Swiper from 'swiper/bundle';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

/**
 * Simplified slide data structure
 */
interface SlideData {
  id: string;
  image: string;
  link: string;
  active: boolean;
  order: number;
}

/**
 * Extension settings structure
 */
interface ExtensionSettings {
  slides: SlideData[];
  transitionTime: number;
  socialLinks: any[];
}

/**
 * Simplified SlideShow Component
 * Handles core slideshow functionality with Swiper.js
 */
export class SlideShow {
  private swiper: Swiper | null = null;
  private settings: ExtensionSettings | null = null;
  private extensionId = 'wusong8899-client1-header-adv';
  private isInitialized: boolean = false;

  /**
   * Initialize the slideshow
   */
  async init(): Promise<void> {
    try {
      console.log('SlideShow: Starting initialization...');
      
      // Prevent duplicate initialization
      if (this.isInitialized && this.swiper) {
        console.log('SlideShow: Already initialized, skipping');
        return;
      }

      this.loadSettings();

      if (!this.settings) {
        console.warn('SlideShow: No settings found');
        return;
      }

      console.log('SlideShow: Loaded settings:', this.settings);

      if (this.settings.slides.length === 0) {
        console.warn('SlideShow: No slides configured');
        return;
      }

      const activeSlides = this.settings.slides
        .filter(slide => slide.active && slide.image)
        .sort((a, b) => a.order - b.order);

      console.log('SlideShow: Active slides:', activeSlides.length, 'out of', this.settings.slides.length);

      if (activeSlides.length === 0) {
        console.warn('SlideShow: No active slides with images');
        return;
      }

      console.log('SlideShow: Creating DOM structure...');
      this.createDOM(activeSlides);
      
      console.log('SlideShow: Initializing Swiper...');
      this.initSwiper();
      
      console.log('SlideShow: Initialization completed successfully');
    } catch (error) {
      console.error('SlideShow initialization failed:', error);
    }
  }

  /**
   * Load settings from Flarum
   */
  private loadSettings(): void {
    try {
      console.log('SlideShow: Loading settings...');
      
      // Try JSON format first
      const settingsJson = app.forum.attribute('Client1HeaderAdvSettings');
      console.log('SlideShow: JSON settings attribute:', settingsJson ? 'found' : 'not found');
      
      if (settingsJson) {
        this.settings = JSON.parse(settingsJson);
        console.log('SlideShow: Loaded JSON settings successfully');
        return;
      }

      // Fallback to legacy format
      console.log('SlideShow: Falling back to legacy settings');
      this.loadLegacySettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      console.log('SlideShow: Falling back to legacy settings due to error');
      this.loadLegacySettings();
    }
  }

  /**
   * Load settings from legacy individual keys
   */
  private loadLegacySettings(): void {
    console.log('SlideShow: Loading legacy settings...');
    const slides: SlideData[] = [];

    // Load up to 30 slides from legacy format
    for (let i = 1; i <= 30; i++) {
      const link = app.forum.attribute(`Client1HeaderAdvLink${i}`) || '';
      const image = app.forum.attribute(`Client1HeaderAdvImage${i}`) || '';

      if (image || link) {
        slides.push({
          id: `legacy-${i}`,
          image,
          link,
          active: true,
          order: i
        });
        console.log(`SlideShow: Found legacy slide ${i}:`, { image, link });
      }
    }

    const transitionTime = parseInt(app.forum.attribute('Client1HeaderAdvTransitionTime')) || 5000;
    console.log('SlideShow: Legacy transition time:', transitionTime);

    this.settings = {
      slides,
      transitionTime,
      socialLinks: []
    };

    console.log('SlideShow: Loaded legacy settings:', slides.length, 'slides found');
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
      console.log('SlideShow: Inserted slideshow at', insertionPoint.location);
    } else {
      console.warn('SlideShow: No suitable insertion point found');
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
   * Initialize Swiper with simplified configuration
   */
  private initSwiper(): void {
    const container = document.querySelector('#client1-header-slideshow .swiper') as HTMLElement;
    if (!container) {
      return;
    }

    try {
      this.swiper = new Swiper(container, {
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
          delay: this.settings?.transitionTime || 5000,
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
        loop: true,

        // SPA-critical settings for Flarum
        observer: true,
        observeParents: true,
        watchSlidesProgress: true,

        // Responsive breakpoints
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

        // Event callbacks
        on: {
          init: () => {
            this.isInitialized = true;
            console.log('SlideShow initialized');
          },
          destroy: () => {
            this.isInitialized = false;
            console.log('SlideShow destroyed');
          }
        },
      });
      
      // Store reference for cleanup
      (container as any).swiperInstance = this.swiper;
      
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
   * Safely destroy Swiper instance
   */
  private destroySwiper(): void {
    if (this.swiper && typeof this.swiper.destroy === 'function') {
      try {
        this.swiper.destroy(true, true);
        this.swiper = null;
        this.isInitialized = false;
      } catch (error) {
        console.error('Error destroying SlideShow:', error);
      }
    }
  }

  /**
   * Find the best insertion point for the slideshow on tags page
   */
  private findBestInsertionPoint(): {
    element: HTMLElement | null;
    method: ((wrapper: HTMLElement, target: HTMLElement) => void) | null;
    location: string;
  } {
    // Strategy 1: Insert before TagTiles container (best for tags page)
    const tagTilesContainer = document.querySelector('.TagTiles') as HTMLElement;
    if (tagTilesContainer) {
      return {
        element: tagTilesContainer,
        method: (wrapper, target) => target.parentNode?.insertBefore(wrapper, target),
        location: 'before TagTiles'
      };
    }

    // Strategy 2: Insert inside container div before other content
    const containerDiv = document.querySelector('.container > div:first-child') as HTMLElement;
    if (containerDiv && containerDiv.children.length > 0) {
      return {
        element: containerDiv,
        method: (wrapper, target) => target.insertBefore(wrapper, target.firstChild),
        location: 'inside container div'
      };
    }

    // Strategy 3: Insert after page header
    const pageHeader = document.querySelector('.Hero, .IndexPage-hero') as HTMLElement;
    if (pageHeader) {
      return {
        element: pageHeader,
        method: (wrapper, target) => target.parentNode?.insertBefore(wrapper, target.nextSibling),
        location: 'after page hero'
      };
    }

    // Strategy 4: Insert in main content area
    const mainContent = document.querySelector('.App-content, .IndexPage') as HTMLElement;
    if (mainContent) {
      return {
        element: mainContent,
        method: (wrapper, target) => target.insertBefore(wrapper, target.firstChild),
        location: 'inside main content'
      };
    }

    // Strategy 5: Fallback to after global header
    const header = document.querySelector('.Header-primary, .Header') as HTMLElement;
    if (header && header.parentNode) {
      return {
        element: header,
        method: (wrapper, target) => target.parentNode?.insertBefore(wrapper, target.nextSibling),
        location: 'after global header'
      };
    }

    return { element: null, method: null, location: 'none found' };
  }

  /**
   * Find slideshow container with multiple strategies
   */
  private findSlideshowContainer(): HTMLElement | null {
    // Strategy 1: Direct query with specific selector
    let container = document.querySelector('#client1-header-slideshow .swiper') as HTMLElement;
    if (container) {
      return container;
    }

    // Strategy 2: Broader query as fallback
    container = document.querySelector('.header-slideshow .swiper') as HTMLElement;
    if (container) {
      return container;
    }

    // Strategy 3: Global query for any swiper in header
    container = document.querySelector('header .swiper, .Header .swiper') as HTMLElement;
    if (container) {
      return container;
    }

    return null;
  }

  /**
   * Update slideshow with new settings
   */
  update(): void {
    this.destroy();
    this.init();
  }
}