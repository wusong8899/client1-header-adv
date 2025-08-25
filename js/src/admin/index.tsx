import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';

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
class UnifiedAdminComponent extends ExtensionPage {
  private settings: ExtensionSettings = {
    slides: [],
    transitionTime: 5000,
    socialLinks: []
  };

  oninit(vnode) {
    super.oninit(vnode);
    
    this.loadSettings();
    // Add default data if no slides exist (for testing)
    if (this.settings.slides.length === 0) {
      this.addDefaultSlides();
    }
  }

  /**
   * Add some default slides for testing purposes
   */
  addDefaultSlides(): void {
    console.log('Adding default test slides...');
    
    this.settings.slides = [
      {
        id: 'slide-default-1',
        image: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Advertisement+1',
        link: 'https://example.com/ad1',
        active: true,
        order: 1
      },
      {
        id: 'slide-default-2', 
        image: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Advertisement+2',
        link: 'https://example.com/ad2',
        active: true,
        order: 2
      }
    ];
    
    this.saveSettings();
    console.log('Default slides added:', this.settings.slides);
  }

  /**
   * Load all settings from Flarum
   */
  loadSettings(): void {
    try {
      console.log('Admin: Loading settings...');
      const settingsJson = app.data.settings[`${EXTENSION_ID}.settings`];
      console.log('Admin: JSON settings found:', settingsJson ? 'yes' : 'no');
      
      if (settingsJson) {
        this.settings = JSON.parse(settingsJson);
        console.log('Admin: Loaded JSON settings:', this.settings);
      } else {
        console.log('Admin: Falling back to legacy settings');
        // Load from legacy format if JSON doesn't exist
        this.loadLegacySettings();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      console.log('Admin: Falling back to legacy settings due to error');
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
   * Save all settings using ExtensionPage's built-in method
   */
  saveSettings(): void {
    const settingsJson = JSON.stringify(this.settings);
    console.log('Admin: Saving settings using ExtensionPage method:', settingsJson);
    
    // Use ExtensionPage's setting method for proper save handling
    this.setting(`${EXTENSION_ID}.settings`)(settingsJson);
    this.setting(`${EXTENSION_ID}.TransitionTime`)(this.settings.transitionTime.toString());
    
    console.log('Admin: Settings updated via ExtensionPage.setting()');
    
    // Force redraw to update UI
    m.redraw();
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
    this.saveSettings();
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
    this.saveSettings();
  }

  /**
   * Update slide
   */
  updateSlide(slideId: string, field: keyof SlideData, value: any): void {
    const slide = this.settings.slides.find(s => s.id === slideId);
    if (slide) {
      (slide as any)[field] = value;
      this.saveSettings();
    }
  }

  /**
   * Update social media link
   */
  updateSocialLink(platform: string, field: 'url' | 'icon', value: string): void {
    let socialLink = this.settings.socialLinks.find(s => s.platform === platform);
    if (!socialLink) {
      socialLink = { platform, url: '', icon: '' };
      this.settings.socialLinks.push(socialLink);
    }
    socialLink[field] = value;
    this.saveSettings();
  }

  content() {
    return (
      <div className="ExtensionPage-settings">
        <div className="container">
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
              this.saveSettings();
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
        
        {/* Submit button handled by ExtensionPage */}
        <div className="Form-group">
          {this.submitButton()}
        </div>
        </div>
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
            {app.translator.trans('wusong8899-client1.admin.DeleteButton')}
          </button>
        </div>
        
        <div className="Form-group">
          <label className="FormLabel">{app.translator.trans('wusong8899-client1.admin.SlideImageLabel')}</label>
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
          <label className="FormLabel">{app.translator.trans('wusong8899-client1.admin.SlideLinkLabel')}</label>
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

  // Register the main JSON settings
  extensionData.registerSetting({
    setting: `${EXTENSION_ID}.settings`,
    type: 'text',
    label: '',
    hidden: true, // This will be handled by our custom component
  });

  // Register legacy transition time setting for backward compatibility
  extensionData.registerSetting({
    setting: `${EXTENSION_ID}.TransitionTime`,
    type: 'number',
    label: '',
    hidden: true, // This will be handled by our custom component
  });

  // Register the custom page instead of just a setting component
  extensionData.registerPage(UnifiedAdminComponent);
});