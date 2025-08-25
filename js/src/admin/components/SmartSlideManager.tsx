import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Select from 'flarum/common/components/Select';
import { SlideService } from '../../common/services/SlideService';
import type { SmartSlide, SlideValidationResult, AnalyticsSummary } from '../../common/types';

interface SmartSlideManagerAttrs {
  extensionId: string;
}

interface SmartSlideManagerState {
  slides: SmartSlide[];
  loading: boolean;
  error: string | null;
  analytics: AnalyticsSummary | null;
  draggedSlide: SmartSlide | null;
  validationResults: Map<string, SlideValidationResult>;
}

/**
 * Smart Slide Manager with advanced features
 * - Drag & drop reordering
 * - Batch operations
 * - Real-time validation
 * - Analytics display
 * - Bulk upload support
 */
export default class SmartSlideManager extends Component<SmartSlideManagerAttrs> {
  private slideService = SlideService.getInstance();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  protected state: SmartSlideManagerState = {
    slides: [],
    loading: true,
    error: null,
    analytics: null,
    draggedSlide: null,
    validationResults: new Map()
  };

  async oninit(vnode: any): Promise<void> {
    super.oninit(vnode);
    await this.loadSlides();
    this.loadAnalytics();
  }

  /**
   * Load slides from service
   */
  async loadSlides(): Promise<void> {
    try {
      this.state.loading = true;
      this.state.error = null;
      m.redraw();

      const slides = await this.slideService.getAllSlides(true);
      this.state.slides = slides.sort((a, b) => a.settings.order - b.settings.order);
      
      // Validate all slides
      this.validateAllSlides();
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load slides';
    } finally {
      this.state.loading = false;
      m.redraw();
    }
  }

  /**
   * Load analytics summary
   */
  loadAnalytics(): void {
    this.state.analytics = this.slideService.getAnalyticsSummary();
  }

  /**
   * Add new slide
   */
  async addSlide(): Promise<void> {
    const newSlide = await this.slideService.addSlide({
      content: {
        image: '',
        link: '',
        title: '',
        description: ''
      }
    });

    if (newSlide) {
      this.state.slides.push(newSlide);
      this.state.slides.sort((a, b) => a.settings.order - b.settings.order);
      this.loadAnalytics();
      m.redraw();
    }
  }

  /**
   * Delete slide
   */
  async deleteSlide(slideId: string): Promise<void> {
    if (confirm(app.translator.trans('wusong8899-client1.admin.ConfirmDeleteSlide'))) {
      const success = await this.slideService.deleteSlide(slideId);
      if (success) {
        this.state.slides = this.state.slides.filter(slide => slide.id !== slideId);
        this.loadAnalytics();
        m.redraw();
      }
    }
  }

  /**
   * Update slide with debouncing
   */
  updateSlide(slideId: string, updateData: Partial<SmartSlide>): void {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(slideId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Update local state immediately for UI responsiveness
    const slideIndex = this.state.slides.findIndex(s => s.id === slideId);
    if (slideIndex !== -1) {
      this.state.slides[slideIndex] = {
        ...this.state.slides[slideIndex],
        ...updateData,
        content: {
          ...this.state.slides[slideIndex].content,
          ...updateData.content
        },
        settings: {
          ...this.state.slides[slideIndex].settings,
          ...updateData.settings
        }
      };

      // Validate updated slide
      this.validateSlide(this.state.slides[slideIndex]);
      m.redraw();
    }

    // Debounce the API call
    const timer = setTimeout(async () => {
      try {
        await this.slideService.updateSlide(slideId, updateData);
        this.loadAnalytics();
      } catch (error) {
        console.error('Error updating slide:', error);
      }
      this.debounceTimers.delete(slideId);
    }, 500);

    this.debounceTimers.set(slideId, timer);
  }

  /**
   * Handle drag start
   */
  onDragStart(slide: SmartSlide, event: DragEvent): void {
    this.state.draggedSlide = slide;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', slide.id);
    }
  }

  /**
   * Handle drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Handle drop
   */
  async onDrop(targetSlide: SmartSlide, event: DragEvent): Promise<void> {
    event.preventDefault();
    
    if (!this.state.draggedSlide || this.state.draggedSlide.id === targetSlide.id) {
      return;
    }

    const draggedIndex = this.state.slides.findIndex(s => s.id === this.state.draggedSlide!.id);
    const targetIndex = this.state.slides.findIndex(s => s.id === targetSlide.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder slides array
      const slides = [...this.state.slides];
      const [draggedSlide] = slides.splice(draggedIndex, 1);
      slides.splice(targetIndex, 0, draggedSlide);

      // Update order property
      slides.forEach((slide, index) => {
        slide.settings.order = index + 1;
      });

      this.state.slides = slides;
      this.state.draggedSlide = null;
      m.redraw();

      // Save to backend
      const slideIds = slides.map(s => s.id);
      await this.slideService.reorderSlides(slideIds);
    }
  }

  /**
   * Toggle slide active state
   */
  toggleSlideActive(slideId: string): void {
    const slide = this.state.slides.find(s => s.id === slideId);
    if (slide) {
      this.updateSlide(slideId, {
        settings: { ...slide.settings, active: !slide.settings.active }
      });
    }
  }

  /**
   * Bulk activate/deactivate
   */
  async bulkToggleActive(activate: boolean): Promise<void> {
    const operations = this.state.slides.map(slide => ({
      type: 'update' as const,
      slideId: slide.id,
      data: {
        settings: { ...slide.settings, active: activate }
      }
    }));

    await this.slideService.batchUpdate(operations);
    
    // Update local state
    this.state.slides.forEach(slide => {
      slide.settings.active = activate;
    });
    
    this.loadAnalytics();
    m.redraw();
  }

  /**
   * Validate all slides
   */
  validateAllSlides(): void {
    this.state.slides.forEach(slide => this.validateSlide(slide));
  }

  /**
   * Validate single slide
   */
  validateSlide(slide: SmartSlide): void {
    const result = this.slideService.validateSlide(slide);
    this.state.validationResults.set(slide.id, result);
  }

  /**
   * Get validation status for slide
   */
  getValidationStatus(slideId: string): SlideValidationResult | null {
    return this.state.validationResults.get(slideId) || null;
  }

  view() {
    if (this.state.loading) {
      return (
        <div className="SmartSlideManager">
          <LoadingIndicator />
        </div>
      );
    }

    if (this.state.error) {
      return (
        <div className="SmartSlideManager">
          <div className="Alert Alert--error">
            <strong>Error:</strong> {this.state.error}
            <Button
              className="Button Button--link"
              onclick={() => this.loadSlides()}
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="SmartSlideManager">
        {this.renderHeader()}
        {this.renderAnalytics()}
        {this.renderBulkActions()}
        {this.renderSlides()}
        {this.renderAddButton()}
      </div>
    );
  }

  /**
   * Render header section
   */
  renderHeader() {
    return (
      <div className="SmartSlideManager-header">
        <h3>{app.translator.trans('wusong8899-client1.admin.SmartSlideManager')}</h3>
        <p className="helpText">
          {app.translator.trans('wusong8899-client1.admin.SmartSlideManagerHelp')}
        </p>
      </div>
    );
  }

  /**
   * Render analytics summary
   */
  renderAnalytics() {
    if (!this.state.analytics) return null;

    const { analytics } = this.state;
    
    return (
      <div className="SmartSlideManager-analytics">
        <h4>{app.translator.trans('wusong8899-client1.admin.Analytics')}</h4>
        <div className="Analytics-stats">
          <div className="stat">
            <span className="stat-value">{analytics.total_slides}</span>
            <span className="stat-label">Total Slides</span>
          </div>
          <div className="stat">
            <span className="stat-value">{analytics.active_slides}</span>
            <span className="stat-label">Active Slides</span>
          </div>
          <div className="stat">
            <span className="stat-value">{analytics.total_clicks}</span>
            <span className="stat-label">Total Clicks</span>
          </div>
          <div className="stat">
            <span className="stat-value">{analytics.ctr}%</span>
            <span className="stat-label">Click Rate</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render bulk action buttons
   */
  renderBulkActions() {
    const hasSlides = this.state.slides.length > 0;
    const activeCount = this.state.slides.filter(s => s.settings.active).length;
    const inactiveCount = this.state.slides.length - activeCount;

    if (!hasSlides) return null;

    return (
      <div className="SmartSlideManager-bulkActions">
        <Button
          className="Button Button--primary"
          onclick={() => this.bulkToggleActive(true)}
          disabled={activeCount === this.state.slides.length}
        >
          <i className="fas fa-eye"></i>
          {app.translator.trans('wusong8899-client1.admin.ActivateAll')}
        </Button>
        
        <Button
          className="Button"
          onclick={() => this.bulkToggleActive(false)}
          disabled={inactiveCount === this.state.slides.length}
        >
          <i className="fas fa-eye-slash"></i>
          {app.translator.trans('wusong8899-client1.admin.DeactivateAll')}
        </Button>

        <Button
          className="Button"
          onclick={() => this.loadSlides()}
        >
          <i className="fas fa-sync-alt"></i>
          Refresh
        </Button>
      </div>
    );
  }

  /**
   * Render slides list
   */
  renderSlides() {
    if (this.state.slides.length === 0) {
      return (
        <div className="SmartSlideManager-empty">
          <p>{app.translator.trans('wusong8899-client1.admin.NoSlides')}</p>
        </div>
      );
    }

    return (
      <div className="SmartSlideManager-slides">
        {this.state.slides.map(slide => this.renderSlide(slide))}
      </div>
    );
  }

  /**
   * Render single slide
   */
  renderSlide(slide: SmartSlide) {
    const validation = this.getValidationStatus(slide.id);
    const hasErrors = validation && !validation.isValid;

    return (
      <div
        className={`SmartSlideManager-slide ${slide.settings.active ? 'active' : 'inactive'} ${hasErrors ? 'has-errors' : ''}`}
        key={slide.id}
        draggable={true}
        ondragstart={(e) => this.onDragStart(slide, e)}
        ondragover={(e) => this.onDragOver(e)}
        ondrop={(e) => this.onDrop(slide, e)}
      >
        {this.renderSlideHeader(slide, validation)}
        {this.renderSlideContent(slide)}
        {validation && this.renderValidationMessages(validation)}
      </div>
    );
  }

  /**
   * Render slide header with controls
   */
  renderSlideHeader(slide: SmartSlide, validation: SlideValidationResult | null) {
    return (
      <div className="SmartSlideManager-slideHeader">
        <div className="slide-info">
          <div className="slide-order">#{slide.settings.order}</div>
          <div className="slide-status">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={slide.settings.active}
                onchange={() => this.toggleSlideActive(slide.id)}
              />
              <span className="checkmark"></span>
              Active
            </label>
          </div>
          {validation && !validation.isValid && (
            <span className="validation-indicator error" title={validation.errors.join(', ')}>
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          )}
        </div>

        <div className="slide-actions">
          <Button
            className="Button Button--icon"
            icon="fas fa-grip-vertical"
            title="Drag to reorder"
          />
          
          <Button
            className="Button Button--icon Button--danger"
            icon="fas fa-trash"
            title="Delete slide"
            onclick={() => this.deleteSlide(slide.id)}
          />
        </div>
      </div>
    );
  }

  /**
   * Render slide content form
   */
  renderSlideContent(slide: SmartSlide) {
    return (
      <div className="SmartSlideManager-slideContent">
        <div className="slide-row">
          <div className="form-group">
            <label>Title (Optional)</label>
            <input
              className="FormControl"
              type="text"
              value={slide.content.title || ''}
              placeholder="Slide title for accessibility"
              oninput={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateSlide(slide.id, {
                  content: { ...slide.content, title: target.value }
                });
              }}
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <Select
              value={slide.settings.visibility}
              options={{
                'all': 'All Devices',
                'desktop': 'Desktop Only',
                'mobile': 'Mobile Only'
              }}
              onchange={(value: string) => {
                this.updateSlide(slide.id, {
                  settings: { ...slide.settings, visibility: value as 'all' | 'desktop' | 'mobile' }
                });
              }}
            />
          </div>
        </div>

        <div className="slide-row">
          <div className="form-group">
            <label>Image URL</label>
            <input
              className="FormControl"
              type="url"
              value={slide.content.image}
              placeholder="https://example.com/image.jpg"
              oninput={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateSlide(slide.id, {
                  content: { ...slide.content, image: target.value }
                });
              }}
            />
          </div>

          <div className="form-group">
            <label>Link URL</label>
            <input
              className="FormControl"
              type="url"
              value={slide.content.link}
              placeholder="https://example.com"
              oninput={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateSlide(slide.id, {
                  content: { ...slide.content, link: target.value }
                });
              }}
            />
          </div>
        </div>

        <div className="slide-row">
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              className="FormControl"
              value={slide.content.description || ''}
              placeholder="Brief description of the slide"
              rows={2}
              oninput={(e: Event) => {
                const target = e.target as HTMLTextAreaElement;
                this.updateSlide(slide.id, {
                  content: { ...slide.content, description: target.value }
                });
              }}
            />
          </div>

          <div className="form-group">
            <label>Link Target</label>
            <Select
              value={slide.settings.target}
              options={{
                '_blank': 'New Tab',
                '_self': 'Same Tab'
              }}
              onchange={(value: string) => {
                this.updateSlide(slide.id, {
                  settings: { ...slide.settings, target: value as '_blank' | '_self' }
                });
              }}
            />
          </div>
        </div>

        {slide.content.image && this.renderImagePreview(slide.content.image)}
        {this.renderAnalyticsInfo(slide)}
      </div>
    );
  }

  /**
   * Render validation messages
   */
  renderValidationMessages(validation: SlideValidationResult) {
    if (validation.isValid && (!validation.warnings || validation.warnings.length === 0)) {
      return null;
    }

    return (
      <div className="SmartSlideManager-validation">
        {!validation.isValid && (
          <div className="validation-errors">
            {validation.errors.map((error, index) => (
              <div key={index} className="validation-message error">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            ))}
          </div>
        )}

        {validation.warnings && validation.warnings.length > 0 && (
          <div className="validation-warnings">
            {validation.warnings.map((warning, index) => (
              <div key={index} className="validation-message warning">
                <i className="fas fa-exclamation-circle"></i>
                {warning}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * Render image preview
   */
  renderImagePreview(imageUrl: string) {
    return (
      <div className="SmartSlideManager-imagePreview">
        <img
          src={imageUrl}
          alt="Slide preview"
          onload={() => m.redraw()}
          onerror={() => m.redraw()}
        />
      </div>
    );
  }

  /**
   * Render slide analytics info
   */
  renderAnalyticsInfo(slide: SmartSlide) {
    return (
      <div className="SmartSlideManager-slideAnalytics">
        <small className="analytics-info">
          <span>👁 {slide.analytics.impressions} impressions</span>
          <span>👆 {slide.analytics.clicks} clicks</span>
          {slide.analytics.last_clicked && (
            <span>🕐 Last clicked: {new Date(slide.analytics.last_clicked).toLocaleDateString()}</span>
          )}
        </small>
      </div>
    );
  }

  /**
   * Render add button
   */
  renderAddButton() {
    return (
      <div className="SmartSlideManager-addButton">
        <Button
          className="Button Button--primary Button--block"
          icon="fas fa-plus"
          onclick={() => this.addSlide()}
        >
          {app.translator.trans('wusong8899-client1.admin.AddSlide')}
        </Button>
      </div>
    );
  }
}