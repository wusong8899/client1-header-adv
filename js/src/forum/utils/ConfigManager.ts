import app from 'flarum/forum/app';
import extractText from 'flarum/common/utils/extractText';
import { defaultConfig, RootConfig } from '../../common/config';

/**
 * Configuration management utility
 */
export class ConfigManager {
    private static instance: ConfigManager;
    private config: Map<string, any> = new Map();
    private typedConfig: RootConfig = defaultConfig;

    private constructor() {
        this.loadDefaultConfig();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    /**
     * Load default configuration values
     */
    private loadDefaultConfig(): void {
        // Seed from centralized defaults (kept as flat keys for backward compatibility)
        this.config.set('maxSlides', this.typedConfig.slider.maxSlides);
        this.config.set('defaultTransitionTime', this.typedConfig.slider.defaultTransitionTime);
        this.config.set('checkTime', this.typedConfig.slider.checkTime);
        this.config.set('dataCheckInterval', this.typedConfig.slider.dataCheckInterval);
        this.config.set('extensionId', this.typedConfig.app.extensionId);
        this.config.set('translationPrefix', this.typedConfig.app.translationPrefix);
    }

    /**
     * Get configuration value
     * @param {string} key - Configuration key
     * @param {any} defaultValue - Default value if key not found
     * @returns {any} Configuration value
     */
    get(key: string, defaultValue: any = null): any {
        return this.config.get(key) ?? defaultValue;
    }

    /**
     * Set configuration value
     * @param {string} key - Configuration key
     * @param {any} value - Configuration value
     */
    set(key: string, value: any): void {
        this.config.set(key, value);
    }


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
     * Get transition time from forum settings
     * @returns {number} Transition time in milliseconds
     */
    getTransitionTime(): number {
        const transitionTime = this.getForumAttribute('Client1HeaderAdvTransitionTime');
        return transitionTime ? parseInt(String(transitionTime)) : this.get('defaultTransitionTime');
    }

    /**
     * Get slide image URL
     * @param {number} slideNumber - Slide number (1-based)
     * @returns {string | null} Image URL or null if not set
     */
    getSlideImage(slideNumber: number): string | null {
        return this.getForumAttribute(`Client1HeaderAdvImage${slideNumber}`) || null;
    }

    /**
     * Get slide link URL
     * @param {number} slideNumber - Slide number (1-based)
     * @returns {string | null} Link URL or null if not set
     */
    getSlideLink(slideNumber: number): string | null {
        return this.getForumAttribute(`Client1HeaderAdvLink${slideNumber}`) || null;
    }

    /**
     * Get all configured slides
     * @returns {Array} Array of slide configurations
     */
    getAllSlides(): Array<{ slideNumber: number, image: string, link: string }> {
        const slides = [];
        const maxSlides = this.get('maxSlides');

        for (let i = 1; i <= maxSlides; i++) {
            const image = this.getSlideImage(i);
            const link = this.getSlideLink(i);

            if (image) {
                slides.push({
                    slideNumber: i,
                    image,
                    link: link || '#'
                });
            }
        }

        return slides;
    }

    /**
     * Get translation key with prefix
     * @param {string} key - Translation key
     * @returns {string} Full translation key
     */
    getTranslationKey(key: string): string {
        const prefix = this.get('translationPrefix') as string;
        return `${prefix}.${key}`;
    }

    /**
     * Get translated text
     * @param {string} key - Translation key
     * @param {object} parameters - Translation parameters
     * @returns {string} Translated text
     */
    translate(key: string, parameters: Record<string, unknown> = {}): string {
        const fullKey = this.getTranslationKey(key);
        const translator = (app as any)?.translator;
        if (translator?.trans) {
            const result = translator.trans(fullKey, parameters);
            // app.translator.trans returns a NestedStringArray; convert to plain text
            return extractText(result as any);
        }
        return fullKey;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isUserLoggedIn(): boolean {
        return !!(app as any)?.session?.user;
    }

    /**
     * Get current route name
     * @returns {string | null} Current route name
     */
    getCurrentRoute(): string | null {
        return ((app as any)?.current?.get?.('routeName')) || null;
    }

    /**
     * Check if current route is tags page
     * @returns {boolean} True if on tags page
     */
    isTagsPage(): boolean {
        return this.getCurrentRoute() === 'tags';
    }

    /**
     * Get extension configuration object
     * @returns {object} Extension configuration
     */
    getExtensionConfig(): object {
        return {
            extensionId: this.get('extensionId'),
            maxSlides: this.get('maxSlides'),
            transitionTime: this.getTransitionTime(),
            checkTime: this.get('checkTime'),
            dataCheckInterval: this.get('dataCheckInterval'),
            translationPrefix: this.get('translationPrefix')
        };
    }

    /**
     * Validate slide configuration
     * @param {number} slideNumber - Slide number to validate
     * @returns {boolean} True if slide is properly configured
     */
    isSlideValid(slideNumber: number): boolean {
        const image = this.getSlideImage(slideNumber);
        return typeof image === 'string' && image.trim().length > 0;
    }

    /**
     * Get valid slide count
     * @returns {number} Number of valid slides
     */
    getValidSlideCount(): number {
        let count = 0;
        const maxSlides = this.get('maxSlides');

        for (let i = 1; i <= maxSlides; i++) {
            if (this.isSlideValid(i)) {
                count++;
            }
        }

        return count;
    }

    /**
     * Reset configuration to defaults
     */
    reset(): void {
        this.config.clear();
        this.loadDefaultConfig();
    }

    /**
     * Export configuration as JSON
     * @returns {string} JSON string of configuration
     */
    exportConfig(): string {
        // Compatible alternative to Object.fromEntries for older TypeScript targets
        const configObject: { [key: string]: any } = {};
        this.config.forEach((value, key) => {
            configObject[key] = value;
        });
        return JSON.stringify(configObject, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonConfig - JSON configuration string
     * @returns {boolean} True if import successful
     */
    importConfig(jsonConfig: string): boolean {
        try {
            const configObject = JSON.parse(jsonConfig);
            Object.entries(configObject).forEach(([key, value]) => {
                this.config.set(key, value);
            });
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
}
