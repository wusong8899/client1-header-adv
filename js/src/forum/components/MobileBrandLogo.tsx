import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';
import { defaultConfig } from '../../common/config';

/**
 * MobileBrandLogo component for mobile navigation bar
 * Shows brand logo for all users on mobile devices
 */
export default class MobileBrandLogo extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    // Get brand logo URL from settings, fallback to default config
    const logoUrl = app.forum.attribute('Client1HeaderAdvHeaderIconUrl') || defaultConfig.ui.headerIconUrl;

    return (
      <div className="Navigation-mobileBrandLogo">
        <img 
          src={logoUrl} 
          alt="Brand Logo"
          className="Navigation-brandLogo"
          title="Client1 Brand"
        />
      </div>
    );
  }
}