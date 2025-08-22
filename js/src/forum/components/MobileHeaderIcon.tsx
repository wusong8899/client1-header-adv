import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';
import { defaultConfig } from '../../common/config';

/**
 * MobileHeaderIcon component for mobile navigation bar
 * Shows header icon in mobile navigation
 */
export default class MobileHeaderIcon extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    // Get header icon URL from settings, fallback to default config
    const headerIconUrl = app.forum.attribute('Client1HeaderAdvHeaderIconUrl') || defaultConfig.ui.headerIconUrl;

    return (
      <div 
        className="Navigation-mobileHeaderIcon"
        onclick={this.handleIconClick.bind(this)}
        title="Client Header Icon"
      >
        <img 
          src={headerIconUrl} 
          alt="Header Icon"
          className="Navigation-headerIcon"
        />
      </div>
    );
  }

  /**
   * Handle header icon click
   */
  private handleIconClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    
    // You can customize the click behavior here
    // For example, navigate to a specific page or show a modal
    console.log('Mobile header icon clicked!');
    
    // Example: Navigate to homepage
    // m.route.set('/');
    
    // Example: Open external link
    // window.open('https://example.com', '_blank');
  }
}