import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import LogInModal from 'flarum/forum/components/LogInModal';
import type Mithril from 'mithril';

/**
 * MobileRegisterButton component for mobile navigation bar
 * Shows animated register button for non-logged users on mobile
 */
export default class MobileRegisterButton extends Component<ComponentAttrs> {
  view(): Mithril.Children {
    return (
      <div className="Navigation-mobileRegister">
        <button 
          className="buttonRegister"
          onclick={this.handleClick.bind(this)}
          title="点击登录"
        >
          登录
        </button>
      </div>
    );
  }

  /**
   * Handle register button click
   */
  private handleClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    
    // Show login modal
    app.modal.show(LogInModal);
  }
}