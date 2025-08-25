import app from 'flarum/common/app';
import type {
  SmartSlide,
  SlideOperation,
  SlideOperationResult,
  SlideValidationResult,
  AnalyticsSummary,
} from '../types';

/**
 * Smart Slide Management Service
 * 
 * Unified frontend service for managing slides with intelligent features:
 * - Batch operations
 * - Local caching
 * - Validation
 * - Analytics tracking
 */
export class SlideService {
  private static instance: SlideService | null = null;
  private cachedSlides: SmartSlide[] = [];
  private lastFetch: number = 0;
  private readonly cacheTimeout = 30000; // 30 seconds

  private constructor(
    private readonly extensionId: string = 'wusong8899-client1-header-adv'
  ) { }

  /**
   * Get singleton instance
   */
  static getInstance(): SlideService {
    if (!SlideService.instance) {
      SlideService.instance = new SlideService();
    }
    return SlideService.instance;
  }

  /**
   * Get all slides with caching
   */
  async getAllSlides(forceRefresh: boolean = false): Promise<SmartSlide[]> {
    const now = Date.now();

    if (!forceRefresh && this.cachedSlides.length > 0 && (now - this.lastFetch) < this.cacheTimeout) {
      return this.cachedSlides;
    }

    try {
      // Try to get from forum attributes first (for forum context)
      const slidesJson = this.getForumAttribute('Slides');

      if (slidesJson) {
        const slides = this.parseSlides(slidesJson);
        this.cachedSlides = slides;
        this.lastFetch = now;
        return slides;
      }

      // Fallback to app.data.settings (for admin context)
      const settingKey = `${this.extensionId}.Slides`;
      const slidesData = app.data?.settings?.[settingKey];

      if (slidesData) {
        const slides = this.parseSlides(slidesData);
        this.cachedSlides = slides;
        this.lastFetch = now;
        return slides;
      }

      // If no JSON data found, try to load legacy format
      return this.loadLegacySlides();
    } catch (error) {
      console.error('Error loading slides:', error);
      return [];
    }
  }

  /**
   * Add new slide
   */
  async addSlide(slideData: Partial<SmartSlide>): Promise<SmartSlide | null> {
    try {
      const newSlide: SmartSlide = {
        id: this.generateSlideId(),
        content: {
          image: slideData.content?.image || '',
          link: slideData.content?.link || '',
          title: slideData.content?.title || '',
          description: slideData.content?.description || ''
        },
        settings: {
          active: slideData.settings?.active ?? true,
          order: slideData.settings?.order || (this.cachedSlides.length + 1),
          target: slideData.settings?.target || '_blank',
          visibility: slideData.settings?.visibility || 'all'
        },
        analytics: {
          clicks: 0,
          impressions: 0,
          created_at: new Date().toISOString(),
          last_clicked: null
        }
      };

      const validation = this.validateSlide(newSlide);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const slides = [...this.cachedSlides, newSlide];
      const success = await this.saveSlides(slides);

      if (success) {
        this.cachedSlides = slides;
        return newSlide;
      }

      return null;
    } catch (error) {
      console.error('Error adding slide:', error);
      return null;
    }
  }

  /**
   * Update existing slide
   */
  async updateSlide(slideId: string, updateData: Partial<SmartSlide>): Promise<boolean> {
    try {
      const slideIndex = this.cachedSlides.findIndex(slide => slide.id === slideId);

      if (slideIndex === -1) {
        throw new Error(`Slide with ID ${slideId} not found`);
      }

      const updatedSlide: SmartSlide = {
        ...this.cachedSlides[slideIndex],
        ...updateData,
        content: {
          ...this.cachedSlides[slideIndex].content,
          ...updateData.content
        },
        settings: {
          ...this.cachedSlides[slideIndex].settings,
          ...updateData.settings
        },
        analytics: {
          ...this.cachedSlides[slideIndex].analytics,
          ...updateData.analytics
        }
      };

      const validation = this.validateSlide(updatedSlide);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const slides = [...this.cachedSlides];
      slides[slideIndex] = updatedSlide;

      const success = await this.saveSlides(slides);

      if (success) {
        this.cachedSlides = slides;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating slide:', error);
      return false;
    }
  }

  /**
   * Delete slide
   */
  async deleteSlide(slideId: string): Promise<boolean> {
    try {
      const slides = this.cachedSlides.filter(slide => slide.id !== slideId);

      // Reorder remaining slides
      slides.forEach((slide, index) => {
        slide.settings.order = index + 1;
      });

      const success = await this.saveSlides(slides);

      if (success) {
        this.cachedSlides = slides;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting slide:', error);
      return false;
    }
  }

  /**
   * Reorder slides
   */
  async reorderSlides(slideIds: string[]): Promise<boolean> {
    try {
      const slideLookup = new Map(this.cachedSlides.map(slide => [slide.id, slide]));
      const reorderedSlides: SmartSlide[] = [];

      // Reorder based on provided IDs
      slideIds.forEach((slideId, index) => {
        const slide = slideLookup.get(slideId);
        if (slide) {
          slide.settings.order = index + 1;
          reorderedSlides.push(slide);
        }
      });

      // Add any missing slides to the end
      this.cachedSlides.forEach(slide => {
        if (!slideIds.includes(slide.id)) {
          slide.settings.order = reorderedSlides.length + 1;
          reorderedSlides.push(slide);
        }
      });

      const success = await this.saveSlides(reorderedSlides);

      if (success) {
        this.cachedSlides = reorderedSlides;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error reordering slides:', error);
      return false;
    }
  }

  /**
   * Batch operations
   */
  async batchUpdate(operations: SlideOperation[]): Promise<SlideOperationResult[]> {
    const results: SlideOperationResult[] = [];

    for (const operation of operations) {
      try {
        let result: boolean | SmartSlide = false;

        switch (operation.type) {
          case 'add':
            if (operation.data && !('slideIds' in operation.data)) {
              result = await this.addSlide(operation.data as Partial<SmartSlide>);
            }
            break;
          case 'update':
            if (operation.slideId && operation.data && !('slideIds' in operation.data)) {
              result = await this.updateSlide(operation.slideId, operation.data as Partial<SmartSlide>);
            }
            break;
          case 'delete':
            if (operation.slideId) {
              result = await this.deleteSlide(operation.slideId);
            }
            break;
          case 'reorder':
            if (operation.data && 'slideIds' in operation.data) {
              result = await this.reorderSlides(operation.data.slideIds);
            }
            break;
        }

        results.push({ type: operation.type, result });
      } catch (error) {
        console.error(`Error in batch operation ${operation.type}:`, error);
        results.push({ type: operation.type, result: false });
      }
    }

    return results;
  }

  /**
   * Track slide impression
   */
  async trackImpression(slideId: string): Promise<void> {
    const slide = this.cachedSlides.find(s => s.id === slideId);
    if (slide) {
      slide.analytics.impressions++;
      // Save updated analytics (could be optimized with debouncing)
      await this.updateSlide(slideId, { analytics: slide.analytics });
    }
  }

  /**
   * Track slide click
   */
  async trackClick(slideId: string): Promise<void> {
    const slide = this.cachedSlides.find(s => s.id === slideId);
    if (slide) {
      slide.analytics.clicks++;
      slide.analytics.last_clicked = new Date().toISOString();
      // Save updated analytics
      await this.updateSlide(slideId, { analytics: slide.analytics });
    }
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): AnalyticsSummary {
    const activeSlides = this.cachedSlides.filter(slide => slide.settings.active);
    const totalClicks = activeSlides.reduce((sum, slide) => sum + slide.analytics.clicks, 0);
    const totalImpressions = activeSlides.reduce((sum, slide) => sum + slide.analytics.impressions, 0);

    return {
      total_slides: this.cachedSlides.length,
      active_slides: activeSlides.length,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 100 * 100) / 100 : 0
    };
  }

  /**
   * Validate slide data
   */
  validateSlide(slide: SmartSlide): SlideValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!slide.id) {
      errors.push('Slide ID is required');
    }

    // Content validation
    if (!slide.content.image && !slide.content.link) {
      errors.push('Either image or link is required');
    }

    if (slide.content.image && !this.isValidUrl(slide.content.image)) {
      errors.push('Invalid image URL format');
    }

    if (slide.content.link && !this.isValidUrl(slide.content.link)) {
      errors.push('Invalid link URL format');
    }

    // Settings validation
    if (typeof slide.settings.active !== 'boolean') {
      errors.push('Active setting must be boolean');
    }

    if (typeof slide.settings.order !== 'number' || slide.settings.order < 1) {
      errors.push('Order must be a positive number');
    }

    if (!['_blank', '_self'].includes(slide.settings.target)) {
      errors.push('Target must be _blank or _self');
    }

    if (!['all', 'desktop', 'mobile'].includes(slide.settings.visibility)) {
      errors.push('Visibility must be all, desktop, or mobile');
    }

    // Warnings
    if (slide.content.image && slide.content.link && !slide.content.title) {
      warnings.push('Consider adding a title for better accessibility');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedSlides = [];
    this.lastFetch = 0;
  }

  /**
   * Save slides to backend
   */
  private async saveSlides(slides: SmartSlide[]): Promise<boolean> {
    try {
      const slidesJson = JSON.stringify(slides);
      const settingKey = `${this.extensionId}.Slides`;

      // Update local cache first
      if (app.data?.settings) {
        app.data.settings[settingKey] = slidesJson;
      }

      // Save to backend
      const response = await app.request({
        method: 'POST',
        url: `${app.forum?.attribute('apiUrl') || ''}/settings`,
        body: { [settingKey]: slidesJson }
      });

      return !!response;
    } catch (error) {
      console.error('Error saving slides:', error);
      return false;
    }
  }

  /**
   * Parse slides JSON data
   */
  private parseSlides(data: any): SmartSlide[] {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data) || [];
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error parsing slides data:', error);
      return [];
    }
  }

  /**
   * Load legacy slide format for backward compatibility
   */
  private loadLegacySlides(): SmartSlide[] {
    const legacySlides: SmartSlide[] = [];
    const maxSlides = this.getMaxSlides();

    for (let i = 1; i <= maxSlides; i++) {
      const linkKey = `${this.extensionId}.Link${i}`;
      const imageKey = `${this.extensionId}.Image${i}`;

      const link = app.data?.settings?.[linkKey] || '';
      const image = app.data?.settings?.[imageKey] || '';

      if (link || image) {
        legacySlides.push({
          id: `legacy-${i}`,
          content: {
            image,
            link,
            title: '',
            description: ''
          },
          settings: {
            active: true,
            order: i,
            target: '_blank',
            visibility: 'all'
          },
          analytics: {
            clicks: 0,
            impressions: 0,
            created_at: new Date().toISOString(),
            migrated_from_legacy: true
          }
        });
      }
    }

    this.cachedSlides = legacySlides;
    this.lastFetch = Date.now();

    return legacySlides;
  }

  /**
   * Generate unique slide ID
   */
  private generateSlideId(): string {
    return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get forum attribute safely
   */
  private getForumAttribute(key: string): any {
    try {
      const forum = (app as any)?.forum;
      const attrFn = forum?.attribute;
      return typeof attrFn === 'function' ? attrFn.call(forum, key) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get maximum slides from settings
   */
  private getMaxSlides(): number {
    const maxSlidesKey = `${this.extensionId}.MaxSlides`;
    return parseInt(app.data?.settings?.[maxSlidesKey] || '30', 10);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}