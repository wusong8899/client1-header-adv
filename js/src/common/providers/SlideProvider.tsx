import app from 'flarum/common/app';
import { SlideData, SlideComponentState, SlideValidation } from '../types';
import { defaultConfig } from '../config';

/**
 * Provider for managing slide data and operations
 * Handles CRUD operations, validation, and state management for slides
 */
export class SlideProvider {
  private state: SlideComponentState = {
    slides: [],
    nextId: 1,
    loading: false,
    error: { hasError: false }
  };

  private readonly extensionId: string;
  private readonly maxSlides: number;
  private updateTimeouts: Map<string, number> = new Map();

  constructor(extensionId: string, maxSlides: number = defaultConfig.slider.maxSlides) {
    this.extensionId = extensionId;
    this.maxSlides = maxSlides;
    this.loadSlides();
  }

  /**
   * Get current state (readonly)
   */
  public getState(): Readonly<SlideComponentState> {
    return { ...this.state };
  }

  /**
   * Load slides from settings
   */
  public async loadSlides(): Promise<void> {
    try {
      this.state.loading = true;
      const slides: SlideData[] = [];

      for (let i = 1; i <= this.maxSlides; i++) {
        const link = app.data.settings[`${this.extensionId}.Link${i}`] || '';
        const image = app.data.settings[`${this.extensionId}.Image${i}`] || '';

        if (link || image) {
          slides.push({ id: i, link, image });
          this.state.nextId = Math.max(this.state.nextId, i + 1);
        }
      }

      this.state.slides = slides;
      
      if (slides.length === 0) {
        await this.addSlide();
      }

      this.state.error = { hasError: false };
    } catch (_error) {
      this.state.error = {
        hasError: true,
        message: 'Failed to load slides'
      };
    } finally {
      this.state.loading = false;
    }
  }

  /**
   * Add a new slide
   */
  public async addSlide(): Promise<void> {
    const newSlide: SlideData = {
      id: this.state.nextId++,
      link: '',
      image: ''
    };

    this.state.slides.push(newSlide);
    return Promise.resolve();
  }

  /**
   * Remove a slide
   */
  public async removeSlide(slideId: number): Promise<void> {
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const slide = this.state.slides[slideIndex];

    try {
      this.state.loading = true;

      // Remove from backend
      await this.saveSetting(`${this.extensionId}.Link${slide.id}`, '');
      await this.saveSetting(`${this.extensionId}.Image${slide.id}`, '');

      // Remove from local state
      this.state.slides.splice(slideIndex, 1);

      // Ensure at least one slide exists
      if (this.state.slides.length === 0) {
        await this.addSlide();
      }

      this.state.error = { hasError: false };
    } catch (error) {
      this.state.error = {
        hasError: true,
        message: 'Failed to remove slide'
      };
      throw error;
    } finally {
      this.state.loading = false;
    }
  }

  /**
   * Update slide data
   */
  public async updateSlide(slideId: number, field: 'link' | 'image', value: string): Promise<void> {
    const slide = this.state.slides.find(s => s.id === slideId);
    if (!slide) return;

    // Validate input
    const validation = this.validateSlideField(field, value);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    slide[field] = value;

    const settingKey = field === 'link' 
      ? `${this.extensionId}.Link${slide.id}` 
      : `${this.extensionId}.Image${slide.id}`;

    await this.saveSetting(settingKey, value);
  }

  /**
   * Duplicate a slide
   */
  public async duplicateSlide(slideId: number): Promise<void> {
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const originalSlide = this.state.slides[slideIndex];
    const newSlide: SlideData = {
      id: this.state.nextId++,
      link: originalSlide.link,
      image: originalSlide.image
    };

    this.state.slides.splice(slideIndex + 1, 0, newSlide);
  }

  /**
   * Move slide position
   */
  public moveSlide(slideId: number, direction: 'up' | 'down'): void {
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= this.state.slides.length) return;

    const slide = this.state.slides[slideIndex];
    this.state.slides.splice(slideIndex, 1);
    this.state.slides.splice(targetIndex, 0, slide);
  }

  /**
   * Validate slide field
   */
  private validateSlideField(field: 'link' | 'image', value: string): SlideValidation {
    const errors: string[] = [];

    if (value && (field === 'link' || field === 'image')) {
      try {
        new URL(value);
      } catch {
        errors.push(`Please enter a valid ${field === 'link' ? 'URL' : 'image URL'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save setting with debouncing
   */
  private async saveSetting(key: string, value: string): Promise<void> {
    const timeoutKey = `slide_${key}`;
    
    // Clear existing timeout
    if (this.updateTimeouts.has(timeoutKey)) {
      clearTimeout(this.updateTimeouts.get(timeoutKey)!);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          app.data.settings[key] = value;

          await app.request({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/settings',
            body: { [key]: value }
          });

          this.updateTimeouts.delete(timeoutKey);
          resolve();
        } catch (error) {
          this.updateTimeouts.delete(timeoutKey);
          reject(error);
        }
      }, 500);

      this.updateTimeouts.set(timeoutKey, timeout);
    });
  }

  /**
   * Get slides with validation status
   */
  public getSlidesWithValidation(): Array<SlideData & { validation: SlideValidation }> {
    return this.state.slides.map(slide => ({
      ...slide,
      validation: {
        isValid: this.validateSlideField('link', slide.link).isValid && 
                 this.validateSlideField('image', slide.image).isValid,
        errors: [
          ...this.validateSlideField('link', slide.link).errors,
          ...this.validateSlideField('image', slide.image).errors
        ]
      }
    }));
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.updateTimeouts.forEach(timeout => clearTimeout(timeout));
    this.updateTimeouts.clear();
  }
}