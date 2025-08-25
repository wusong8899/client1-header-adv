import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Swiper from 'swiper/bundle';
import classList from 'flarum/common/utils/classList';
import humanTime from 'flarum/common/helpers/humanTime';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import type Mithril from 'mithril';
import type { SwiperOptions } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

/**
 * Tag slide data structure
 */
interface TagSlideData {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  url: string;
  lastPostedDiscussion?: {
    title: string;
    url: string;
    postedAt: Date;
  };
}

/**
 * TagSwiper - A Mithril component that renders tag tiles as a Swiper carousel
 * 
 * This component replaces the original TagTiles with a modern carousel interface
 * while preserving all original functionality and data.
 */
export default class TagSwiper extends Component {
  private swiper: Swiper | null = null;
  private tags: any[] = [];
  private isInitialized: boolean = false;

  /**
   * Initialize component
   */
  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.tags = vnode.attrs.tags || [];
  }

  /**
   * Render the component
   */
  view(vnode: Mithril.Vnode): Mithril.Children {
    const tags = vnode.attrs.tags || [];
    
    if (!tags.length) {
      return null;
    }

    return (
      <div id="tag-slider-container" className="tag-slider-container TagSwiper-container">
        <div className="swiper tag-swiper">
          <div className="swiper-wrapper">
            {tags.map((tag: any) => this.renderSlide(tag))}
          </div>
          
          {/* Navigation */}
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
          
          {/* Pagination */}
          <div className="swiper-pagination"></div>
        </div>
      </div>
    );
  }

  /**
   * Initialize Swiper after DOM creation with delay to ensure DOM is ready
   */
  oncreate(vnode: Mithril.VnodeDOM) {
    super.oncreate(vnode);
    
    // Use requestAnimationFrame to ensure DOM is fully ready
    requestAnimationFrame(() => {
      this.initSwiper();
    });
  }

  /**
   * Update Swiper when tags change
   */
  onupdate(vnode: Mithril.VnodeDOM) {
    super.onupdate(vnode);
    
    const newTags = vnode.attrs.tags || [];
    if (this.shouldUpdateSwiper(this.tags, newTags)) {
      this.tags = newTags;
      if (this.swiper) {
        this.swiper.update();
      }
    }
  }

  /**
   * Clean up Swiper instance before removal
   */
  onbeforeremove(vnode: Mithril.VnodeDOM) {
    super.onbeforeremove(vnode);
    this.destroySwiper();
  }
  
  /**
   * Final cleanup on removal
   */
  onremove(vnode: Mithril.VnodeDOM) {
    super.onremove(vnode);
    this.destroySwiper();
  }

  /**
   * Extract tag data for slide rendering
   */
  private extractTagData(tag: any): TagSlideData {
    const lastPostedDiscussion = tag.lastPostedDiscussion?.();
    
    return {
      id: tag.id?.() || '',
      name: tag.name?.() || '',
      description: tag.description?.() || undefined,
      icon: tag.icon?.() || undefined,
      color: tag.color?.() || undefined,
      url: app.route.tag(tag),
      lastPostedDiscussion: lastPostedDiscussion ? {
        title: lastPostedDiscussion.title?.() || '',
        url: app.route.discussion(
          lastPostedDiscussion, 
          lastPostedDiscussion.lastPostNumber?.() || 1
        ),
        postedAt: lastPostedDiscussion.lastPostedAt?.() || new Date()
      } : undefined
    };
  }

  /**
   * Render individual slide
   */
  private renderSlide(tag: any): Mithril.Children {
    const tagData = this.extractTagData(tag);
    
    return (
      <div 
        key={tagData.id}
        className={classList('swiper-slide', 'tag-slide', {
          'colored': tagData.color
        })}
        style={{ 
          '--tag-bg': tagData.color || 'var(--body-bg)',
          '--contrast-color': tagData.color ? 'var(--body-bg)' : 'var(--body-color)'
        }}
      >
        <a href={tagData.url} className="tag-slide-link">
          <div className="tag-slide-content">
            {/* Header section with icon and title */}
            <div className="tag-header">
              {tagData.icon && (
                <div className="tag-icon">
                  {tagIcon(tag, {}, { useColor: false })}
                </div>
              )}
              <h3 className="tag-title">{tagData.name}</h3>
            </div>
            
            {/* Description */}
            {tagData.description && (
              <p className="tag-description">{tagData.description}</p>
            )}
            
            {/* Spacer to push last post info to bottom */}
            <div className="tag-spacer"></div>
            
            {/* Last posted discussion */}
            {tagData.lastPostedDiscussion && (
              <div className="tag-last-post">
                <div className="last-post-title">
                  {tagData.lastPostedDiscussion.title}
                </div>
                <time>
                  {humanTime(tagData.lastPostedDiscussion.postedAt)}
                </time>
              </div>
            )}
          </div>
        </a>
      </div>
    );
  }

  /**
   * Initialize Swiper with improved container finding
   */
  private initSwiper(): void {
    if (this.isInitialized) {
      console.log('TagSwiper: Already initialized, skipping');
      return;
    }

    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
      console.error('TagSwiper: Swiper class not found - check if swiper is loaded');
      return;
    }

    // Find container with multiple strategies
    const container = this.findContainer();
    if (!container) {
      console.error('TagSwiper: Container not found');
      return;
    }

    const config = this.getSwiperConfig();
    
    try {
      console.log('TagSwiper: Initializing Swiper with config:', config);
      this.swiper = new Swiper(container, config);
      
      // Store reference for cleanup
      (container as any).swiperInstance = this.swiper;
      this.isInitialized = true;
      
      console.log('TagSwiper: Swiper initialized successfully:', this.swiper);
    } catch (error) {
      console.error('Failed to initialize TagSwiper:', error);
    }
  }

  /**
   * Find Swiper container with multiple strategies
   */
  private findContainer(): HTMLElement | null {
    // Strategy 1: Use jQuery selector if available
    if (this.$) {
      const jqueryContainer = this.$('.swiper.tag-swiper')[0];
      if (jqueryContainer) {
        return jqueryContainer as HTMLElement;
      }
    }

    // Strategy 2: Direct DOM query
    const directContainer = this.element?.querySelector('.swiper.tag-swiper');
    if (directContainer) {
      return directContainer as HTMLElement;
    }

    // Strategy 3: Global query as fallback
    const globalContainer = document.querySelector('.swiper.tag-swiper');
    if (globalContainer) {
      return globalContainer as HTMLElement;
    }

    return null;
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
        console.error('Error destroying TagSwiper:', error);
      }
    }
  }

  /**
   * Get Swiper configuration with SPA-critical settings
   */
  private getSwiperConfig(): SwiperOptions {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    return {
      // Basic configuration
      slidesPerView: isMobile ? 1 : isTablet ? 2 : 'auto',
      spaceBetween: 20,
      centeredSlides: !isMobile,
      
      // Effect - use slide on mobile for better performance
      effect: isMobile ? 'slide' : 'coverflow',
      coverflowEffect: {
        rotate: 30,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },

      // Autoplay - enabled on all devices
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
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
        dynamicBullets: true,
      },

      // Loop - disabled to avoid tag duplication
      loop: false,
      
      // SPA-critical settings for Flarum
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
      
      // Responsive breakpoints
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
          effect: 'slide',
        },
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
          effect: 'coverflow',
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 20,
          effect: 'coverflow',
        },
        1440: {
          slidesPerView: 'auto',
          spaceBetween: 25,
          effect: 'coverflow',
        }
      },

      // Event callbacks
      on: {
        init: () => {
          this.isInitialized = true;
          console.log('TagSwiper initialized');
        },
        destroy: () => {
          this.isInitialized = false;
          console.log('TagSwiper destroyed');
        }
      },

      // Accessibility
      a11y: {
        enabled: true,
        prevSlideMessage: app.translator.trans('core.lib.previous'),
        nextSlideMessage: app.translator.trans('core.lib.next'),
      }
    };
  }

  /**
   * Check if Swiper needs to be updated
   */
  private shouldUpdateSwiper(oldTags: any[], newTags: any[]): boolean {
    if (!oldTags || !newTags) return true;
    if (oldTags.length !== newTags.length) return true;
    
    return oldTags.some((oldTag: any, index: number) => {
      const newTag = newTags[index];
      return oldTag?.id?.() !== newTag?.id?.() || 
             oldTag?.freshness !== newTag?.freshness;
    });
  }
}