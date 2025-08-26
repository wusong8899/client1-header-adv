import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import classList from 'flarum/common/utils/classList';
import humanTime from 'flarum/common/helpers/humanTime';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import { getActiveSocialLinks } from '../utils/SettingsManager';
import { getTagSwiperConfig, findContainer, initializeSwiper, destroySwiper } from '../utils/SwiperConfig';
import SocialMediaButtons from './SocialMediaButtons';
import type Mithril from 'mithril';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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
   * Render the component with integrated social buttons
   */
  view(vnode: Mithril.Vnode): Mithril.Children {
    const tags = vnode.attrs.tags || [];
    
    if (!tags.length) {
      return null;
    }

    // Get social links for integration
    const socialLinks = getActiveSocialLinks();

    return (
      <div className="TagSwiper-wrapper">
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
        
        {/* Integrated social media buttons */}
        {socialLinks.length > 0 && (
          <SocialMediaButtons socialLinks={socialLinks} />
        )}
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
   * Initialize Swiper using shared configuration
   */
  private async initSwiper(): Promise<void> {
    if (this.isInitialized) {
      console.log('TagSwiper: Already initialized, skipping');
      return;
    }

    // Find container using shared utility
    const container = findContainer([
      '.swiper.tag-swiper',
      '#tag-slider-container .swiper',
      '.TagSwiper-container .swiper'
    ]);

    if (!container) {
      console.error('TagSwiper: Container not found');
      return;
    }

    const config = getTagSwiperConfig();
    
    try {
      this.swiper = await initializeSwiper(container, {
        ...config,
        on: {
          ...config.on,
          init: () => {
            this.isInitialized = true;
            console.log('TagSwiper Swiper initialized');
          },
          destroy: () => {
            this.isInitialized = false;
            console.log('TagSwiper Swiper destroyed');
          }
        }
      }, 'TagSwiper');
    } catch (error) {
      console.error('Failed to initialize TagSwiper:', error);
    }
  }


  /**
   * Safely destroy Swiper instance using shared utility
   */
  private destroySwiper(): void {
    destroySwiper(this.swiper, '.swiper.tag-swiper');
    this.swiper = null;
    this.isInitialized = false;
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