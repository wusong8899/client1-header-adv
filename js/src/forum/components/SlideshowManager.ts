import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import app from 'flarum/forum/app';
import { getElementById, querySelector, querySelectorAll, createElement, appendChild, setStyles, prependChild, removeElement } from '../utils/DOMUtils';
import { isMobileDevice } from '../utils/MobileDetection';
import { defaultConfig } from '../../common/config';

/**
 * Slideshow manager for header advertisements
 */
export class SlideshowManager {
    private swiper: Swiper | null = null;
    private container: HTMLElement | null = null;
    private readonly maxSlides = defaultConfig.slider.maxSlides;
    private readonly checkTime = defaultConfig.slider.checkTime;


    /**
     * Safely read a forum attribute if available
     */
    private getForumAttribute(key: string): any {
        try {
            const forum = app.forum;
            const attrFn = forum?.attribute;
            return typeof attrFn === 'function' ? attrFn.call(forum, key) : undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Initialize and attach slideshow to the DOM
     * @param {any} vdom - Virtual DOM node
     */
    attachAdvertiseHeader(vdom: any): void {
        if (isMobileDevice()) {
            this.setupMobileUI();
        }

        this.hideUIElements();
        this.waitForDOMReady(vdom);
    }

    /**
     * Setup mobile-specific UI modifications
     */
    private setupMobileUI(): void {
        // Only modify UI for non-logged users
        if (!app.session.user) {
            const newDiscussionButton = querySelector(".item-newDiscussion .Button-label");
            if (newDiscussionButton) {
                (newDiscussionButton as HTMLElement).innerHTML = "<div class='buttonRegister'>登录</div>";
                setStyles(newDiscussionButton as HTMLElement, {
                    'display': 'block',
                    'font-size': '14px',
                    'word-spacing': '-1px'
                });
            }
        }
    }

    /**
     * Hide unnecessary UI elements
     */
    private hideUIElements(): void {
        const iconElement = querySelector(".item-newDiscussion i");
        if (iconElement) {
            setStyles(iconElement as HTMLElement, { 'display': 'none' });
        }

        const navElements = querySelectorAll(".item-nav");
        navElements.forEach(element => {
            removeElement(element);
        });

        const tagTiles = querySelector(".TagTiles");
        if (tagTiles) {
            setStyles(tagTiles as HTMLElement, { 'display': 'none' });
        }
    }

    /**
     * Wait for DOM to be ready and create slideshow
     * @param {any} vdom - Virtual DOM node
     */
    private waitForDOMReady(vdom: any): void {
        const task = setInterval(() => {
            if (vdom.dom) {
                clearInterval(task);
                this.createSlideshow();
            }
        }, this.checkTime);
    }

    /**
     * Create the main slideshow
     */
    private createSlideshow(): void {
        if (getElementById(defaultConfig.slider.dom.containerId)) {
            return; // Already exists
        }

        const transitionTime = this.getTransitionTime();
        const container = this.createSlideshowContainer();
        const swiper = this.createSwiperElement(container);
        const wrapper = this.createSwiperWrapper(swiper);

        this.populateSlides(wrapper);
        this.addSwiperControls(swiper);
        this.appendToDOM(container);
        this.initializeSwiper(transitionTime);
    }

    /**
     * Get transition time from settings
     * @returns {number} Transition time in milliseconds
     */
    private getTransitionTime(): number {
        const transitionTime = this.getForumAttribute('Client1HeaderAdvTransitionTime');
        return transitionTime ? parseInt(String(transitionTime)) : defaultConfig.slider.defaultTransitionTime;
    }

    /**
     * Create slideshow container
     * @returns {HTMLElement} Container element
     */
    private createSlideshowContainer(): HTMLElement {
        const container = createElement('div', {
            className: 'client1-header-adv-wrapper swiperAdContainer',
            id: defaultConfig.slider.dom.containerId
        });

        if (isMobileDevice()) {
            const screenWidth = window.innerWidth;
            const styleWidth = screenWidth * 2 - 50;
            setStyles(container, {
                'width': `${styleWidth}px`,
                'margin-left': `${-(styleWidth * 0.254)}px`
            });
        }

        this.container = container;
        return container;
    }

    /**
     * Create Swiper element
     * @param {HTMLElement} container - Parent container
     * @returns {HTMLElement} Swiper element
     */
    private createSwiperElement(container: HTMLElement): HTMLElement {
        const swiper = createElement('div', {
            className: `swiper ${defaultConfig.slider.dom.swiperClass}`
        });
        appendChild(container, swiper);
        return swiper;
    }

    /**
     * Create Swiper wrapper
     * @param {HTMLElement} swiper - Swiper element
     * @returns {HTMLElement} Wrapper element
     */
    private createSwiperWrapper(swiper: HTMLElement): HTMLElement {
        const wrapper = createElement('div', {
            className: 'swiper-wrapper'
        });
        appendChild(swiper, wrapper);
        return wrapper;
    }

    /**
     * Populate slides with advertisement images
     * @param {HTMLElement} wrapper - Swiper wrapper element
     */
    private populateSlides(wrapper: HTMLElement): void {
        for (let i = 1; i <= this.maxSlides; i++) {
            const imageSrc = this.getForumAttribute(`Client1HeaderAdvImage${i}`);
            const imageLink = this.getForumAttribute(`Client1HeaderAdvLink${i}`);

            if (imageSrc) {
                const slide = this.createSlide(String(imageSrc), String(imageLink || ''));
                appendChild(wrapper, slide);
            }
        }
    }

    /**
     * Create individual slide
     * @param {string} imageSrc - Image source URL
     * @param {string} imageLink - Link URL
     * @returns {HTMLElement} Slide element
     */
    private createSlide(imageSrc: string, imageLink: string): HTMLElement {
        const slide = createElement('div', {
            className: 'swiper-slide'
        });

        const clickHandler = imageLink ? `window.location.href="${imageLink}"` : '';
        slide.innerHTML = `<img onclick='${clickHandler}' src='${imageSrc}' />`;

        return slide;
    }

    /**
     * Add Swiper navigation and pagination controls
     * @param {HTMLElement} swiper - Swiper element
     */
    private addSwiperControls(swiper: HTMLElement): void {
        const nextButton = createElement('div', {
            className: 'swiper-button-next'
        });
        const prevButton = createElement('div', {
            className: 'swiper-button-prev'
        });
        const pagination = createElement('div', {
            className: 'swiper-pagination'
        });

        appendChild(swiper, nextButton);
        appendChild(swiper, prevButton);
        appendChild(swiper, pagination);
    }

    /**
     * Append slideshow to DOM
     * @param {HTMLElement} container - Container element
     */
    private appendToDOM(container: HTMLElement): void {
        const contentContainer = querySelector("#content .container");
        if (contentContainer) {
            prependChild(contentContainer, container);
        }
    }

    /**
     * Initialize Swiper instance
     * @param {number} transitionTime - Transition time in milliseconds
     */
    private initializeSwiper(transitionTime: number): void {
        try {
            this.swiper = new Swiper(`.${defaultConfig.slider.dom.swiperClass}`, {
                autoplay: {
                    delay: transitionTime,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                loop: true,
                spaceBetween: defaultConfig.slider.swiper.spaceBetween,
                effect: defaultConfig.slider.swiper.effect,
                centeredSlides: defaultConfig.slider.swiper.centeredSlides,
                slidesPerView: defaultConfig.slider.swiper.slidesPerView,
                coverflowEffect: {
                    rotate: defaultConfig.slider.swiper.coverflowEffect.rotate,
                    depth: defaultConfig.slider.swiper.coverflowEffect.depth,
                    modifier: defaultConfig.slider.swiper.coverflowEffect.modifier,
                    slideShadows: defaultConfig.slider.swiper.coverflowEffect.slideShadows,
                    stretch: defaultConfig.slider.swiper.coverflowEffect.stretch,
                },
                pagination: {
                    el: defaultConfig.slider.swiper.pagination.el,
                    type: defaultConfig.slider.swiper.pagination.type as any,
                },
                navigation: {
                    nextEl: defaultConfig.slider.swiper.navigation.nextEl,
                    prevEl: defaultConfig.slider.swiper.navigation.prevEl,
                },
                modules: [EffectCoverflow, Navigation, Pagination, Autoplay]
            });
        } catch (error) {
            console.error('Failed to initialize Swiper:', error);
        }
    }

    /**
     * Destroy slideshow instance
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
    }
}
