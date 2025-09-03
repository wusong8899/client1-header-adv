import Component, { ComponentAttrs } from 'flarum/common/Component';
import type { Children, Vnode, VnodeDOM } from 'mithril';
import type { SocialLink } from '../../common/types';

interface SocialMediaButtonsAttrs extends ComponentAttrs {
  socialLinks: SocialLink[];
}

export default class SocialMediaButtons extends Component<SocialMediaButtonsAttrs> {
  private socialLinks: SocialLink[] = [];

  oninit(vnode: Vnode<SocialMediaButtonsAttrs>) {
    super.oninit(vnode);
    this.socialLinks = vnode.attrs.socialLinks || [];
  }

  onupdate(vnode: VnodeDOM<SocialMediaButtonsAttrs>) {
    super.onupdate(vnode);
    this.socialLinks = vnode.attrs.socialLinks || [];
  }

  view(vnode: Vnode<SocialMediaButtonsAttrs>): Children {
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

  private renderSocialIcon(link: SocialLink): Children {
    return (
      <a
        key={link.platform}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Visit our ${link.platform} page`}
      >
        <img
          src={link.icon}
          alt={`${link.platform} icon`}
          className="social-icon"
        />
      </a>
    );
  }
}