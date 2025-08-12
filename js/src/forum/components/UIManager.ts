import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import app from 'flarum/forum/app';
import { DOMUtils } from '../utils/DOMUtils';
import { MobileDetection } from '../utils/MobileDetection';
import { DataLoader } from '../services/DataLoader';

/**
 * UI Manager for handling various UI components
 */
export class UIManager {
    private dataLoader: DataLoader;

    constructor() {
        this.dataLoader = DataLoader.getInstance();
    }

    /**
     * Change category layout to swiper-based layout
     */
    async changeCategoryLayout(): Promise<void> {
        if (DOMUtils.getElementById("swiperTagContainer")) {
            return; // Already exists
        }

        const tagTiles = DOMUtils.querySelectorAll(".TagTile");
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
        
        await this.addTronscan();
    }

    /**
     * Create tag swiper container
     */
    private createTagSwiperContainer(): HTMLElement {
        const container = DOMUtils.createElement('div', {
            className: 'swiperTagContainer',
            id: 'swiperTagContainer'
        });

        const textContainer = DOMUtils.createElement('div', {
            className: 'TagTextOuterContainer'
        });

        DOMUtils.appendChild(container, textContainer);
        return container;
    }

    /**
     * Create tag swiper element
     */
    private createTagSwiper(container: HTMLElement): HTMLElement {
        const textContainer = container.querySelector('.TagTextOuterContainer');
        const swiper = DOMUtils.createElement('div', {
            className: 'swiper tagSwiper'
        });
        
        if (textContainer) {
            DOMUtils.appendChild(textContainer, swiper);
        }
        
        return swiper;
    }

    /**
     * Create tag swiper wrapper
     */
    private createTagSwiperWrapper(swiper: HTMLElement): HTMLElement {
        const wrapper = DOMUtils.createElement('div', {
            className: 'swiper-wrapper',
            id: 'swiperTagWrapper'
        });
        DOMUtils.appendChild(swiper, wrapper);
        return wrapper;
    }

    /**
     * Populate tag slides
     */
    private populateTagSlides(wrapper: HTMLElement, tagTiles: NodeListOf<Element>): void {
        const isMobile = MobileDetection.isMobileDevice();

        for (let i = 0; i < tagTiles.length; i++) {
            const tag = tagTiles[i] as HTMLElement;
            const tagData = this.extractTagData(tag);
            
            if (tagData) {
                const slide = this.createTagSlide(tagData, isMobile);
                DOMUtils.appendChild(wrapper, slide);
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

        return {
            url: linkElement.href,
            background: window.getComputedStyle(tag).background,
            name: nameElement.textContent || '',
            nameColor: window.getComputedStyle(nameElement).color,
            description: descElement ? descElement.textContent || '' : '',
            descColor: descElement ? window.getComputedStyle(descElement).color : ''
        };
    }

    /**
     * Create individual tag slide
     */
    private createTagSlide(tagData: any, isMobile: boolean): HTMLElement {
        const slide = DOMUtils.createElement('div', {
            className: 'swiper-slide swiper-slide-tag'
        });

        const innerClass = isMobile ? 'swiper-slide-tag-inner-mobile' : 'swiper-slide-tag-inner';
        const backgroundStyle = `background:${tagData.background};background-size: cover;background-position: center;background-repeat: no-repeat;`;
        
        slide.innerHTML = `
            <a href='${tagData.url}'>
                <div class='${innerClass}' style='${backgroundStyle}'>
                    <div style='font-weight:bold;font-size:14px;color:${tagData.nameColor}'>
                        ${tagData.name}
                    </div>
                </div>
            </a>
        `;

        return slide;
    }

    /**
     * Append tag container to DOM
     */
    private appendTagContainer(container: HTMLElement): void {
        const contentElement = DOMUtils.querySelector("#content .container .TagsPage-content");
        if (contentElement) {
            DOMUtils.prependChild(contentElement, container);
        }
    }

    /**
     * Add additional content to tag container
     */
    private addTagSwiperContent(container: HTMLElement): void {
        const textContainer = container.querySelector('.TagTextOuterContainer');
        if (textContainer) {
            const titleElement = DOMUtils.createElement('div', {
                className: 'TagTextContainer'
            }, "<div class='TagTextIcon'></div>中文玩家社区资讯");
            
            DOMUtils.prependChild(textContainer, titleElement);

            const socialButtons = this.createSocialButtonsHTML();
            textContainer.insertAdjacentHTML('beforeend', socialButtons);
        }
    }

    /**
     * Create social buttons HTML
     */
    private createSocialButtonsHTML(): string {
        return `
            <div style="text-align:center;padding-top: 10px;">
                <button class="Button Button--primary" type="button" style="font-weight: normal !important; color:#ffa000; background: #1a1d2e !important;border-radius: 2rem !important;">
                    <div style="margin-top: 5px;" class="Button-label">
                        <img onClick="window.open('https://kick.com/wangming886', '_blank')" style="width: 32px;" src="https://mutluresim.com/images/2023/04/10/KcgSG.png">
                        <img onClick="window.open('https://m.facebook.com', '_blank')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcF6i.png">
                        <img onClick="window.open('https://twitter.com/youngron131_', '_blank')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcDas.png">
                        <img onClick="window.open('https://m.youtube.com/@ag8888','_blank')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcQjd.png">
                        <img onClick="window.open('https://www.instagram.com/p/CqLvh94Sk8F/?igshid=YmMyMTA2M2Y=', '_blank')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcBAL.png">
                    </div>
                </button>
            </div>
        `;
    }

    /**
     * Remove original tag tiles
     */
    private removeOriginalTagTiles(): void {
        const tagTiles = DOMUtils.querySelector(".TagTiles");
        if (tagTiles) {
            DOMUtils.removeElement(tagTiles);
        }
    }

    /**
     * Setup mobile-specific styles
     */
    private setupMobileStyles(): void {
        if (MobileDetection.isMobileDevice()) {
            const app = DOMUtils.getElementById("app");
            const appContent = DOMUtils.querySelector(".App-content") as HTMLElement;
            
            if (app) {
                DOMUtils.setStyles(app, { 'overflow-x': 'hidden' });
            }
            
            if (appContent) {
                DOMUtils.setStyles(appContent, {
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
            const config = MobileDetection.getSwiperConfig();
            new Swiper(".tagSwiper", {
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

    /**
     * Add Tronscan component
     */
    private async addTronscan(): Promise<void> {
        const tronscanList = await this.dataLoader.loadTronscanList();
        
        if (DOMUtils.getElementById("TronscanTextContainer") || tronscanList.length === 0) {
            return;
        }

        const container = this.createTronscanContainer();
        const swiper = this.createTronscanSwiper();
        const wrapper = this.createTronscanWrapper(swiper);
        
        this.populateTronscanSlides(wrapper, tronscanList);
        this.initializeTronscanSwiper();
    }

    /**
     * Create Tronscan container
     */
    private createTronscanContainer(): HTMLElement {
        const container = DOMUtils.createElement('div', {
            id: 'TronscanTextContainer',
            className: 'TronscanTextContainer'
        }, "<div class='TronscanTextIcon'></div>知名博彩公司USDT/TRC公开链钱包额度");

        const swiperContainer = DOMUtils.getElementById("swiperTagContainer");
        if (swiperContainer) {
            DOMUtils.appendChild(swiperContainer, container);
        }

        return container;
    }

    /**
     * Create Tronscan swiper
     */
    private createTronscanSwiper(): HTMLElement {
        const swiper = DOMUtils.createElement('div', {
            className: 'swiper tronscanSwiper'
        });

        const swiperContainer = DOMUtils.getElementById("swiperTagContainer");
        if (swiperContainer) {
            DOMUtils.appendChild(swiperContainer, swiper);
        }

        return swiper;
    }

    /**
     * Create Tronscan wrapper
     */
    private createTronscanWrapper(swiper: HTMLElement): HTMLElement {
        const wrapper = DOMUtils.createElement('div', {
            className: 'swiper-wrapper'
        });
        DOMUtils.appendChild(swiper, wrapper);
        return wrapper;
    }

    /**
     * Populate Tronscan slides
     */
    private populateTronscanSlides(wrapper: HTMLElement, tronscanList: any[]): void {
        tronscanList.forEach(tronscanData => {
            const slide = this.createTronscanSlide(tronscanData);
            DOMUtils.appendChild(wrapper, slide);
        });
    }

    /**
     * Create individual Tronscan slide
     */
    private createTronscanSlide(tronscanData: any): HTMLElement {
        const slide = DOMUtils.createElement('div', {
            className: 'swiper-slide swiper-slide-tag'
        });

        const name = tronscanData.name ? tronscanData.name() : 'Unknown';
        const valueUsd = tronscanData.valueUsd ? `${parseInt(tronscanData.valueUsd())} USD` : '0 USD';
        const background = tronscanData.img ? `url(${tronscanData.img()})` : '';

        slide.innerHTML = `
            <div style='width:100px;height:130px;border-radius: 12px;background: ${background};background-size: cover;background-position: center;background-repeat: no-repeat;word-break: break-all;'>
                <div style='display:inline-block;position: absolute;top: 56px;height:20px;width:100px;background: rgba(255,255,255,0.5);'></div>
                <div class='tronscanMask'>
                    <div style='display: flex;width: 90px;justify-content: center;font-weight: bold;color:#02F78E;font-size:10px;'>
                        <span>${valueUsd}</span>
                    </div>
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Initialize Tronscan swiper
     */
    private initializeTronscanSwiper(): void {
        try {
            const config = MobileDetection.getTagSwiperConfig();
            new Swiper(".tronscanSwiper", {
                loop: true,
                spaceBetween: config.spaceBetween,
                slidesPerView: config.slidesPerView,
            });
        } catch (error) {
            console.error('Failed to initialize Tronscan swiper:', error);
        }
    }
}
