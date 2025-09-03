import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Stream from 'flarum/common/utils/Stream';
import type { SlideData, ExtensionSettings, TitleAction } from '../common/types';
import type { Vnode } from 'mithril';

/**
 * Extension configuration constants
 */
const EXTENSION_ID = 'wusong8899-client1-header-adv';
const _DEFAULT_MAX_SLIDES = 30;

/**
 * Unified Admin Management Component
 * Consolidates slideshow management, social media settings, and global configuration
 */
class UnifiedAdminComponent extends ExtensionPage {
  // Stream instances for reactive form handling
  transitionTimeStream: Stream<number>;
  tagGlideTitleStream: Stream<string>;
  tagGlideTitleIconStream: Stream<string>;
  headerIconUrlStream: Stream<string>;
  headerIconLinkStream: Stream<string>;
  titleActionsStream: Stream<TitleAction[]>;
  
  oninit(vnode: Vnode) {
    super.oninit(vnode);
    
    // Initialize settings using ExtensionPage's setting method
    if (!this.setting(`${EXTENSION_ID}.settings`)()) {
      // Set empty JSON if no settings exist
      this.setting(`${EXTENSION_ID}.settings`)('{}');
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
        headerIcon: parsed.headerIcon || { url: '', link: '' },
        tagGlideTitle: parsed.tagGlideTitle || '',
        tagGlideTitleIcon: parsed.tagGlideTitleIcon || '',
        titleActions: parsed.titleActions || [],
      };
    } catch (error) {
      console.error('Failed to parse settings JSON:', error);
      return {
        slides: [],
        transitionTime: 5000,
        headerIcon: { url: '', link: '' },
        tagGlideTitle: '',
        tagGlideTitleIcon: '',
        titleActions: [],
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
    this.tagGlideTitleIconStream = Stream(settings.tagGlideTitleIcon || '');
    this.headerIconUrlStream = Stream(settings.headerIcon?.url || '');
    this.headerIconLinkStream = Stream(settings.headerIcon?.link || '');
    this.titleActionsStream = Stream(settings.titleActions && settings.titleActions.length
      ? settings.titleActions
      : this.getDefaultTitleActions());
    
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
    
    this.tagGlideTitleIconStream.map((value: string) => {
      const currentSettings = this.getSettings();
      currentSettings.tagGlideTitleIcon = value;
      this.updateSettings(currentSettings);
    });
    
    this.headerIconUrlStream.map((value: string) => {
      this.updateHeaderIcon('url', value);
    });
    
    this.headerIconLinkStream.map((value: string) => {
      this.updateHeaderIcon('link', value);
    });

    this.titleActionsStream.map((value: TitleAction[]) => {
      const currentSettings = this.getSettings();
      currentSettings.titleActions = value;
      this.updateSettings(currentSettings);
    });
  }
  
  /**
   * Update settings using ExtensionPage's setting method
   */
  updateSettings(settings: ExtensionSettings): void {
    try {
      const json = JSON.stringify(settings);
      this.setting(`${EXTENSION_ID}.settings`)(json);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
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

  /**
   * Get default title actions (live, lottery, loan)
   */
  getDefaultTitleActions(): TitleAction[] {
    return [
      { id: 'live', label: '直播', imageUrl: '', linkUrl: '', enabled: false },
      { id: 'lottery', label: '彩票', imageUrl: '', linkUrl: '', enabled: false },
      { id: 'loan', label: '老哥贷', imageUrl: '', linkUrl: '', enabled: false },
    ];
  }

  /**
   * Update a title action property and commit to settings
   */
  updateTitleAction(index: number, field: keyof TitleAction, value: any): void {
    const actions = [...(this.titleActionsStream() || [])];
    if (!actions[index]) return;
    (actions[index] as any)[field] = value;
    this.titleActionsStream(actions);
  }

  content() {
    const settings = this.getSettings(); // Get current settings on each render
    
    return (
      <div className="ExtensionPage-settings">
        <div className="container">
          <div className="UnifiedAdminComponent">
        <div className="Form-group">
          <h3>{app.translator.trans('wusong8899-client1.admin.TitleActions')}</h3>

          {(this.titleActionsStream() || []).map((action: TitleAction, index: number) => (
            <div className="TitleActionConfig" key={action.id || index}>
              <div className="Form-group">
                <label className="FormLabel">{app.translator.trans('wusong8899-client1.admin.TitleActionEnabled')}</label>
                <input
                  type="checkbox"
                  checked={action.enabled}
                  onchange={(e: Event) => this.updateTitleAction(index, 'enabled', (e.target as HTMLInputElement).checked)}
                />
              </div>

              <div className="Form-group">
                <label className="FormLabel">{app.translator.trans('wusong8899-client1.admin.TitleActionLabel')}</label>
                <input
                  className="FormControl"
                  type="text"
                  value={action.label}
                  oninput={(e: Event) => this.updateTitleAction(index, 'label', (e.target as HTMLInputElement).value)}
                />
              </div>

              <div className="Form-group">
                <label className="FormLabel">{app.translator.trans('wusong8899-client1.admin.TitleActionImageUrl')}</label>
                <input
                  className="FormControl"
                  type="url"
                  value={action.imageUrl}
                  oninput={(e: Event) => this.updateTitleAction(index, 'imageUrl', (e.target as HTMLInputElement).value)}
                />
              </div>

              <div className="Form-group">
                <label className="FormLabel">{app.translator.trans('wusong8899-client1.admin.TitleActionLinkUrl')}</label>
                <input
                  className="FormControl"
                  type="url"
                  value={action.linkUrl}
                  oninput={(e: Event) => this.updateTitleAction(index, 'linkUrl', (e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          ))}
        </div>
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
          
          <label className="FormLabel">
            {app.translator.trans('wusong8899-client1.admin.TagGlideTitleIconLabel')}
          </label>
          <input
            className="FormControl"
            type="url"
            placeholder={app.translator.trans('wusong8899-client1.admin.TagGlideTitleIconPlaceholder')}
            bidi={this.tagGlideTitleIconStream}
          />
          <div className="helpText">
            {app.translator.trans('wusong8899-client1.admin.TagGlideTitleIconHelp')}
          </div>
          
          {this.tagGlideTitleIconStream() && (
            <div className="IconPreview">
              <img 
                src={this.tagGlideTitleIconStream()} 
                alt="Tag title icon preview" 
                style="max-width: 18px; max-height: 18px; margin-top: 5px;" 
              />
            </div>
          )}
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


  // Register the custom page instead of just a setting component
  extensionData.registerPage(UnifiedAdminComponent);
});