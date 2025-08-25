import app from 'flarum/forum/app';
import { Swiper } from 'swiper';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
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

  /**
   * Initialize the slideshow
   */
  async init(): Promise<void> {
    try {
      this.loadSettings();

      if (!this.settings || this.settings.slides.length === 0) {
        return;
      }

      const activeSlides = this.settings.slides
        .filter(slide => slide.active && slide.image)
        .sort((a, b) => a.order - b.order);

      if (activeSlides.length === 0) {
        return;
      }

      this.createDOM(activeSlides);
      this.initSwiper();
    } catch (error) {
      console.error('SlideShow initialization failed:', error);
    }
  }

  /**
   * Load settings from Flarum
   */
  private loadSettings(): void {
    try {
      // Try JSON format first
      const settingsJson = app.forum.attribute('Client1HeaderAdvSettings');
      if (settingsJson) {
        this.settings = JSON.parse(settingsJson);
        return;
      }

      // Fallback to legacy format
      this.loadLegacySettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.loadLegacySettings();
    }
  }

  /**
   * Load settings from legacy individual keys
   */
  private loadLegacySettings(): void {
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
      }
    }

    this.settings = {
      slides,
      transitionTime: parseInt(app.forum.attribute('Client1HeaderAdvTransitionTime')) || 5000,
      socialLinks: []
    };
  }

  /**
   * Create DOM structure for slideshow
   */
  private createDOM(slides: SlideData[]): void {
    const existingContainer = document.getElementById('client1-header-slideshow');
    if (existingContainer) {
      existingContainer.remove();
    }

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

    // Insert after header
    const header = document.querySelector('.Header-primary') || document.querySelector('.Header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(container, header.nextSibling);
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

    this.swiper = new Swiper(container, {
      modules: [Navigation, Pagination, Autoplay, EffectCoverflow],

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

      // Responsive breakpoints
      breakpoints: {
        768: {
          slidesPerView: 'auto',
          spaceBetween: 20,
        },
      },
    });
  }

  /**
   * Destroy the slideshow
   */
  destroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }

    const container = document.getElementById('client1-header-slideshow');
    if (container) {
      container.remove();
    }
  }

  /**
   * Update slideshow with new settings
   */
  update(): void {
    this.destroy();
    this.init();
  }
}