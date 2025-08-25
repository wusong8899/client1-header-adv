import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import app from 'flarum/forum/app';
import { SlideService } from '../../common/services/SlideService';
import { getElementById, querySelector, createElement, appendChild, setStyles, removeElement } from '../utils/DOMUtils';
import { isMobileDevice } from '../utils/MobileDetection';
import { defaultConfig } from '../../common/config';
import type { SmartSlide } from '../../common/types';

/**
 * Optimized Slideshow Manager with performance improvements
 * - Uses new JSON-based slide data
 * - Implements lazy loading
 * - Memory leak prevention
 * - Enhanced mobile optimization
 * - Analytics tracking
 */
export class OptimizedSlideshowManager {
    private swiper: Swiper | null = null;
    private container: HTMLElement | null = null;
    private slideService = SlideService.getInstance();
    private intersectionObserver: IntersectionObserver | null = null;
    private performanceObserver: PerformanceObserver | null = null;
    private isInitialized = false;
    private readonly checkInterval = 5000; // Check for updates every 5 seconds

    constructor() {
        this.setupPerformanceMonitoring();
    }

    /**
     * Initialize slideshow with performance optimizations
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Load slides with caching
            const slides = await this.slideService.getAllSlides();
            const activeSlides = slides.filter(slide => 
                slide.settings.active && this.isSlideVisible(slide)
            );

            if (activeSlides.length === 0) {
                console.info('No active slides to display');
                return;
            }

            // Create container with optimizations
            this.container = this.createOptimizedContainer();
            
            // Populate slides with lazy loading
            this.populateSlides(activeSlides);
            
            // Initialize Swiper with performance settings
            this.initializeOptimizedSwiper();
            
            // Setup intersection observer for analytics
            this.setupIntersectionObserver();
            
            // Setup periodic updates
            this.setupPeriodicUpdates();
            
            this.isInitialized = true;
            console.info(`Slideshow initialized with ${activeSlides.length} slides`);
        } catch (error) {
            console.error('Failed to initialize slideshow:', error);
        }
    }

    /**
     * Destroy slideshow and cleanup resources
     */
    destroy(): void {
        if (this.swiper) {
            this.swiper.destroy(true, true);
            this.swiper = null;
        }

        if (this.container) {
            removeElement(this.container);
            this.container = null;
        }

        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }

        this.isInitialized = false;
    }

    /**
     * Update slides dynamically
     */
    async updateSlides(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const slides = await this.slideService.getAllSlides(true);
            const activeSlides = slides.filter(slide => 
                slide.settings.active && this.isSlideVisible(slide)
            );

            // Re-populate and update Swiper
            if (this.container && this.swiper) {
                this.populateSlides(activeSlides);
                this.swiper.update();
            }
        } catch (error) {
            console.error('Failed to update slides:', error);
        }
    }

    /**
     * Create optimized container with mobile adaptations
     */
    private createOptimizedContainer(): HTMLElement {
        const container = createElement('div', {
            className: 'client1-header-adv-wrapper optimized-slideshow',
            id: defaultConfig.slider.dom.containerId
        });

        // Mobile-specific optimizations
        if (isMobileDevice()) {
            this.applyMobileOptimizations(container);
        }

        // Append to DOM efficiently
        const targetElement = document.body.firstElementChild;
        if (targetElement) {
            targetElement.insertAdjacentElement('afterend', container);
        }

        return container;
    }

    /**
     * Apply mobile-specific optimizations
     */
    private applyMobileOptimizations(container: HTMLElement): void {
        const screenWidth = window.innerWidth;
        const optimizedWidth = Math.min(screenWidth * 1.8, 800); // Cap max width
        
        setStyles(container, {
            'width': `${optimizedWidth}px`,
            'margin-left': `${-(optimizedWidth * 0.25)}px`,
            'transform': 'translateZ(0)', // Hardware acceleration
            'will-change': 'transform'
        });
    }

    /**
     * Populate slides with lazy loading
     */
    private populateSlides(slides: SmartSlide[]): void {
        if (!this.container) return;

        // Clear existing content
        this.container.innerHTML = '';

        const swiperWrapper = createElement('div', { className: 'swiper adSwiper' });
        const swiperContainer = createElement('div', { className: 'swiper-wrapper' });

        slides
            .sort((a, b) => a.settings.order - b.settings.order)
            .forEach((slide, index) => {
                const slideElement = this.createSlideElement(slide, index === 0);
                appendChild(swiperContainer, slideElement);
            });

        appendChild(swiperWrapper, swiperContainer);

        // Add navigation and pagination
        this.addSwiperControls(swiperWrapper);
        
        appendChild(this.container, swiperWrapper);
    }

    /**
     * Create individual slide element with lazy loading
     */
    private createSlideElement(slide: SmartSlide, isFirst: boolean): HTMLElement {
        const slideDiv = createElement('div', { className: 'swiper-slide' });
        
        if (slide.content.link) {
            const link = createElement('a') as HTMLAnchorElement;
            link.href = slide.content.link;
            link.target = slide.settings.target;
            
            if (slide.content.title) {
                link.title = slide.content.title;
            }

            // Add click tracking
            link.addEventListener('click', () => {
                this.slideService.trackClick(slide.id);
            });

            appendChild(slideDiv, link);
            
            if (slide.content.image) {
                const img = this.createOptimizedImage(slide, isFirst);
                appendChild(link, img);
            }
        } else if (slide.content.image) {
            const img = this.createOptimizedImage(slide, isFirst);
            appendChild(slideDiv, img);
        }

        return slideDiv;
    }

    /**
     * Create optimized image with lazy loading
     */
    private createOptimizedImage(slide: SmartSlide, isFirst: boolean): HTMLImageElement {
        const img = createElement('img') as HTMLImageElement;
        
        img.alt = slide.content.title || 'Advertisement slide';
        img.className = 'slide-image';
        
        // Preload first image, lazy load others
        if (isFirst) {
            img.src = slide.content.image;
        } else {
            img.dataset.src = slide.content.image;
            img.className += ' lazy';
        }

        // Add loading optimization
        img.loading = isFirst ? 'eager' : 'lazy';
        img.decoding = 'async';

        // Image error handling
        img.addEventListener('error', () => {
            console.warn(`Failed to load slide image: ${slide.content.image}`);
            img.style.display = 'none';
        });

        // Track impression when image loads
        img.addEventListener('load', () => {
            this.slideService.trackImpression(slide.id);
        });

        return img;
    }

    /**
     * Add Swiper navigation controls
     */
    private addSwiperControls(swiperWrapper: HTMLElement): void {
        const pagination = createElement('div', { className: 'swiper-pagination' });
        const prevButton = createElement('div', { className: 'swiper-button-prev' });
        const nextButton = createElement('div', { className: 'swiper-button-next' });

        appendChild(swiperWrapper, pagination);
        appendChild(swiperWrapper, prevButton);
        appendChild(swiperWrapper, nextButton);
    }

    /**
     * Initialize Swiper with optimized settings
     */
    private initializeOptimizedSwiper(): void {
        if (!this.container) return;

        const swiperElement = querySelector('.adSwiper', this.container);
        if (!swiperElement) return;

        // Get transition time
        const transitionTime = this.getTransitionTime();

        this.swiper = new Swiper(swiperElement as HTMLElement, {
            modules: [EffectCoverflow, Navigation, Pagination, Autoplay],
            
            // Performance optimizations
            speed: 600,
            touchRatio: 0.8,
            resistance: true,
            resistanceRatio: 0.5,
            
            // Visual settings
            effect: 'coverflow',
            centeredSlides: true,
            slidesPerView: isMobileDevice() ? 1.2 : 2,
            spaceBetween: isMobileDevice() ? 15 : 30,
            
            coverflowEffect: {
                rotate: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
                stretch: 0,
            },
            
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            },
            
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            autoplay: {
                delay: transitionTime,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },

            // Lazy loading
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 2,
            },

            // Accessibility
            a11y: {
                enabled: true,
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
            },

            // Events
            on: {
                slideChange: () => {
                    this.onSlideChange();
                },
                init: () => {
                    this.setupLazyLoading();
                }
            }
        });
    }

    /**
     * Handle slide change events
     */
    private onSlideChange(): void {
        if (!this.swiper) return;

        // Track current slide impression
        const activeIndex = this.swiper.activeIndex;
        const slides = this.container?.querySelectorAll('.swiper-slide');
        
        if (slides && slides[activeIndex]) {
            const slideElement = slides[activeIndex];
            const img = slideElement.querySelector('img');
            
            if (img && img.dataset.slideId) {
                this.slideService.trackImpression(img.dataset.slideId);
            }
        }
    }

    /**
     * Setup lazy loading for images
     */
    private setupLazyLoading(): void {
        const lazyImages = this.container?.querySelectorAll('img.lazy');
        
        if (!lazyImages || lazyImages.length === 0) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    /**
     * Setup intersection observer for analytics
     */
    private setupIntersectionObserver(): void {
        if (!this.container) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Slideshow is visible, resume autoplay
                    if (this.swiper && this.swiper.autoplay) {
                        this.swiper.autoplay.start();
                    }
                } else {
                    // Slideshow is not visible, pause autoplay
                    if (this.swiper && this.swiper.autoplay) {
                        this.swiper.autoplay.stop();
                    }
                }
            });
        }, {
            threshold: 0.5
        });

        this.intersectionObserver.observe(this.container);
    }

    /**
     * Setup periodic updates
     */
    private setupPeriodicUpdates(): void {
        setInterval(() => {
            this.updateSlides();
        }, this.checkInterval);
    }

    /**
     * Setup performance monitoring
     */
    private setupPerformanceMonitoring(): void {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('slideshow')) {
                        console.debug(`Slideshow performance: ${entry.name} took ${entry.duration}ms`);
                    }
                }
            });

            this.performanceObserver.observe({ entryTypes: ['measure'] });
        }
    }

    /**
     * Check if slide is visible based on device and settings
     */
    private isSlideVisible(slide: SmartSlide): boolean {
        const { visibility } = slide.settings;
        
        if (visibility === 'all') return true;
        if (visibility === 'mobile' && isMobileDevice()) return true;
        if (visibility === 'desktop' && !isMobileDevice()) return true;
        
        return false;
    }

    /**
     * Get transition time from settings
     */
    private getTransitionTime(): number {
        try {
            const forum = (app as any)?.forum;
            const attrFn = forum?.attribute;
            const transitionTime = typeof attrFn === 'function' 
                ? attrFn.call(forum, 'Client1HeaderAdvTransitionTime')
                : undefined;
            
            return transitionTime ? parseInt(String(transitionTime)) : defaultConfig.slider.defaultTransitionTime;
        } catch {
            return defaultConfig.slider.defaultTransitionTime;
        }
    }
}