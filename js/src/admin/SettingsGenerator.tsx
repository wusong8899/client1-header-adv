import app from 'flarum/admin/app';
import DynamicSlideSettingsComponent from './components/DynamicSlideSettingsComponent';
import { defaultConfig } from '../common/config';

/**
 * Type definitions for settings registration
 */
interface SettingConfig {
  setting: string;
  type: 'number' | 'url' | 'text' | 'boolean';
  label: string;
  help?: string;
}

interface SocialPlatform {
  name: string;
  urlKey: string;
  iconKey: string;
}

/**
 * Settings generator utility for admin interface
 * Provides a fluent API for registering extension settings
 */
export class SettingsGenerator {
  private readonly extensionId: string;
  private readonly extensionData: any;

  constructor(extensionId: string) {
    this.extensionId = extensionId;
    this.extensionData = app.extensionData.for(extensionId);
  }

  /**
   * Register transition time setting
   */
  registerTransitionTimeSetting(): this {
    this.extensionData.registerSetting({
      setting: `${this.extensionId}.TransitionTime`,
      type: 'number',
      label: app.translator.trans('wusong8899-client1.admin.TransitionTime'),
    } as SettingConfig);
    return this;
  }

  /**
   * Register header icon URL setting
   */
  registerHeaderIconUrlSetting(): this {
    this.extensionData.registerSetting({
      setting: `${this.extensionId}.HeaderIconUrl`,
      type: 'url',
      label: app.translator.trans('wusong8899-client1.admin.HeaderIconUrl'),
      help: app.translator.trans('wusong8899-client1.admin.HeaderIconUrlHelp'),
    } as SettingConfig);
    return this;
  }

  /**
   * Register social media settings for all supported platforms
   */
  registerSocialMediaSettings(): this {
    const socialPlatforms: SocialPlatform[] = [
      { name: 'Kick', urlKey: 'SocialKickUrl', iconKey: 'SocialKickIcon' },
      { name: 'Facebook', urlKey: 'SocialFacebookUrl', iconKey: 'SocialFacebookIcon' },
      { name: 'Twitter', urlKey: 'SocialTwitterUrl', iconKey: 'SocialTwitterIcon' },
      { name: 'YouTube', urlKey: 'SocialYouTubeUrl', iconKey: 'SocialYouTubeIcon' },
      { name: 'Instagram', urlKey: 'SocialInstagramUrl', iconKey: 'SocialInstagramIcon' },
    ];

    socialPlatforms.forEach((platform) => {
      // URL setting
      this.extensionData.registerSetting({
        setting: `${this.extensionId}.${platform.urlKey}`,
        type: 'url',
        label: app.translator.trans(`wusong8899-client1.admin.${platform.urlKey}`),
        help: app.translator.trans(`wusong8899-client1.admin.${platform.urlKey}Help`),
      } as SettingConfig);

      // Icon setting
      this.extensionData.registerSetting({
        setting: `${this.extensionId}.${platform.iconKey}`,
        type: 'url',
        label: app.translator.trans(`wusong8899-client1.admin.${platform.iconKey}`),
        help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
      } as SettingConfig);
    });

    return this;
  }

  /**
   * Register dynamic slide settings component
   */
  registerSlideSettings(maxSlides: number = defaultConfig.slider.maxSlides): this {
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
   */
  registerAllSettings(maxSlides: number = defaultConfig.slider.maxSlides): this {
    return this
      .registerTransitionTimeSetting()
      .registerHeaderIconUrlSetting()
      .registerSocialMediaSettings()
      .registerSlideSettings(maxSlides);
  }
}

/**
 * Configuration constants
 * @deprecated Use values from '../../common/config' instead
 */
export const EXTENSION_CONFIG = {
  EXTENSION_ID: 'wusong8899-client1-header-adv',
  MAX_SLIDES: defaultConfig.slider.maxSlides,
  DEFAULT_TRANSITION_TIME: defaultConfig.slider.defaultTransitionTime,
} as const;

/**
 * Initialize admin settings
 */
export function initializeAdminSettings(
  extensionId: string = EXTENSION_CONFIG.EXTENSION_ID, 
  maxSlides: number = EXTENSION_CONFIG.MAX_SLIDES
): void {
  const generator = new SettingsGenerator(extensionId);
  generator.registerAllSettings(maxSlides);
}
