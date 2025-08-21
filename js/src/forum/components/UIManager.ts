import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import app from 'flarum/forum/app';
import { getElementById, querySelectorAll, createElement, appendChild, querySelector, removeElement, setStyles, prependChild } from '../utils/DOMUtils';
import { isMobileDevice, getSwiperConfig } from '../utils/MobileDetection';

/**
 * UI Manager for handling various UI components
 */
export class UIManager {

    /**
     * Change category layout to swiper-based layout
     */
    async changeCategoryLayout(): Promise<void> {
        if (getElementById("swiperTagContainer")) {
            return; // Already exists
        }

        const tagTiles = querySelectorAll(".TagTile");
        if (tagTiles.length === 0) {
            return;
        }

        const container = this.createTagSwiperContainer();
        const swiper = this.createTagSwiper(container);
        const wrapper = this.createTagSwiperWrapper(swiper);

        this.populateTagSlides(wrapper, tagTiles);
        this.appendTagContainer(container);
        this.addTagSwiperContent(container);
        this.removeOriginalTagTiles();
        this.setupMobileStyles();
        this.initializeTagSwiper();
    }

    /**
     * Create tag swiper container
     */
    private createTagSwiperContainer(): HTMLElement {
        const container = createElement('div', {
            className: 'swiperTagContainer',
            id: 'swiperTagContainer'
        });

        const textContainer = createElement('div', {
            className: 'TagTextOuterContainer'
        });

        appendChild(container, textContainer);
        return container;
    }

    /**
     * Create tag swiper element
     */
    private createTagSwiper(container: HTMLElement): HTMLElement {
        const textContainer = container.querySelector('.TagTextOuterContainer');
        const swiper = createElement('div', {
            className: 'swiper tagSwiper'
        });

        if (textContainer) {
            appendChild(textContainer, swiper);
        }

        return swiper;
    }

    /**
     * Create tag swiper wrapper
     */
    private createTagSwiperWrapper(swiper: HTMLElement): HTMLElement {
        const wrapper = createElement('div', {
            className: 'swiper-wrapper',
            id: 'swiperTagWrapper'
        });
        appendChild(swiper, wrapper);
        return wrapper;
    }

    /**
     * Populate tag slides
     */
    private populateTagSlides(wrapper: HTMLElement, tagTiles: NodeListOf<Element>): void {
        const isMobile = isMobileDevice();

        for (let i = 0; i < tagTiles.length; i++) {
            const tag = tagTiles[i] as HTMLElement;
            const tagData = this.extractTagData(tag);

            if (tagData) {
                const slide = this.createTagSlide(tagData, isMobile);
                appendChild(wrapper, slide);
            }
        }
    }

    /**
     * Extract tag data from DOM element
     */
    private extractTagData(tag: HTMLElement): any {
        const linkElement = tag.querySelector('a') as HTMLAnchorElement;
        const nameElement = tag.querySelector('.TagTile-name') as HTMLElement;
        const descElement = tag.querySelector('.TagTile-description') as HTMLElement;

        if (!linkElement || !nameElement) {
            return null;
        }

        // Get background from flarum-tag-background plugin or fallback to computed style
        const backgroundImage = this.getTagBackgroundImage(linkElement.href, tag);
        const computedStyle = window.getComputedStyle(tag);
        const background = backgroundImage || computedStyle.background;

        return {
            url: linkElement.href,
            background: background,
            name: nameElement.textContent || '',
            nameColor: window.getComputedStyle(nameElement).color,
            description: descElement ? descElement.textContent || '' : '',
            descColor: descElement ? window.getComputedStyle(descElement).color : ''
        };
    }

    /**
     * Get tag background image from flarum-tag-background plugin
     */
    private getTagBackgroundImage(tagUrl: string, tagElement: HTMLElement): string | null {
        try {
            // Extract tag slug from URL
            const url = new URL(tagUrl, window.location.origin);
            const parts = url.pathname.split('/').filter(Boolean);
            const tIndex = parts.indexOf('t');
            const tagsIndex = parts.indexOf('tags');

            let slug: string | null = null;
            if (tIndex !== -1 && parts[tIndex + 1]) {
                slug = parts[tIndex + 1];
            } else if (tagsIndex !== -1 && parts[tagsIndex + 1]) {
                slug = parts[tagsIndex + 1];
            } else if (parts.length > 0) {
                slug = parts[parts.length - 1];
            }

            if (!slug) return null;

            // Get tag from Flarum store
            const tags = app.store.all('tags') as any[];
            const tagModel = tags.find((t: any) => {
                const tagSlug = typeof t.slug === 'function' ? t.slug() : t.attribute && t.attribute('slug');
                return tagSlug === slug;
            });

            if (!tagModel) return null;

            // Get background URL from tag model
            const bgUrl = tagModel.attribute ? tagModel.attribute('wusong8899BackgroundURL') : null;

            if (bgUrl) {
                return `url(${bgUrl})`;
            }

            return null;
        } catch {
            // Fallback to checking inline styles set by flarum-tag-background
            const inlineBackground = tagElement.style.background;
            if (inlineBackground && inlineBackground.includes('url(')) {
                return inlineBackground;
            }
            return null;
        }
    }

    /**
     * Create individual tag slide
     */
    private createTagSlide(tagData: any, isMobile: boolean): HTMLElement {
        const slide = createElement('div', {
            className: 'swiper-slide swiper-slide-tag'
        });

        const innerClass = isMobile ? 'swiper-slide-tag-inner-mobile' : 'swiper-slide-tag-inner';
        const backgroundStyle = `background:${tagData.background};background-size: cover;background-position: center;background-repeat: no-repeat;`;

        // Check if there's a background image (from flarum-tag-background plugin)
        const hasBackgroundImage = this.hasBackgroundImage(tagData.background);

        // If there's a background image, hide the text; otherwise show it
        const textContent = hasBackgroundImage ? '' : `
            <div style='font-weight:bold;font-size:14px;color:${tagData.nameColor}'>
                ${tagData.name}
            </div>
        `;

        slide.innerHTML = `
            <a href='${tagData.url}'>
                <div class='${innerClass}' style='${backgroundStyle}'>
                    ${textContent}
                </div>
            </a>
        `;

        return slide;
    }

    /**
     * Check if background contains an image URL
     */
    private hasBackgroundImage(background: string): boolean {
        if (!background) return false;

        // Check if background contains url() function
        return background.includes('url(') && !background.includes('url()');
    }

    /**
     * Append tag container to DOM
     */
    private appendTagContainer(container: HTMLElement): void {
        const contentElement = querySelector("#content .container .TagsPage-content");
        if (contentElement) {
            prependChild(contentElement, container);
        }
    }

    /**
     * Add additional content to tag container
     */
    private addTagSwiperContent(container: HTMLElement): void {
        const textContainer = container.querySelector('.TagTextOuterContainer');
        if (textContainer) {
            const titleElement = createElement('div', {
                className: 'TagTextContainer'
            }, "<div class='TagTextIcon'></div>中文玩家社区资讯");

            prependChild(textContainer, titleElement);

            const socialButtons = this.createSocialButtonsHTML();
            textContainer.insertAdjacentHTML('beforeend', socialButtons);
        }
    }

    /**
     * Create social buttons HTML
     */
    private createSocialButtonsHTML(): string {
        const extensionId = 'wusong8899-client1-header-adv';

        // Define social media platforms with their settings keys and default icons
        const socialPlatforms = [
            {
                urlKey: `${extensionId}.SocialKickUrl`,
                iconKey: `${extensionId}.SocialKickIcon`,
                defaultIcon: ''
            },
            {
                urlKey: `${extensionId}.SocialFacebookUrl`,
                iconKey: `${extensionId}.SocialFacebookIcon`,
                defaultIcon: ''
            },
            {
                urlKey: `${extensionId}.SocialTwitterUrl`,
                iconKey: `${extensionId}.SocialTwitterIcon`,
                defaultIcon: ''
            },
            {
                urlKey: `${extensionId}.SocialYouTubeUrl`,
                iconKey: `${extensionId}.SocialYouTubeIcon`,
                defaultIcon: ''
            },
            {
                urlKey: `${extensionId}.SocialInstagramUrl`,
                iconKey: `${extensionId}.SocialInstagramIcon`,
                defaultIcon: ''
            }
        ];

        // Generate social buttons HTML
        const socialButtons = socialPlatforms
            .map((platform, index) => {
                const url = app.forum.attribute(platform.urlKey) || '';
                const iconUrl = app.forum.attribute(platform.iconKey) || platform.defaultIcon;

                // Only render button if both URL and icon are provided
                if (!url.trim() || !iconUrl.trim()) {
                    return '';
                }

                const marginStyle = index > 0 ? 'margin-left: 20px;' : '';
                return `<img onClick="window.open('${url}', '_blank')" style="width: 32px;${marginStyle}" src="${iconUrl}">`;
            })
            .filter(button => button !== '') // Remove empty buttons
            .join('');

        // Only render the container if there are social buttons
        if (!socialButtons) {
            return '';
        }

        return `
            <div style="text-align:center;padding-top: 10px;">
                <button class="Button Button--primary" type="button" style="font-weight: normal !important; color:#ffa000; background: #1a1d2e !important;border-radius: 2rem !important;">
                    <div style="margin-top: 5px;" class="Button-label">
                        ${socialButtons}
                    </div>
                </button>
            </div>
        `;
    }

    /**
     * Remove original tag tiles
     */
    private removeOriginalTagTiles(): void {
        const tagTiles = querySelector(".TagTiles");
        if (tagTiles) {
            removeElement(tagTiles);
        }
    }

    /**
     * Setup mobile-specific styles
     */
    private setupMobileStyles(): void {
        if (isMobileDevice()) {
            const app = getElementById("app");
            const appContent = querySelector(".App-content") as HTMLElement;

            if (app) {
                setStyles(app, { 'overflow-x': 'hidden' });
            }

            if (appContent) {
                setStyles(appContent, {
                    'min-height': 'auto',
                    'background': ''
                });
            }
        }
    }

    /**
     * Initialize tag swiper
     */
    private initializeTagSwiper(): void {
        try {
            const config = getSwiperConfig();
            const _tagSwiper = new Swiper(".tagSwiper", {
                loop: true,
                spaceBetween: config.spaceBetween,
                slidesPerView: config.slidesPerView,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                modules: [Autoplay]
            });
        } catch (error) {
            console.error('Failed to initialize tag swiper:', error);
        }
    }
}
