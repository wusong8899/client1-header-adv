import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { SocialLink } from '../../common/types';

export default class SocialMediaButtons extends Component {
  private socialLinks: SocialLink[] = [];

  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.socialLinks = vnode.attrs.socialLinks || [];
  }

  onupdate(vnode: Mithril.VnodeDOM) {
    super.onupdate(vnode);
    this.socialLinks = vnode.attrs.socialLinks || [];
  }

  view(vnode: Mithril.Vnode): Mithril.Children {
    const socialLinks = vnode.attrs.socialLinks || this.socialLinks;
    
    if (!socialLinks || socialLinks.length === 0) {
      return null;
    }

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

  private trackSocialClick(_platform: string): void {
    
  }
}