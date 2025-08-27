import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Stream from 'flarum/common/utils/Stream';
import type { SlideData, ExtensionSettings } from '../common/types';

/**
 * Extension configuration constants
 */
const EXTENSION_ID = 'wusong8899-client1-header-adv';
const SOCIAL_PLATFORMS = ['Kick', 'Facebook', 'Twitter', 'YouTube', 'Instagram'] as const;
const _DEFAULT_MAX_SLIDES = 30;

/**
 * Unified Admin Management Component
 * Consolidates slideshow management, social media settings, and global configuration
 */
class UnifiedAdminComponent extends ExtensionPage {
  // Stream instances for reactive form handling
  transitionTimeStream: Stream<number>;
  tagGlideTitleStream: Stream<string>;
  headerIconUrlStream: Stream<string>;
  headerIconLinkStream: Stream<string>;
  
  oninit(vnode) {
    super.oninit(vnode);
    
    // Initialize settings using ExtensionPage's setting method
    if (!this.setting(`${EXTENSION_ID}.settings`)()) {
      // Check for legacy data migration first
      this.migrateFromLegacy();
    }
    
    // Add default data if no slides exist (for testing)
    const settings = this.getSettings();
    if (settings.slides.length === 0) {
      this.addDefaultSlides();
    }
    
    // Initialize streams with current settings
    this.initializeStreams();
  }
  
  /**
   * Get settings from ExtensionPage's setting method
   */
  getSettings(): ExtensionSettings {
    try {
      const json = this.setting(`${EXTENSION_ID}.settings`)() || '{}';
      const parsed = JSON.parse(json);
      return {
        slides: parsed.slides || [],
        transitionTime: parsed.transitionTime || 5000,
        socialLinks: parsed.socialLinks || [],
        headerIcon: parsed.headerIcon || {
          url: app.data.settings[`${EXTENSION_ID}.headerIconUrl`] || '',
          link: app.data.settings[`${EXTENSION_ID}.headerIconLink`] || ''
        },
        tagGlideTitle: parsed.tagGlideTitle || ''
      };
    } catch (error) {
      console.error('Failed to parse settings JSON:', error);
      return {
        slides: [],
        transitionTime: 5000,
        socialLinks: [],
        headerIcon: {
          url: app.data.settings[`${EXTENSION_ID}.headerIconUrl`] || '',
          link: app.data.settings[`${EXTENSION_ID}.headerIconLink`] || ''
        },
        tagGlideTitle: ''
      };
    }
  }
  
  /**
   * Initialize reactive streams with current settings
   */
  initializeStreams(): void {
    const settings = this.getSettings();
    
    // Initialize streams with current values
    this.transitionTimeStream = Stream(settings.transitionTime);
    this.tagGlideTitleStream = Stream(settings.tagGlideTitle || '');
    this.headerIconUrlStream = Stream(settings.headerIcon?.url || '');
    this.headerIconLinkStream = Stream(settings.headerIcon?.link || '');
    
    // Set up auto-save listeners
    this.transitionTimeStream.map((value: number) => {
      const currentSettings = this.getSettings();
      currentSettings.transitionTime = value;
      this.updateSettings(currentSettings);
    });
    
    this.tagGlideTitleStream.map((value: string) => {
      const currentSettings = this.getSettings();
      currentSettings.tagGlideTitle = value;
      this.updateSettings(currentSettings);
    });
    
    this.headerIconUrlStream.map((value: string) => {
      this.updateHeaderIcon('url', value);
    });
    
    this.headerIconLinkStream.map((value: string) => {
      this.updateHeaderIcon('link', value);
    });
  }
  
  /**
   * Update settings using ExtensionPage's setting method
   */
  updateSettings(settings: ExtensionSettings): void {
    try {
      const json = JSON.stringify(settings);
      this.setting(`${EXTENSION_ID}.settings`)(json);
      // Also update transition time in separate setting for legacy compatibility
      this.setting(`${EXTENSION_ID}.TransitionTime`)(settings.transitionTime.toString());
      
      // Update headerIcon settings individually for forum access
      if (settings.headerIcon) {
        this.setting(`${EXTENSION_ID}.headerIconUrl`)(settings.headerIcon.url || '');
        this.setting(`${EXTENSION_ID}.headerIconLink`)(settings.headerIcon.link || '');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Migrate from legacy individual settings to JSON format
   */
  migrateFromLegacy(): void {
    
    const settings: ExtensionSettings = {
      slides: [],
      transitionTime: parseInt(app.data.settings[`${EXTENSION_ID}.TransitionTime`]) || 5000,
      socialLinks: [],
      headerIcon: {
        url: app.data.settings[`${EXTENSION_ID}.headerIconUrl`] || '',
        link: app.data.settings[`${EXTENSION_ID}.headerIconLink`] || ''
      }
    };
    
    // Migrate old slideshow data (up to 30 slides)
    for (let i = 1; i <= 30; i++) {
      const image = app.data.settings[`${EXTENSION_ID}.Image${i}`];
      const link = app.data.settings[`${EXTENSION_ID}.Link${i}`];
      if (image || link) {
        settings.slides.push({
          id: `legacy-${i}`,
          image: image || '',
          link: link || '',
          active: true,
          order: i
        });
      }
    }
    
    // Migrate social media links
    SOCIAL_PLATFORMS.forEach(platform => {
      const url = app.data.settings[`${EXTENSION_ID}.Social${platform}Url`];
      const icon = app.data.settings[`${EXTENSION_ID}.Social${platform}Icon`];
      if (url || icon) {
        settings.socialLinks.push({
          platform,
          url: url || '',
          icon: icon || ''
        });
      }
    });
    
    // Save migrated data
    this.updateSettings(settings);
  }

  /**
   * Add some default slides for testing purposes
   */
  addDefaultSlides(): void {
    
    const settings = this.getSettings();
    settings.slides = [
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
    
    this.updateSettings(settings);
  }



  /**
   * Add new slide
   */
  addSlide(): void {
    const settings = this.getSettings();
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      image: '',
      link: '',
      active: true,
      order: settings.slides.length + 1
    };
    
    settings.slides.push(newSlide);
    this.updateSettings(settings);
  }

  /**
   * Delete slide
   */
  deleteSlide(slideId: string): void {
    const settings = this.getSettings();
    settings.slides = settings.slides.filter(slide => slide.id !== slideId);
    // Reorder remaining slides
    settings.slides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    this.updateSettings(settings);
  }

  /**
   * Update slide
   */
  updateSlide(slideId: string, field: keyof SlideData, value: any): void {
    const settings = this.getSettings();
    const slide = settings.slides.find(s => s.id === slideId);
    if (slide) {
      (slide as any)[field] = value;
      this.updateSettings(settings);
    }
  }

  /**
   * Update social media link
   */
  updateSocialLink(platform: string, field: 'url' | 'icon', value: string): void {
    const settings = this.getSettings();
    let socialLink = settings.socialLinks.find(s => s.platform === platform);
    if (!socialLink) {
      socialLink = { platform, url: '', icon: '' };
      settings.socialLinks.push(socialLink);
    }
    socialLink[field] = value;
    this.updateSettings(settings);
  }

  /**
   * Update header icon configuration
   */
  updateHeaderIcon(field: 'url' | 'link', value: string): void {
    const settings = this.getSettings();
    if (!settings.headerIcon) {
      settings.headerIcon = { url: '', link: '' };
    }
    settings.headerIcon[field] = value;
    this.updateSettings(settings);
  }

  content() {
    const settings = this.getSettings(); // Get current settings on each render
    
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
            bidi={this.transitionTimeStream}
          />
        </div>

        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.TagGlideTitle')}</h3>
          
          <label className="FormLabel">
            {app.translator.trans('wusong8899-client1.admin.TagGlideTitleLabel')}
          </label>
          <input
            className="FormControl"
            type="text"
            placeholder={app.translator.trans('wusong8899-client1.admin.TagGlideTitlePlaceholder')}
            bidi={this.tagGlideTitleStream}
          />
          <div className="helpText">
            {app.translator.trans('wusong8899-client1.admin.TagGlideTitleHelp')}
          </div>
        </div>

        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.HeaderIconTitle')}</h3>
          
          <label className="FormLabel">
            {app.translator.trans('wusong8899-client1.admin.HeaderIconUrl')}
          </label>
          <input
            className="FormControl"
            type="url"
            placeholder={app.translator.trans('wusong8899-client1.admin.HeaderIconUrlHelp')}
            bidi={this.headerIconUrlStream}
          />
          
          <label className="FormLabel">
            {app.translator.trans('wusong8899-client1.admin.HeaderIconLink')}
          </label>
          <input
            className="FormControl"
            type="url"
            placeholder={app.translator.trans('wusong8899-client1.admin.HeaderIconLinkHelp')}
            bidi={this.headerIconLinkStream}
          />
        </div>

        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.SlidesManagement')}</h3>
          
          {settings.slides.map((slide) => this.renderSlide(slide))}
          
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
    const settings = this.getSettings();
    const socialLink = settings.socialLinks.find(s => s.platform === platform) || 
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