import { Swiper } from 'swiper';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

/**
 * TagSlider Component
 * Converts Flarum Tag tiles into a Swiper slideshow
 */
export class TagSlider {
  private swiper: Swiper | null = null;
  private originalTagsContainer: HTMLElement | null = null;
  private swiperContainer: HTMLElement | null = null;

  /**
   * Transform tag tiles into slideshow
   */
  async transform(): Promise<void> {
    try {
      const tagTiles = document.querySelectorAll('.TagTile');
      if (tagTiles.length === 0) {
        return;
      }

      this.originalTagsContainer = document.querySelector('.TagTiles') as HTMLElement;
      if (!this.originalTagsContainer) {
        return;
      }

      this.createSwiperContainer();
      this.createSlides(tagTiles);
      this.initSwiper();
      this.hideOriginalTags();
    } catch (error) {
      console.error('TagSlider transformation failed:', error);
    }
  }

  /**
   * Create Swiper container
   */
  private createSwiperContainer(): void {
    if (this.swiperContainer) {
      this.swiperContainer.remove();
    }

    this.swiperContainer = document.createElement('div');
    this.swiperContainer.id = 'tag-slider-container';
    this.swiperContainer.className = 'tag-slider-container';

    const swiperElement = document.createElement('div');
    swiperElement.className = 'swiper tag-swiper';

    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';

    // Navigation buttons
    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';

    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';

    // Pagination
    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination';

    swiperElement.appendChild(swiperWrapper);
    swiperElement.appendChild(prevButton);
    swiperElement.appendChild(nextButton);
    swiperElement.appendChild(pagination);

    this.swiperContainer.appendChild(swiperElement);

    // Insert before original tags container
    if (this.originalTagsContainer && this.originalTagsContainer.parentNode) {
      this.originalTagsContainer.parentNode.insertBefore(
        this.swiperContainer,
        this.originalTagsContainer
      );
    }
  }

  /**
   * Create slides from tag tiles
   */
  private createSlides(tagTiles: NodeListOf<Element>): void {
    const swiperWrapper = this.swiperContainer?.querySelector('.swiper-wrapper');
    if (!swiperWrapper) {
      return;
    }

    tagTiles.forEach((tagTile) => {
      const slide = this.createSlideFromTag(tagTile);
      if (slide) {
        swiperWrapper.appendChild(slide);
      }
    });
  }

  /**
   * Create a slide from a tag tile
   */
  private createSlideFromTag(tagTile: Element): HTMLElement | null {
    try {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide tag-slide';

      const slideContent = document.createElement('div');
      slideContent.className = 'tag-slide-content';

      // Clone the tag tile content
      const clonedTag = tagTile.cloneNode(true) as HTMLElement;
      clonedTag.className = 'TagTile-slide';

      // Extract tag information
      const tagName = this.extractTagName(tagTile);
      const tagUrl = this.extractTagUrl(tagTile);
      const tagColor = this.extractTagColor(tagTile);
      const tagIcon = this.extractTagIcon(tagTile);
      const tagDescription = this.extractTagDescription(tagTile);

      // Create enhanced slide content
      const tagCard = document.createElement('div');
      tagCard.className = 'tag-card';

      if (tagColor) {
        tagCard.style.borderLeftColor = tagColor;
      }

      // Tag header
      const tagHeader = document.createElement('div');
      tagHeader.className = 'tag-header';

      if (tagIcon) {
        const iconElement = document.createElement('div');
        iconElement.className = 'tag-icon';
        iconElement.innerHTML = tagIcon;
        tagHeader.appendChild(iconElement);
      }

      const titleElement = document.createElement('h3');
      titleElement.className = 'tag-title';
      titleElement.textContent = tagName;
      tagHeader.appendChild(titleElement);

      tagCard.appendChild(tagHeader);

      // Tag description
      if (tagDescription) {
        const descElement = document.createElement('p');
        descElement.className = 'tag-description';
        descElement.textContent = tagDescription;
        tagCard.appendChild(descElement);
      }

      // Make it clickable
      if (tagUrl) {
        const linkWrapper = document.createElement('a');
        linkWrapper.href = tagUrl;
        linkWrapper.className = 'tag-slide-link';
        linkWrapper.appendChild(tagCard);
        slideContent.appendChild(linkWrapper);
      } else {
        slideContent.appendChild(tagCard);
      }

      slide.appendChild(slideContent);
      return slide;
    } catch (error) {
      console.error('Failed to create slide from tag:', error);
      return null;
    }
  }

  /**
   * Extract tag name from tag tile
   */
  private extractTagName(tagTile: Element): string {
    const nameElement = tagTile.querySelector('.TagTile-name') ||
      tagTile.querySelector('[title]');
    return nameElement?.textContent?.trim() ||
      nameElement?.getAttribute('title')?.trim() ||
      'Unknown Tag';
  }

  /**
   * Extract tag URL from tag tile
   */
  private extractTagUrl(tagTile: Element): string | null {
    const linkElement = tagTile.querySelector('a');
    return linkElement?.href || null;
  }

  /**
   * Extract tag color from tag tile
   */
  private extractTagColor(tagTile: Element): string | null {
    const colorElement = tagTile.querySelector('[style*="background"]') ||
      tagTile.querySelector('[style*="border"]');

    if (colorElement) {
      const style = (colorElement as HTMLElement).style;
      return style.backgroundColor || style.borderColor || null;
    }

    // Try to find color from CSS classes
    const classList = tagTile.className.split(' ');
    for (const className of classList) {
      if (className.includes('color') || className.includes('tag-')) {
        // Could implement color mapping here
      }
    }

    return null;
  }

  /**
   * Extract tag icon from tag tile
   */
  private extractTagIcon(tagTile: Element): string | null {
    const iconElement = tagTile.querySelector('.TagTile-icon') ||
      tagTile.querySelector('i[class*="fa"]') ||
      tagTile.querySelector('[class*="icon"]');

    if (iconElement) {
      return iconElement.outerHTML;
    }

    return null;
  }

  /**
   * Extract tag description from tag tile
   */
  private extractTagDescription(tagTile: Element): string | null {
    const descElement = tagTile.querySelector('.TagTile-description') ||
      tagTile.querySelector('[title]');

    return descElement?.textContent?.trim() ||
      descElement?.getAttribute('title')?.trim() ||
      null;
  }

  /**
   * Initialize Swiper
   */
  private initSwiper(): void {
    const swiperElement = this.swiperContainer?.querySelector('.swiper') as HTMLElement;
    if (!swiperElement) {
      return;
    }

    this.swiper = new Swiper(swiperElement, {
      modules: [Navigation, Pagination, Autoplay, EffectCoverflow],

      // Configuration for tag slider
      slidesPerView: 1,
      spaceBetween: 20,
      centeredSlides: true,

      // Effect
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 30,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: true,
      },

      // Autoplay
      autoplay: {
        delay: 4000,
        disableOnInteraction: true,
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
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
    });
  }

  /**
   * Hide original tags container
   */
  private hideOriginalTags(): void {
    if (this.originalTagsContainer) {
      this.originalTagsContainer.style.display = 'none';
    }
  }

  /**
   * Show original tags container
   */
  private showOriginalTags(): void {
    if (this.originalTagsContainer) {
      this.originalTagsContainer.style.display = '';
    }
  }

  /**
   * Check if tag transformation should be applied
   */
  isTagsPage(): boolean {
    return window.location.pathname.includes('/tags') ||
      window.location.hash.includes('#/tags') ||
      document.querySelector('.TagTiles') !== null;
  }

  /**
   * Cleanup - restore original tags and destroy swiper
   */
  cleanup(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }

    if (this.swiperContainer) {
      this.swiperContainer.remove();
      this.swiperContainer = null;
    }

    this.showOriginalTags();
  }

  /**
   * Update - recreate the slider with current tags
   */
  update(): void {
    this.cleanup();
    this.transform();
  }
}