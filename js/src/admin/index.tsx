import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';

/**
 * Extension configuration constants
 */
const EXTENSION_ID = 'wusong8899-client1-header-adv';
const SOCIAL_PLATFORMS = ['Kick', 'Facebook', 'Twitter', 'YouTube', 'Instagram'] as const;
const DEFAULT_MAX_SLIDES = 30;

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
 * Social media link structure
 */
interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

/**
 * Extension settings structure
 */
interface ExtensionSettings {
  slides: SlideData[];
  transitionTime: number;
  socialLinks: SocialLink[];
}

/**
 * Unified Admin Management Component
 * Consolidates slideshow management, social media settings, and global configuration
 */
class UnifiedAdminComponent extends Component {
  private settings: ExtensionSettings = {
    slides: [],
    transitionTime: 5000,
    socialLinks: []
  };

  oninit() {
    this.loadSettings();
  }

  /**
   * Load all settings from Flarum
   */
  loadSettings(): void {
    try {
      const settingsJson = app.data.settings[`${EXTENSION_ID}.settings`];
      if (settingsJson) {
        this.settings = JSON.parse(settingsJson);
      } else {
        // Load from legacy format if JSON doesn't exist
        this.loadLegacySettings();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.loadLegacySettings();
    }
  }

  /**
   * Load settings from legacy individual keys
   */
  loadLegacySettings(): void {
    const slides: SlideData[] = [];
    const socialLinks: SocialLink[] = [];

    // Load slides from legacy format
    for (let i = 1; i <= DEFAULT_MAX_SLIDES; i++) {
      const link = app.data.settings[`${EXTENSION_ID}.Link${i}`] || '';
      const image = app.data.settings[`${EXTENSION_ID}.Image${i}`] || '';
      
      if (link || image) {
        slides.push({
          id: `slide-${i}`,
          image,
          link,
          active: true,
          order: i
        });
      }
    }

    // Load social media links from legacy format
    SOCIAL_PLATFORMS.forEach((platform) => {
      const url = app.data.settings[`${EXTENSION_ID}.Social${platform}Url`] || '';
      const icon = app.data.settings[`${EXTENSION_ID}.Social${platform}Icon`] || '';
      
      socialLinks.push({
        platform,
        url,
        icon
      });
    });

    this.settings = {
      slides,
      transitionTime: parseInt(app.data.settings[`${EXTENSION_ID}.TransitionTime`]) || 5000,
      socialLinks
    };
  }

  /**
   * Save all settings to Flarum
   */
  async saveSettings(): Promise<void> {
    try {
      const settingsJson = JSON.stringify(this.settings);
      
      app.data.settings[`${EXTENSION_ID}.settings`] = settingsJson;
      
      await app.request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/settings`,
        body: { [`${EXTENSION_ID}.settings`]: settingsJson }
      });
      
      app.alerts.show({ type: 'success' }, app.translator.trans('core.admin.saved_message'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      app.alerts.show({ type: 'error' }, 'Failed to save settings');
    }
  }

  /**
   * Add new slide
   */
  addSlide(): void {
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      image: '',
      link: '',
      active: true,
      order: this.settings.slides.length + 1
    };
    
    this.settings.slides.push(newSlide);
    m.redraw();
  }

  /**
   * Delete slide
   */
  deleteSlide(slideId: string): void {
    this.settings.slides = this.settings.slides.filter(slide => slide.id !== slideId);
    // Reorder remaining slides
    this.settings.slides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    m.redraw();
  }

  /**
   * Update slide
   */
  updateSlide(slideId: string, field: keyof SlideData, value: any): void {
    const slide = this.settings.slides.find(s => s.id === slideId);
    if (slide) {
      (slide as any)[field] = value;
      m.redraw();
    }
  }

  /**
   * Update social media link
   */
  updateSocialLink(platform: string, field: 'url' | 'icon', value: string): void {
    const socialLink = this.settings.socialLinks.find(s => s.platform === platform);
    if (socialLink) {
      socialLink[field] = value;
      m.redraw();
    }
  }

  view() {
    return (
      <div className="UnifiedAdminComponent">
        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.GlobalSettings')}</h3>
          
          <label className="FormLabel">
            {app.translator.trans('wusong8899-client1.admin.TransitionTime')}
          </label>
          <input
            className="FormControl"
            type="number"
            min="1000"
            max="30000"
            value={this.settings.transitionTime}
            oninput={(e: Event) => {
              this.settings.transitionTime = parseInt((e.target as HTMLInputElement).value);
            }}
          />
        </div>

        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.SlidesManagement')}</h3>
          
          {this.settings.slides.map((slide) => this.renderSlide(slide))}
          
          <button className="Button Button--primary" onclick={() => this.addSlide()}>
            {app.translator.trans('wusong8899-client1.admin.AddSlide')}
          </button>
        </div>

        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.SocialMediaTitle')}</h3>
          
          {SOCIAL_PLATFORMS.map((platform) => this.renderSocialPlatform(platform))}
        </div>

        <div className="Form-group">
          <button className="Button Button--primary" onclick={() => this.saveSettings()}>
            {app.translator.trans('core.admin.save_changes')}
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render slide configuration
   */
  renderSlide(slide: SlideData) {
    return (
      <div className="SlideConfig" key={slide.id}>
        <div className="SlideConfig-header">
          <h4>Slide {slide.order}</h4>
          <input
            type="checkbox"
            checked={slide.active}
            onchange={(e: Event) => {
              this.updateSlide(slide.id, 'active', (e.target as HTMLInputElement).checked);
            }}
          />
          <button 
            className="Button Button--danger" 
            onclick={() => this.deleteSlide(slide.id)}
          >
            {app.translator.trans('core.admin.delete')}
          </button>
        </div>
        
        <div className="Form-group">
          <label className="FormLabel">Image URL</label>
          <input
            className="FormControl"
            type="url"
            value={slide.image}
            oninput={(e: Event) => {
              this.updateSlide(slide.id, 'image', (e.target as HTMLInputElement).value);
            }}
          />
        </div>
        
        <div className="Form-group">
          <label className="FormLabel">Link URL</label>
          <input
            className="FormControl"
            type="url"
            value={slide.link}
            oninput={(e: Event) => {
              this.updateSlide(slide.id, 'link', (e.target as HTMLInputElement).value);
            }}
          />
        </div>
      </div>
    );
  }

  /**
   * Render social platform configuration
   */
  renderSocialPlatform(platform: string) {
    const socialLink = this.settings.socialLinks.find(s => s.platform === platform) || 
                      { platform, url: '', icon: '' };

    return (
      <div className="SocialPlatformConfig" key={platform}>
        <h4>{platform}</h4>
        
        <div className="Form-group">
          <label className="FormLabel">URL</label>
          <input
            className="FormControl"
            type="url"
            placeholder={`https://${platform.toLowerCase()}.com/yourprofile`}
            value={socialLink.url}
            oninput={(e: Event) => {
              this.updateSocialLink(platform, 'url', (e.target as HTMLInputElement).value);
            }}
          />
        </div>
        
        <div className="Form-group">
          <label className="FormLabel">Icon URL</label>
          <input
            className="FormControl"
            type="url"
            placeholder="https://example.com/icon.png"
            value={socialLink.icon}
            oninput={(e: Event) => {
              this.updateSocialLink(platform, 'icon', (e.target as HTMLInputElement).value);
            }}
          />
          
          {socialLink.icon && (
            <div className="IconPreview">
              <img src={socialLink.icon} alt={`${platform} icon`} style="max-width: 32px; max-height: 32px;" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

/**
 * Initialize the unified admin interface
 */
app.initializers.add(EXTENSION_ID, (): void => {
  const extensionData = app.extensionData.for(EXTENSION_ID);

  // Register the unified admin component
  extensionData.registerSetting(() => m(UnifiedAdminComponent));
});