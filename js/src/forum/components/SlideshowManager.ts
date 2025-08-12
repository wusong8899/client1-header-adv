import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import app from 'flarum/forum/app';
import { DOMUtils } from '../utils/DOMUtils';
import { MobileDetection } from '../utils/MobileDetection';

/**
 * Slideshow manager for header advertisements
 */
export class SlideshowManager {
    private swiper: Swiper | null = null;
    private container: HTMLElement | null = null;
    private readonly maxSlides = 30;
    private readonly checkTime = 10;


    /**
     * Safely read a forum attribute if available
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
     * Initialize and attach slideshow to the DOM
     * @param {any} vdom - Virtual DOM node
     */
    attachAdvertiseHeader(vdom: any): void {
        if (MobileDetection.isMobileDevice()) {
            this.setupMobileUI();
        }

        this.hideUIElements();
        this.waitForDOMReady(vdom);
    }

    /**
     * Setup mobile-specific UI modifications
     */
    private setupMobileUI(): void {
        const newDiscussionButton = DOMUtils.querySelector(".item-newDiscussion .Button-label");
        if (newDiscussionButton) {
            (newDiscussionButton as HTMLElement).innerHTML = "<div class='buttonRegister'>登录</div>";
            DOMUtils.setStyles(newDiscussionButton as HTMLElement, {
                'display': 'block',
                'font-size': '14px',
                'word-spacing': '-1px'
            });
        }
    }

    /**
     * Hide unnecessary UI elements
     */
    private hideUIElements(): void {
        const iconElement = DOMUtils.querySelector(".item-newDiscussion i");
        if (iconElement) {
            DOMUtils.setStyles(iconElement as HTMLElement, { 'display': 'none' });
        }

        const navElements = DOMUtils.querySelectorAll(".item-nav");
        navElements.forEach(element => {
            DOMUtils.removeElement(element);
        });

        const tagTiles = DOMUtils.querySelector(".TagTiles");
        if (tagTiles) {
            DOMUtils.setStyles(tagTiles as HTMLElement, { 'display': 'none' });
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
        if (DOMUtils.getElementById("swiperAdContainer")) {
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
        return transitionTime ? parseInt(String(transitionTime)) : 5000;
    }

    /**
     * Create slideshow container
     * @returns {HTMLElement} Container element
     */
    private createSlideshowContainer(): HTMLElement {
        const container = DOMUtils.createElement('div', {
            className: 'swiperAdContainer',
            id: 'swiperAdContainer'
        });

        if (MobileDetection.isMobileDevice()) {
            const screenWidth = window.innerWidth;
            const styleWidth = screenWidth * 2 - 50;
            DOMUtils.setStyles(container, {
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
        const swiper = DOMUtils.createElement('div', {
            className: 'swiper adSwiper'
        });
        DOMUtils.appendChild(container, swiper);
        return swiper;
    }

    /**
     * Create Swiper wrapper
     * @param {HTMLElement} swiper - Swiper element
     * @returns {HTMLElement} Wrapper element
     */
    private createSwiperWrapper(swiper: HTMLElement): HTMLElement {
        const wrapper = DOMUtils.createElement('div', {
            className: 'swiper-wrapper'
        });
        DOMUtils.appendChild(swiper, wrapper);
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
                DOMUtils.appendChild(wrapper, slide);
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
        const slide = DOMUtils.createElement('div', {
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
        const nextButton = DOMUtils.createElement('div', {
            className: 'swiper-button-next'
        });
        const prevButton = DOMUtils.createElement('div', {
            className: 'swiper-button-prev'
        });
        const pagination = DOMUtils.createElement('div', {
            className: 'swiper-pagination'
        });

        DOMUtils.appendChild(swiper, nextButton);
        DOMUtils.appendChild(swiper, prevButton);
        DOMUtils.appendChild(swiper, pagination);
    }

    /**
     * Append slideshow to DOM
     * @param {HTMLElement} container - Container element
     */
    private appendToDOM(container: HTMLElement): void {
        const contentContainer = DOMUtils.querySelector("#content .container");
        if (contentContainer) {
            DOMUtils.prependChild(contentContainer, container);
        }
    }

    /**
     * Initialize Swiper instance
     * @param {number} transitionTime - Transition time in milliseconds
     */
    private initializeSwiper(transitionTime: number): void {
        try {
            this.swiper = new Swiper(".adSwiper", {
                autoplay: {
                    delay: transitionTime,
                },
                loop: true,
                spaceBetween: 30,
                effect: "coverflow",
                centeredSlides: true,
                slidesPerView: 2,
                coverflowEffect: {
                    rotate: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                    stretch: 0
                },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
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
            DOMUtils.removeElement(this.container);
            this.container = null;
        }
    }
}
