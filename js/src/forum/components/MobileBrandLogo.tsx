import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';
import { defaultConfig } from '../../common/config';
import { getHeaderIcon } from '../utils/SettingsManager';

export default class MobileBrandLogo extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    const headerIcon = getHeaderIcon();
    const logoUrl = headerIcon.url || 
                    app.forum.attribute('Client1HeaderAdvHeaderIconUrl') || 
                    defaultConfig.ui.headerIcon.url;
    const logoLink = headerIcon.link || 
                     app.forum.attribute('Client1HeaderAdvHeaderIconLink') || 
                     '';

    const logoElement = (
      <img 
        src={logoUrl} 
        alt="Brand Logo"
        className="Navigation-brandLogo"
        title="Client1 Brand"
      />
    );

    return (
      <div className="Navigation-mobileBrandLogo">
        {logoLink && logoLink.trim() !== '' ? (
          <a 
            href={logoLink} 
            target="_blank" 
            rel="noopener noreferrer"
            title="Visit Brand Homepage"
          >
            {logoElement}
          </a>
        ) : (
          logoElement
        )}
      </div>
    );
  }
}