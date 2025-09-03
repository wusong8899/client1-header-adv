import Component, { ComponentAttrs } from 'flarum/common/Component';
import { getActiveSlides, getTransitionTime } from '../utils/SettingsManager';
import { getSlideShowGlideConfig, findContainer, initializeGlide, destroyGlide, carouselManager } from '../utils/GlideConfig';
import type Mithril from 'mithril';
import type { Vnode, VnodeDOM } from 'mithril';
import type { SlideData, GlideInstance } from '../../common/types';

interface GlideShowComponentAttrs extends ComponentAttrs {
  slides: SlideData[];
}

/**
 * GlideShowComponent - Mithril component for header slideshow
 * Replaces the imperative DOM manipulation in GlideShow.ts
 */
export default class GlideShowComponent extends Component<GlideShowComponentAttrs> {
  private glideInstance: GlideInstance | null = null;
  private isInitialized: boolean = false;
  private instanceId: string = '';
  private isDestroying: boolean = false;
  private slides: SlideData[] = [];

  oninit(vnode: Vnode<GlideShowComponentAttrs>) {
    super.oninit(vnode);
    this.instanceId = `slideshow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.slides = getActiveSlides();
  }

  view(vnode: Vnode<GlideShowComponentAttrs>): Mithril.Children {
    const slides = vnode.attrs.slides;
    
    if (!slides || slides.length === 0) {
      return null;
    }

    return (
      <div className="client1-header-adv-wrapper glideAdContainer">
        <div id="client1-header-slideshow" className="client1-slideshow-container">
          <div className="glide">
            <div className="glide__track" data-glide-el="track">
              <ul className="glide__slides">
                {slides.map((slide) => this.renderSlide(slide))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  oncreate(vnode: VnodeDOM<GlideShowComponentAttrs>) {
    super.oncreate(vnode);
    
    // Initialize Glide after DOM is created
    requestAnimationFrame(() => {
      this.initGlide();
    });
  }

  onupdate(vnode: VnodeDOM<GlideShowComponentAttrs>) {
    super.onupdate(vnode);
    
    const newSlides = getActiveSlides();
    if (this.shouldUpdateGlide(vnode.attrs.slides, newSlides)) {
      this.slides = newSlides;
      if (this.glideInstance) {
        this.glideInstance.update();
      }
    }
  }

  onbeforeremove(vnode: VnodeDOM<GlideShowComponentAttrs>) {
    super.onbeforeremove(vnode);
    this.isDestroying = true;
    this.destroyGlide();
  }
  
  onremove(vnode: VnodeDOM<GlideShowComponentAttrs>) {
    super.onremove(vnode);
    if (!this.isDestroying) {
      this.destroyGlide();
    }
  }

  private renderSlide(slide: SlideData): Mithril.Children {
    if (!slide.image) {
      return null;
    }

    const slideContent = slide.link ? (
      <a 
        href={slide.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="slide-link"
        aria-label={`Navigate to slide ${slide.order} link`}
      >
        <img 
          src={slide.image} 
          alt={`Slide ${slide.order}`}
          className="slide-image"
        />
      </a>
    ) : (
      <img 
        src={slide.image} 
        alt={`Slide ${slide.order}`}
        className="slide-image"
      />
    );

    return (
      <li 
        key={slide.id}
        className="glide__slide" 
        data-slide-id={slide.id}
      >
        {slideContent}
      </li>
    );
  }

  private async initGlide(): Promise<void> {
    if (this.isInitialized) {
      console.log('GlideShowComponent: Already initialized, skipping');
      return;
    }

    const container = findContainer([
      '#client1-header-slideshow .glide',
      '.client1-slideshow-container .glide',
      '.header-slideshow .glide'
    ]);

    if (!container) {
      console.error('GlideShowComponent: Glide container not found');
      return;
    }

    const track = container.querySelector('.glide__track') as HTMLElement;
    if (!track) {
      console.error('GlideShowComponent: Glide track not found');
      return;
    }

    const transitionTime = getTransitionTime();
    const config = getSlideShowGlideConfig(this.slides.length, transitionTime);
    console.log('🎢 SlideShow Final Configuration:', JSON.stringify(config, null, 2));

    try {
      this.glideInstance = await initializeGlide(container, config, 'GlideShowComponent');

      if (this.glideInstance) {
        carouselManager.register(this.instanceId, this.glideInstance, config);

        this.glideInstance.on('mount.after', () => {
          this.isInitialized = true;
          console.log(`GlideShowComponent initialized (${this.slides.length} slides, type: ${config.type})`);
        });

        this.glideInstance.on('destroy', () => {
          this.isInitialized = false;
          carouselManager.unregister(this.instanceId);
          console.log('GlideShowComponent destroyed');
        });

        this.glideInstance.on('move.start', () => {
          carouselManager.pauseOthers(this.instanceId);
        });
      }
    } catch (error) {
      console.error('Failed to initialize GlideShowComponent:', error);
    }
  }

  private destroyGlide(): void {
    if (!this.glideInstance || this.isDestroying) {
      return;
    }
    
    this.isDestroying = true;
    
    try {
      if (this.glideInstance && typeof this.glideInstance.destroy === 'function') {
        destroyGlide(this.glideInstance, '#client1-header-slideshow .glide');
      }
      
      carouselManager.unregister(this.instanceId);
      
    } catch (error) {
      console.error('Error destroying GlideShowComponent:', error);
    } finally {
      this.glideInstance = null;
      this.isInitialized = false;
    }
  }

  private shouldUpdateGlide(oldSlides: SlideData[], newSlides: SlideData[]): boolean {
    if (!oldSlides || !newSlides) return true;
    if (oldSlides.length !== newSlides.length) return true;
    
    return oldSlides.some((oldSlide: SlideData, index: number) => {
      const newSlide = newSlides[index];
      return oldSlide?.id !== newSlide?.id || 
            oldSlide?.active !== newSlide?.active ||
            oldSlide?.image !== newSlide?.image ||
            oldSlide?.link !== newSlide?.link;
    });
  }

  /**
   * Static method to check if slideshow should be displayed
   */
  static shouldDisplay(): boolean {
    const slides = getActiveSlides();
    return slides && slides.length > 0;
  }
}