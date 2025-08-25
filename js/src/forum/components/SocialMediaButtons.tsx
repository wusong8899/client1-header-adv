import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';

/**
 * Social media link structure
 */
interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

/**
 * Extension settings structure for social media
 */
interface ExtensionSettings {
  slides: any[];
  transitionTime: number;
  socialLinks: SocialLink[];
}

/**
 * SocialMediaButtons Component
 * 
 * Renders social media buttons below the TagSwiper on the tags page.
 * Reads social media links from the extension settings and displays them
 * using the existing CSS styling.
 */
export default class SocialMediaButtons extends Component {
  private settings: ExtensionSettings | null = null;

  /**
   * Initialize component
   */
  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.loadSettings();
  }

  /**
   * Load settings from Flarum
   */
  private loadSettings(): void {
    try {
      console.log('SocialMediaButtons: Loading settings...');
      
      // Try JSON format first
      const settingsJson = app.forum.attribute('Client1HeaderAdvSettings');
      console.log('SocialMediaButtons: JSON settings found:', settingsJson ? 'yes' : 'no');
      
      if (settingsJson) {
        this.settings = typeof settingsJson === 'string' ? JSON.parse(settingsJson) : settingsJson;
        console.log('SocialMediaButtons: Loaded settings:', this.settings);
        return;
      }

      // If no settings found, initialize empty
      this.settings = {
        slides: [],
        transitionTime: 5000,
        socialLinks: []
      };
      
      console.log('SocialMediaButtons: No settings found, using empty defaults');
    } catch (error) {
      console.error('SocialMediaButtons: Failed to load settings:', error);
      this.settings = {
        slides: [],
        transitionTime: 5000,
        socialLinks: []
      };
    }
  }

  /**
   * Render the component
   */
  view(): Mithril.Children {
    if (!this.settings || !this.settings.socialLinks || this.settings.socialLinks.length === 0) {
      console.log('SocialMediaButtons: No social links to display');
      return null;
    }

    // Filter social links that have both URL and icon
    const activeSocialLinks = this.settings.socialLinks.filter(link => 
      link.url && link.icon && link.url.trim() !== '' && link.icon.trim() !== ''
    );

    if (activeSocialLinks.length === 0) {
      console.log('SocialMediaButtons: No active social links');
      return null;
    }

    console.log('SocialMediaButtons: Rendering', activeSocialLinks.length, 'social buttons');

    return (
      <div className="social-buttons-container">
        <div className="social-button">
          <div className="Button-label">
            {activeSocialLinks.map((link) => this.renderSocialIcon(link))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render individual social media icon
   */
  private renderSocialIcon(link: SocialLink): Mithril.Children {
    return (
      <a
        key={link.platform}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Visit our ${link.platform} page`}
        onclick={() => this.trackSocialClick(link.platform)}
      >
        <img
          src={link.icon}
          alt={`${link.platform} icon`}
          className="social-icon"
        />
      </a>
    );
  }

  /**
   * Track social media clicks for analytics
   */
  private trackSocialClick(platform: string): void {
    console.log('SocialMediaButtons: Click tracked for', platform);
    // Could integrate with analytics service here
  }
}