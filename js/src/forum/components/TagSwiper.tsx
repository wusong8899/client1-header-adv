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

export default class TagSwiper extends Component {
  private swiper: Swiper | null = null;
  private tags: any[] = [];
  private isInitialized: boolean = false;

  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.tags = vnode.attrs.tags || [];
  }

  view(vnode: Mithril.Vnode): Mithril.Children {
    const tags = vnode.attrs.tags || [];
    
    if (!tags.length) {
      return null;
    }

    const socialLinks = getActiveSocialLinks();

    return (
      <div className="TagSwiper-wrapper">
        <div id="tag-slider-container" className="tag-slider-container TagSwiper-container">
          <div className="swiper tag-swiper">
            <div className="swiper-wrapper">
              {tags.map((tag: any) => this.renderSlide(tag))}
            </div>
            
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
            
            <div className="swiper-pagination"></div>
          </div>
        </div>
        
        {socialLinks.length > 0 && (
          <SocialMediaButtons socialLinks={socialLinks} />
        )}
      </div>
    );
  }

  oncreate(vnode: Mithril.VnodeDOM) {
    super.oncreate(vnode);
    
    requestAnimationFrame(() => {
      this.initSwiper();
    });
  }

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

  onbeforeremove(vnode: Mithril.VnodeDOM) {
    super.onbeforeremove(vnode);
    this.destroySwiper();
  }
  
  onremove(vnode: Mithril.VnodeDOM) {
    super.onremove(vnode);
    this.destroySwiper();
  }

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
            <div className="tag-header">
              {tagData.icon && (
                <div className="tag-icon">
                  {tagIcon(tag, {}, { useColor: false })}
                </div>
              )}
              <h3 className="tag-title">{tagData.name}</h3>
            </div>
            
            {tagData.description && (
              <p className="tag-description">{tagData.description}</p>
            )}
            
            <div className="tag-spacer"></div>
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

  private async initSwiper(): Promise<void> {
    if (this.isInitialized) {
      console.log('TagSwiper: Already initialized, skipping');
      return;
    }

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


  private destroySwiper(): void {
    destroySwiper(this.swiper, '.swiper.tag-swiper');
    this.swiper = null;
    this.isInitialized = false;
  }

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