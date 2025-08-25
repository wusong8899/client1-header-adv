import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import { Swiper } from 'swiper';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
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
  private containerRef: HTMLElement | null = null;
  private tags: any[] = [];

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
        <div className="swiper tag-swiper" oncreate={(vnodeDiv: Mithril.VnodeDOM) => {
          this.containerRef = vnodeDiv.dom as HTMLElement;
        }}>
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
   * Initialize Swiper after DOM creation
   */
  oncreate(vnode: Mithril.VnodeDOM) {
    super.oncreate(vnode);
    this.initSwiper();
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
   * Clean up Swiper instance
   */
  onremove(vnode: Mithril.VnodeDOM) {
    super.onremove(vnode);
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.containerRef = null;
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
   * Initialize Swiper with responsive configuration
   */
  private initSwiper(): void {
    if (!this.containerRef) {
      console.error('TagSwiper: Container ref not found');
      return;
    }

    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
      console.error('TagSwiper: Swiper class not found - check if swiper is loaded');
      return;
    }

    const config = this.getSwiperConfig();
    
    try {
      console.log('TagSwiper: Initializing Swiper with config:', config);
      this.swiper = new Swiper(this.containerRef, config);
      console.log('TagSwiper: Swiper initialized successfully:', this.swiper);
    } catch (error) {
      console.error('Failed to initialize TagSwiper:', error);
    }
  }

  /**
   * Get Swiper configuration with responsive settings
   */
  private getSwiperConfig(): SwiperOptions {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    return {
      modules: [Navigation, Pagination, Autoplay, EffectCoverflow],
      
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

      // Autoplay - disabled on mobile to save battery
      autoplay: isMobile ? false : {
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
      
      // Responsive breakpoints
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
          effect: 'slide',
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