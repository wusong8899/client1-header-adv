import app from 'flarum/admin/app';
import DynamicSlideSettingsComponent from './components/DynamicSlideSettingsComponent';
import { defaultConfig } from '../common/config';

/**
 * Social media platforms configuration
 */
const SOCIAL_PLATFORMS = ['Kick', 'Facebook', 'Twitter', 'YouTube', 'Instagram'] as const;

/**
 * Get max slides value from settings or use default
 */
function getMaxSlides(extensionId: string): number {
  const backendMaxSlides = app.data.settings[`${extensionId}.MaxSlides`];
  return backendMaxSlides ? parseInt(backendMaxSlides) : defaultConfig.slider.maxSlides;
}

/**
 * Initialize the client1-header-adv admin extension
 */
app.initializers.add('wusong8899-client1-header-adv', (): void => {
  const extensionId = defaultConfig.app.extensionId;
  const extensionData = app.extensionData.for(extensionId);

  // Core settings
  extensionData.registerSetting({
    setting: `${extensionId}.TransitionTime`,
    type: 'number',
    label: app.translator.trans('wusong8899-client1.admin.TransitionTime'),
  });

  extensionData.registerSetting({
    setting: `${extensionId}.HeaderIconUrl`,
    type: 'url',
    label: app.translator.trans('wusong8899-client1.admin.HeaderIconUrl'),
    help: app.translator.trans('wusong8899-client1.admin.HeaderIconUrlHelp'),
  });

  extensionData.registerSetting({
    setting: `${extensionId}.MaxSlides`,
    type: 'number',
    label: app.translator.trans('wusong8899-client1.admin.MaxSlides'),
    help: app.translator.trans('wusong8899-client1.admin.MaxSlidesHelp'),
  });

  // Social media settings
  SOCIAL_PLATFORMS.forEach((platform) => {
    const urlKey = `Social${platform}Url`;
    const iconKey = `Social${platform}Icon`;

    extensionData.registerSetting({
      setting: `${extensionId}.${urlKey}`,
      type: 'url',
      label: app.translator.trans(`wusong8899-client1.admin.${urlKey}`),
      help: app.translator.trans(`wusong8899-client1.admin.${urlKey}Help`),
    });

    extensionData.registerSetting({
      setting: `${extensionId}.${iconKey}`,
      type: 'url',
      label: app.translator.trans(`wusong8899-client1.admin.${iconKey}`),
      help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
    });
  });

  // Dynamic slide settings component
  const maxSlides = getMaxSlides(extensionId);
  extensionData.registerSetting(() => {
    return m(DynamicSlideSettingsComponent, {
      extensionId,
      maxSlides
    });
  });
});
