import app from 'flarum/admin/app';

/**
 * Settings generator utility for admin interface
 */
export class SettingsGenerator {
    constructor(extensionId) {
        this.extensionId = extensionId;
        this.extensionData = app.extensionData.for(extensionId);
    }

    /**
     * Register transition time setting
     */
    registerTransitionTimeSetting() {
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.TransitionTime`,
            type: 'number',
            label: app.translator.trans('wusong8899-client1.admin.TransitionTime'),
        });
        return this;
    }

    /**
     * Register settings for advertisement slides
     * @param {number} maxSlides - Maximum number of slides to configure
     */
    registerSlideSettings(maxSlides = 30) {
        for (let i = 1; i <= maxSlides; i++) {
            // Register link setting
            this.extensionData.registerSetting({
                setting: `${this.extensionId}.Link${i}`,
                type: 'URL',
                label: app.translator.trans(`wusong8899-client1.admin.Link${i}`),
            });

            // Register image setting
            this.extensionData.registerSetting({
                setting: `${this.extensionId}.Image${i}`,
                type: 'URL',
                label: app.translator.trans(`wusong8899-client1.admin.Image${i}`),
            });
        }
        return this;
    }

    /**
     * Register all settings for the extension
     * @param {number} maxSlides - Maximum number of slides to configure
     */
    registerAllSettings(maxSlides = 30) {
        return this
            .registerTransitionTimeSetting()
            .registerSlideSettings(maxSlides);
    }
}

/**
 * Configuration constants
 */
// Centralized config is in js/src/common/config.
// Kept for backward compatibility; prefer importing from '../../common/config'.
export const EXTENSION_CONFIG = {
    EXTENSION_ID: 'wusong8899-client1-header-adv',
    MAX_SLIDES: 30,
    DEFAULT_TRANSITION_TIME: 5000,
};

/**
 * Initialize admin settings
 * @param {string} extensionId - The extension identifier
 * @param {number} maxSlides - Maximum number of slides
 */
export function initializeAdminSettings(
    extensionId = EXTENSION_CONFIG.EXTENSION_ID, 
    maxSlides = EXTENSION_CONFIG.MAX_SLIDES
) {
    const generator = new SettingsGenerator(extensionId);
    generator.registerAllSettings(maxSlides);
}
