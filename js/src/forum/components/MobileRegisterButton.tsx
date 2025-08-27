import Component, { ComponentAttrs } from 'flarum/common/Component';
import app from 'flarum/forum/app';
import LogInModal from 'flarum/forum/components/LogInModal';
import type Mithril from 'mithril';

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

  private handleClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    
    app.modal.show(LogInModal);
  }
}