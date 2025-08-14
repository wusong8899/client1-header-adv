import app from 'flarum/admin/app';
import DynamicSlideSettingsComponent from './components/DynamicSlideSettingsComponent';

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
     * Register header icon URL setting
     */
    registerHeaderIconUrlSetting() {
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.HeaderIconUrl`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.HeaderIconUrl'),
            help: app.translator.trans('wusong8899-client1.admin.HeaderIconUrlHelp'),
        });
        return this;
    }

    /**
     * Register social media settings
     */
    registerSocialMediaSettings() {
        // Kick settings
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialKickUrl`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialKickUrl'),
            help: app.translator.trans('wusong8899-client1.admin.SocialKickUrlHelp'),
        });

        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialKickIcon`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialKickIcon'),
            help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
        });

        // Facebook settings
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialFacebookUrl`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialFacebookUrl'),
            help: app.translator.trans('wusong8899-client1.admin.SocialFacebookUrlHelp'),
        });

        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialFacebookIcon`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialFacebookIcon'),
            help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
        });

        // Twitter settings
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialTwitterUrl`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialTwitterUrl'),
            help: app.translator.trans('wusong8899-client1.admin.SocialTwitterUrlHelp'),
        });

        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialTwitterIcon`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialTwitterIcon'),
            help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
        });

        // YouTube settings
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialYouTubeUrl`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialYouTubeUrl'),
            help: app.translator.trans('wusong8899-client1.admin.SocialYouTubeUrlHelp'),
        });

        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialYouTubeIcon`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialYouTubeIcon'),
            help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
        });

        // Instagram settings
        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialInstagramUrl`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialInstagramUrl'),
            help: app.translator.trans('wusong8899-client1.admin.SocialInstagramUrlHelp'),
        });

        this.extensionData.registerSetting({
            setting: `${this.extensionId}.SocialInstagramIcon`,
            type: 'url',
            label: app.translator.trans('wusong8899-client1.admin.SocialInstagramIcon'),
            help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
        });

        return this;
    }

    /**
     * Register dynamic slide settings component
     * @param {number} maxSlides - Maximum number of slides to configure
     */
    registerSlideSettings(maxSlides = 30) {
        this.extensionData.registerSetting(() => {
            return m(DynamicSlideSettingsComponent, {
                extensionId: this.extensionId,
                maxSlides: maxSlides
            });
        });
        return this;
    }

    /**
     * Register all settings for the extension
     * @param {number} maxSlides - Maximum number of slides to configure
     */
    registerAllSettings(maxSlides = 30) {
        return this
            .registerTransitionTimeSetting()
            .registerHeaderIconUrlSetting()
            .registerSocialMediaSettings()
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
