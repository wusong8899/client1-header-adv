import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import { SocialPlatform, SettingConfig } from '../../common/types';

interface SocialMediaSettingsAttrs {
  extensionId: string;
}

/**
 * Component for managing social media platform settings
 * Provides URL and icon configuration for each supported platform
 */
export default class SocialMediaSettings extends Component<SocialMediaSettingsAttrs> {
  private readonly socialPlatforms: SocialPlatform[] = [
    { name: 'Kick', urlKey: 'SocialKickUrl', iconKey: 'SocialKickIcon' },
    { name: 'Facebook', urlKey: 'SocialFacebookUrl', iconKey: 'SocialFacebookIcon' },
    { name: 'Twitter', urlKey: 'SocialTwitterUrl', iconKey: 'SocialTwitterIcon' },
    { name: 'YouTube', urlKey: 'SocialYouTubeUrl', iconKey: 'SocialYouTubeIcon' },
    { name: 'Instagram', urlKey: 'SocialInstagramUrl', iconKey: 'SocialInstagramIcon' },
  ];

  /**
   * Register all social media settings
   */
  register(): void {
    const { extensionId } = this.attrs;
    const extensionData = app.extensionData.for(extensionId);

    this.socialPlatforms.forEach((platform) => {
      this.registerPlatformSettings(extensionData, platform);
    });
  }

  /**
   * Register settings for a single platform
   */
  private registerPlatformSettings(extensionData: any, platform: SocialPlatform): void {
    const { extensionId } = this.attrs;

    // URL setting
    extensionData.registerSetting({
      setting: `${extensionId}.${platform.urlKey}`,
      type: 'url',
      label: app.translator.trans(`wusong8899-client1.admin.${platform.urlKey}`),
      help: app.translator.trans(`wusong8899-client1.admin.${platform.urlKey}Help`),
    } as SettingConfig);

    // Icon setting
    extensionData.registerSetting({
      setting: `${extensionId}.${platform.iconKey}`,
      type: 'url',
      label: app.translator.trans(`wusong8899-client1.admin.${platform.iconKey}`),
      help: app.translator.trans('wusong8899-client1.admin.SocialIconHelp'),
    } as SettingConfig);
  }

  view() {
    return (
      <div className="SocialMediaSettings">
        <h3>{app.translator.trans('wusong8899-client1.admin.SocialMediaTitle')}</h3>
        <p className="helpText">
          {app.translator.trans('wusong8899-client1.admin.SocialMediaHelp')}
        </p>
        
        <div className="SocialMediaSettings-platforms">
          {this.socialPlatforms.map((platform) => this.renderPlatform(platform))}
        </div>
      </div>
    );
  }

  /**
   * Render settings for a single platform
   */
  private renderPlatform(platform: SocialPlatform) {
    const { extensionId } = this.attrs;
    const urlSettingKey = `${extensionId}.${platform.urlKey}`;
    const iconSettingKey = `${extensionId}.${platform.iconKey}`;

    return (
      <div className="SocialMediaSettings-platform" key={platform.name}>
        <h4 className="SocialMediaSettings-platformTitle">
          {platform.name}
        </h4>
        
        <div className="Form-group">
          <label className="FormLabel">
            {app.translator.trans(`wusong8899-client1.admin.${platform.urlKey}`)}
          </label>
          <input
            className="FormControl"
            type="url"
            placeholder={`https://${platform.name.toLowerCase()}.com/yourprofile`}
            value={app.data.settings[urlSettingKey] || ''}
            oninput={(e: Event) => {
              const target = e.target as HTMLInputElement;
              this.updateSetting(urlSettingKey, target.value);
            }}
          />
          <div className="helpText">
            {app.translator.trans(`wusong8899-client1.admin.${platform.urlKey}Help`)}
          </div>
        </div>

        <div className="Form-group">
          <label className="FormLabel">
            {app.translator.trans(`wusong8899-client1.admin.${platform.iconKey}`)}
          </label>
          <input
            className="FormControl"
            type="url"
            placeholder="https://example.com/icon.png"
            value={app.data.settings[iconSettingKey] || ''}
            oninput={(e: Event) => {
              const target = e.target as HTMLInputElement;
              this.updateSetting(iconSettingKey, target.value);
            }}
          />
          <div className="helpText">
            {app.translator.trans('wusong8899-client1.admin.SocialIconHelp')}
          </div>
          
          {this.renderIconPreview(app.data.settings[iconSettingKey])}
        </div>
      </div>
    );
  }

  /**
   * Render icon preview if URL is provided
   */
  private renderIconPreview(iconUrl: string) {
    if (!iconUrl) return null;

    return (
      <div className="SocialMediaSettings-iconPreview">
        <img
          src={iconUrl}
          alt="Social media icon preview"
          onload={() => m.redraw()}
          onerror={() => m.redraw()}
        />
      </div>
    );
  }

  /**
   * Update a setting with debouncing
   */
  private updateSetting(key: string, value: string): void {
    // Clear existing timeout for this key
    const timeoutKey = `socialMediaTimeout_${key}`;
    clearTimeout((this as any)[timeoutKey]);

    // Set new timeout
    (this as any)[timeoutKey] = setTimeout(() => {
      app.data.settings[key] = value;

      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/settings',
        body: {
          [key]: value
        }
      }).catch((error) => {
        console.error('Failed to save social media setting:', error);
        // TODO: Show user-friendly error message
      });
    }, 500);
  }
}