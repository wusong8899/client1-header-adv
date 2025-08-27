import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import classList from 'flarum/common/utils/classList';
import humanTime from 'flarum/common/helpers/humanTime';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import { getActiveSocialLinks } from '../utils/SettingsManager';
import { getTagGlideConfig, findContainer, initializeGlide, destroyGlide, carouselManager } from '../utils/GlideConfig';
import SocialMediaButtons from './SocialMediaButtons';
import type Mithril from 'mithril';
import type { GlideInstance } from '../../common/types';

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

export default class TagGlide extends Component {
  private glideInstance: GlideInstance | null = null;
  private tags: any[] = [];
  private isInitialized: boolean = false;
  private instanceId: string;

  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.tags = vnode.attrs.tags || [];
    this.instanceId = `tag-glide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  view(vnode: Mithril.Vnode): Mithril.Children {
    const tags = vnode.attrs.tags || [];
    
    if (!tags.length) {
      return null;
    }

    const socialLinks = getActiveSocialLinks();

    return (
      <div className="TagGlide-wrapper">
        <div id="tag-glide-container" className="tag-glide-container TagGlide-container">
          <div className="glide tag-glide">
            <div className="glide__track" data-glide-el="track">
              <ul className="glide__slides">
                {tags.map((tag: any) => this.renderSlide(tag))}
              </ul>
            </div>
            
            <div className="glide__arrows" data-glide-el="controls">
              <button className="glide__arrow glide__arrow--left" data-glide-dir="<">
                ‹
              </button>
              <button className="glide__arrow glide__arrow--right" data-glide-dir=">">
                ›
              </button>
            </div>
            
            <div className="glide__bullets" data-glide-el="controls[nav]">
              {tags.map((_: any, index: number) => (
                <button className="glide__bullet" data-glide-dir={`=${index}`}></button>
              ))}
            </div>
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
      this.initGlide();
    });
  }

  onupdate(vnode: Mithril.VnodeDOM) {
    super.onupdate(vnode);
    
    const newTags = vnode.attrs.tags || [];
    if (this.shouldUpdateGlide(this.tags, newTags)) {
      this.tags = newTags;
      if (this.glideInstance) {
        this.glideInstance.update();
      }
    }
  }

  onbeforeremove(vnode: Mithril.VnodeDOM) {
    super.onbeforeremove(vnode);
    this.destroyGlide();
  }
  
  onremove(vnode: Mithril.VnodeDOM) {
    super.onremove(vnode);
    this.destroyGlide();
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
      <li 
        key={tagData.id}
        className={classList('glide__slide', 'tag-slide', {
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
      </li>
    );
  }

  private async initGlide(): Promise<void> {
    if (this.isInitialized) {
      console.log('TagGlide: Already initialized, skipping');
      return;
    }

    const container = findContainer([
      '.glide.tag-glide',
      '#tag-glide-container .glide',
      '.TagGlide-container .glide'
    ]);

    if (!container) {
      console.error('TagGlide: Container not found');
      return;
    }

    const config = getTagGlideConfig();
    
    try {
      this.glideInstance = await initializeGlide(container, config, 'TagGlide');
      
      if (this.glideInstance) {
        carouselManager.register(this.instanceId, this.glideInstance, config);

        this.glideInstance.on('mount.after', () => {
          this.isInitialized = true;
          console.log('TagGlide initialized');
        });

        this.glideInstance.on('destroy', () => {
          this.isInitialized = false;
          carouselManager.unregister(this.instanceId);
          console.log('TagGlide destroyed');
        });

        this.glideInstance.on('move.start', () => {
          carouselManager.pauseOthers(this.instanceId);
        });
      }
    } catch (error) {
      console.error('Failed to initialize TagGlide:', error);
    }
  }

  private destroyGlide(): void {
    if (this.glideInstance) {
      destroyGlide(this.glideInstance, '.glide.tag-glide');
      carouselManager.unregister(this.instanceId);
      this.glideInstance = null;
      this.isInitialized = false;
    }
  }

  private shouldUpdateGlide(oldTags: any[], newTags: any[]): boolean {
    if (!oldTags || !newTags) return true;
    if (oldTags.length !== newTags.length) return true;
    
    return oldTags.some((oldTag: any, index: number) => {
      const newTag = newTags[index];
      return oldTag?.id?.() !== newTag?.id?.() || 
            oldTag?.freshness !== newTag?.freshness;
    });
  }
}