import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { SocialLink } from '../../common/types';

/**
 * SocialMediaButtons Component
 * 
 * Pure component that renders social media buttons.
 * Now receives social links as props instead of loading settings internally.
 */
export default class SocialMediaButtons extends Component {
  private socialLinks: SocialLink[] = [];

  /**
   * Initialize component with props
   */
  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.socialLinks = vnode.attrs.socialLinks || [];
  }

  /**
   * Update social links when props change
   */
  onupdate(vnode: Mithril.VnodeDOM) {
    super.onupdate(vnode);
    this.socialLinks = vnode.attrs.socialLinks || [];
  }

  /**
   * Render the component with filtered social links
   */
  view(vnode: Mithril.Vnode): Mithril.Children {
    // Use current props if available, fallback to instance property
    const socialLinks = vnode.attrs.socialLinks || this.socialLinks;
    
    if (!socialLinks || socialLinks.length === 0) {
      return null;
    }

    // Filter social links that have both URL and icon
    const activeSocialLinks = socialLinks.filter((link: SocialLink) => 
      link.url && link.icon && 
      link.url.trim() !== '' && 
      link.icon.trim() !== ''
    );

    if (activeSocialLinks.length === 0) {
      return null;
    }

    return (
      <div className="social-buttons-container">
        <div className="social-button">
          <div className="Button-label">
            {activeSocialLinks.map((link: SocialLink) => this.renderSocialIcon(link))}
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
  private trackSocialClick(_platform: string): void {
    // Could integrate with analytics service here
  }
}