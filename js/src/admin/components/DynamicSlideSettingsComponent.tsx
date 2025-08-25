import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import m from 'mithril';

interface SlideData {
  id: number;
  link: string;
  image: string;
}

interface DynamicSlideSettingsComponentAttrs {
  extensionId: string;
  maxSlides?: number;
}

/**
 * Dynamic component for managing advertisement slide settings with add/delete functionality
 */
export default class DynamicSlideSettingsComponent extends Component<DynamicSlideSettingsComponentAttrs> {
  private slides: SlideData[] = [];
  private loading = false;
  private nextId = 1;

  oninit(vnode: any) {
    super.oninit(vnode);
    this.loadExistingSlides();
  }

  /**
   * Load existing slides from settings
   */
  private loadExistingSlides() {
    const { extensionId, maxSlides = 30 } = this.attrs;
    const slides: SlideData[] = [];
    
    // Load existing slides from settings
    for (let i = 1; i <= maxSlides; i++) {
      const linkKey = `${extensionId}.Link${i}`;
      const imageKey = `${extensionId}.Image${i}`;
      const link = app.data.settings[linkKey] || '';
      const image = app.data.settings[imageKey] || '';
      
      // Only include slides that have at least one field filled
      if (link || image) {
        slides.push({
          id: i,
          link,
          image
        });
        this.nextId = Math.max(this.nextId, i + 1);
      }
    }
    
    this.slides = slides;
    
    // If no slides exist, add one empty slide to start with
    if (slides.length === 0) {
      this.addSlide();
    }
  }

  /**
   * Add a new slide
   */
  private addSlide() {
    const newSlide: SlideData = {
      id: this.nextId++,
      link: '',
      image: ''
    };
    
    this.slides.push(newSlide);
    m.redraw();
  }

  /**
   * Remove a slide
   */
  private removeSlide(slideId: number) {
    const { extensionId } = this.attrs;
    const slideIndex = this.slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const slide = this.slides[slideIndex];
    
    // Remove from backend
    this.saveSetting(`${extensionId}.Link${slide.id}`, '');
    this.saveSetting(`${extensionId}.Image${slide.id}`, '');
    
    // Remove from local state
    this.slides.splice(slideIndex, 1);
    
    // Ensure at least one slide exists
    if (this.slides.length === 0) {
      this.addSlide();
    }
    
    m.redraw();
  }

  /**
   * Update slide data
   */
  private updateSlide(slideId: number, field: 'link' | 'image', value: string) {
    const { extensionId } = this.attrs;
    const slide = this.slides.find(s => s.id === slideId);
    
    if (!slide) return;
    
    slide[field] = value;
    
    // Save to backend
    const settingKey = field === 'link' 
      ? `${extensionId}.Link${slide.id}` 
      : `${extensionId}.Image${slide.id}`;
    
    this.saveSetting(settingKey, value);
  }

  /**
   * Save setting to backend with debouncing
   */
  private saveSetting(key: string, value: string) {
    // Clear existing timeout for this key
    const timeoutKey = `saveTimeout_${key}`;
    clearTimeout((this as any)[timeoutKey]);
    
    // Set new timeout
    (this as any)[timeoutKey] = setTimeout(() => {
      app.data.settings[key] = value;
      
      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/settings',
        body: {
          [key]: value
        }
      }).catch(() => {
        // Handle save error silently for now
      });
    }, 500);
  }

  view() {
    return m('div.Form-group', [
      m('label.FormLabel', 
        app.translator.trans('wusong8899-client1.admin.SlideSettings')
      ),
      m('div.helpText', 
        app.translator.trans('wusong8899-client1.admin.SlideSettingsHelp')
      ),

      m('div.DynamicSlideSettings', [
        // Slides list
        this.slides.map((slide, index) => this.renderSlide(slide, index)),
        
        // Add button
        m('div.DynamicSlideSettings-addButton', [
          m(Button, {
            className: 'Button Button--primary',
            icon: 'fas fa-plus',
            onclick: () => this.addSlide()
          }, app.translator.trans('wusong8899-client1.admin.AddSlide'))
        ])
      ])
    ]);
  }

  /**
   * Render a single slide
   */
  private renderSlide(slide: SlideData, index: number) {
    return m('div.DynamicSlideSettings-slide', {
      key: slide.id
    }, [
      m('div.DynamicSlideSettings-slideHeader', [
        m('h4', app.translator.trans('wusong8899-client1.admin.SlideNumber', { number: index + 1 })),
        m(Button, {
          className: 'Button Button--danger',
          icon: 'fas fa-trash',
          onclick: () => this.removeSlide(slide.id),
          disabled: this.slides.length === 1
        }, app.translator.trans('wusong8899-client1.admin.DeleteSlide'))
      ]),
      
      m('div.DynamicSlideSettings-slideFields', [
        // Link URL field
        m('div.Form-group', [
          m('label.FormLabel', 
            app.translator.trans('wusong8899-client1.admin.SlideLink')
          ),
          m('input.FormControl', {
            type: 'url',
            placeholder: 'https://example.com',
            value: slide.link,
            oninput: (e: Event) => {
              const target = e.target as HTMLInputElement;
              this.updateSlide(slide.id, 'link', target.value);
            }
          })
        ]),
        
        // Image URL field
        m('div.Form-group', [
          m('label.FormLabel', 
            app.translator.trans('wusong8899-client1.admin.SlideImage')
          ),
          m('input.FormControl', {
            type: 'url',
            placeholder: 'https://example.com/image.jpg',
            value: slide.image,
            oninput: (e: Event) => {
              const target = e.target as HTMLInputElement;
              this.updateSlide(slide.id, 'image', target.value);
            }
          })
        ])
      ])
    ]);
  }
}
