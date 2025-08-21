import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import { SlideData, SlideComponentState, SlideValidation } from '../../common/types';
import { defaultConfig } from '../../common/config';

interface SlideManagerAttrs {
  extensionId: string;
  maxSlides?: number;
}

/**
 * Enhanced slide manager component with validation and better UX
 */
export default class SlideManager extends Component<SlideManagerAttrs> {
  protected state: SlideComponentState = {
    slides: [],
    nextId: 1,
    loading: false,
    error: { hasError: false }
  };

  oninit(vnode: any) {
    super.oninit(vnode);
    this.loadExistingSlides();
  }

  /**
   * Load existing slides from settings
   */
  private loadExistingSlides(): void {
    const { extensionId, maxSlides = defaultConfig.slider.maxSlides } = this.attrs;
    const slides: SlideData[] = [];
    
    for (let i = 1; i <= maxSlides; i++) {
      const linkKey = `${extensionId}.Link${i}`;
      const imageKey = `${extensionId}.Image${i}`;
      const link = app.data.settings[linkKey] || '';
      const image = app.data.settings[imageKey] || '';
      
      if (link || image) {
        slides.push({ id: i, link, image });
        this.state.nextId = Math.max(this.state.nextId, i + 1);
      }
    }
    
    this.state.slides = slides;
    
    if (slides.length === 0) {
      this.addSlide();
    }
  }

  /**
   * Add a new slide
   */
  private addSlide(): void {
    const newSlide: SlideData = {
      id: this.state.nextId++,
      link: '',
      image: ''
    };
    
    this.state.slides.push(newSlide);
    m.redraw();
  }

  /**
   * Remove a slide
   */
  private async removeSlide(slideId: number): Promise<void> {
    const { extensionId } = this.attrs;
    const slideIndex = this.state.slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const slide = this.state.slides[slideIndex];
    
    try {
      this.state.loading = true;
      
      // Remove from backend
      await this.saveSetting(`${extensionId}.Link${slide.id}`, '');
      await this.saveSetting(`${extensionId}.Image${slide.id}`, '');
      
      // Remove from local state
      this.state.slides.splice(slideIndex, 1);
      
      // Ensure at least one slide exists
      if (this.state.slides.length === 0) {
        this.addSlide();
      }
      
      this.state.error = { hasError: false };
    } catch (_error) {
      this.state.error = {
        hasError: true,
        message: 'Failed to remove slide. Please try again.'
      };
    } finally {
      this.state.loading = false;
      m.redraw();
    }
  }

  /**
   * Update slide data with validation
   */
  private updateSlide(slideId: number, field: 'link' | 'image', value: string): void {
    const { extensionId } = this.attrs;
    const slide = this.state.slides.find(s => s.id === slideId);
    
    if (!slide) return;

    // Validate input
    const validation = this.validateSlideField(field, value);
    if (!validation.isValid) {
      // TODO: Show validation errors to user
      console.warn(`Validation failed for ${field}:`, validation.errors);
      return;
    }

    slide[field] = value;
    
    const settingKey = field === 'link' 
      ? `${extensionId}.Link${slide.id}` 
      : `${extensionId}.Image${slide.id}`;
    
    this.saveSetting(settingKey, value);
  }

  /**
   * Validate slide field input
   */
  private validateSlideField(field: 'link' | 'image', value: string): SlideValidation {
    const errors: string[] = [];
    
    if (value && field === 'link') {
      try {
        new URL(value);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    if (value && field === 'image') {
      try {
        new URL(value);
        // Additional image validation could be added here
      } catch {
        errors.push('Please enter a valid image URL');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save setting with error handling
   */
  private async saveSetting(key: string, value: string): Promise<void> {
    const timeoutKey = `slideTimeout_${key}`;
    clearTimeout((this as any)[timeoutKey]);
    
    return new Promise((resolve, reject) => {
      (this as any)[timeoutKey] = setTimeout(async () => {
        try {
          app.data.settings[key] = value;
          
          await app.request({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/settings',
            body: { [key]: value }
          });
          
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  /**
   * Duplicate an existing slide
   */
  private duplicateSlide(slideId: number): void {
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    
    const originalSlide = this.state.slides[slideIndex];
    const newSlide: SlideData = {
      id: this.state.nextId++,
      link: originalSlide.link,
      image: originalSlide.image
    };
    
    this.state.slides.splice(slideIndex + 1, 0, newSlide);
    m.redraw();
  }

  /**
   * Move slide up in order
   */
  private moveSlideUp(slideId: number): void {
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex <= 0) return;
    
    const slide = this.state.slides[slideIndex];
    this.state.slides.splice(slideIndex, 1);
    this.state.slides.splice(slideIndex - 1, 0, slide);
    
    m.redraw();
  }

  /**
   * Move slide down in order
   */
  private moveSlideDown(slideId: number): void {
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex >= this.state.slides.length - 1) return;
    
    const slide = this.state.slides[slideIndex];
    this.state.slides.splice(slideIndex, 1);
    this.state.slides.splice(slideIndex + 1, 0, slide);
    
    m.redraw();
  }

  view() {
    if (this.state.error.hasError) {
      return (
        <div className="SlideManager has-error">
          <div className="Alert Alert--error">
            <strong>Error:</strong> {this.state.error.message}
            <Button
              className="Button Button--link"
              onclick={() => {
                this.state.error = { hasError: false };
                m.redraw();
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="SlideManager">
        <div className="Form-group">
          <label className="FormLabel">
            {app.translator.trans('wusong8899-client1.admin.SlideSettings')}
          </label>
          <div className="helpText">
            {app.translator.trans('wusong8899-client1.admin.SlideSettingsHelp')}
          </div>

          <div className="SlideManager-slides">
            {this.state.slides.map((slide, index) => this.renderSlide(slide, index))}
            
            <div className="SlideManager-addButton">
              <Button
                className="Button Button--primary"
                icon="fas fa-plus"
                onclick={() => this.addSlide()}
                loading={this.state.loading}
              >
                {app.translator.trans('wusong8899-client1.admin.AddSlide')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render a single slide with enhanced controls
   */
  private renderSlide(slide: SlideData, index: number) {
    const canMoveUp = index > 0;
    const canMoveDown = index < this.state.slides.length - 1;
    const canDelete = this.state.slides.length > 1;

    return (
      <div className="SlideManager-slide" key={slide.id}>
        <div className="SlideManager-slideHeader">
          <h4>
            {app.translator.trans('wusong8899-client1.admin.SlideNumber', { number: index + 1 })}
          </h4>
          
          <div className="SlideManager-slideActions">
            <Button
              className="Button Button--icon"
              icon="fas fa-arrow-up"
              title="Move up"
              onclick={() => this.moveSlideUp(slide.id)}
              disabled={!canMoveUp || this.state.loading}
            />
            
            <Button
              className="Button Button--icon"
              icon="fas fa-arrow-down"
              title="Move down"
              onclick={() => this.moveSlideDown(slide.id)}
              disabled={!canMoveDown || this.state.loading}
            />
            
            <Button
              className="Button Button--icon"
              icon="fas fa-copy"
              title="Duplicate"
              onclick={() => this.duplicateSlide(slide.id)}
              disabled={this.state.loading}
            />
            
            <Button
              className="Button Button--icon Button--danger"
              icon="fas fa-trash"
              title="Delete"
              onclick={() => this.removeSlide(slide.id)}
              disabled={!canDelete || this.state.loading}
            />
          </div>
        </div>
        
        <div className="SlideManager-slideFields">
          <div className="Form-group">
            <label className="FormLabel">
              {app.translator.trans('wusong8899-client1.admin.SlideLink')}
            </label>
            <input
              className="FormControl"
              type="url"
              placeholder="https://example.com"
              value={slide.link}
              oninput={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateSlide(slide.id, 'link', target.value);
              }}
              disabled={this.state.loading}
            />
          </div>
          
          <div className="Form-group">
            <label className="FormLabel">
              {app.translator.trans('wusong8899-client1.admin.SlideImage')}
            </label>
            <input
              className="FormControl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={slide.image}
              oninput={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateSlide(slide.id, 'image', target.value);
              }}
              disabled={this.state.loading}
            />
            
            {slide.image && this.renderImagePreview(slide.image)}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render image preview if URL is valid
   */
  private renderImagePreview(imageUrl: string) {
    return (
      <div className="SlideManager-imagePreview">
        <img
          src={imageUrl}
          alt="Slide preview"
          onload={() => m.redraw()}
          onerror={() => m.redraw()}
        />
      </div>
    );
  }
}