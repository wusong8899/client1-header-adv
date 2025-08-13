import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';

interface HeaderIconSettingComponentAttrs {
  setting: string;
  label: string;
  help?: string;
}

/**
 * Custom component for header icon URL setting with preview and file upload support
 */
export default class HeaderIconSettingComponent extends Component<HeaderIconSettingComponentAttrs> {
  private urlValue!: Stream<string>;
  private loading = false;
  private previewError = false;

  oninit(vnode: any) {
    super.oninit(vnode);
    
    const settingValue = app.data.settings[this.attrs.setting] || '';
    this.urlValue = Stream(settingValue);
  }

  view() {
    const { label, help } = this.attrs;
    const currentUrl = this.urlValue();

    return m('div.Form-group', [
      m('label.FormLabel', label),
      help && m('div.helpText', help),

      m('div.HeaderIconSetting', [
        // URL Input
        m('div.HeaderIconSetting-input', [
          m('input.FormControl', {
            type: 'url',
            placeholder: 'https://example.com/icon.png',
            value: currentUrl,
            oninput: (e: Event) => {
              const target = e.target as HTMLInputElement;
              this.urlValue(target.value);
              this.previewError = false;
              this.saveValue(target.value);
            }
          })
        ]),

        // Preview
        currentUrl && m('div.HeaderIconSetting-preview', [
          m('div.HeaderIconSetting-previewLabel',
            app.translator.trans('wusong8899-client1.admin.HeaderIconPreview')
          ),
          m('div.HeaderIconSetting-previewContainer', [
            this.loading ?
              m(LoadingIndicator, { size: 'small' }) :
            this.previewError ?
              m('div.HeaderIconSetting-previewError',
                app.translator.trans('wusong8899-client1.admin.HeaderIconPreviewError')
              ) :
              m('img.HeaderIconSetting-previewImage', {
                src: currentUrl,
                alt: 'Header Icon Preview',
                onload: () => {
                  this.previewError = false;
                  m.redraw();
                },
                onerror: () => {
                  this.previewError = true;
                  m.redraw();
                }
              })
          ])
        ]),

        // File Upload Section (Future Enhancement)
        m('div.HeaderIconSetting-upload', [
          m('div.HeaderIconSetting-uploadLabel',
            app.translator.trans('wusong8899-client1.admin.HeaderIconUploadLabel')
          ),
          m(Button, {
            className: 'Button Button--primary',
            disabled: true,
            onclick: () => {
              // TODO: Implement file upload functionality
              app.alerts.show({
                type: 'info',
                content: app.translator.trans('wusong8899-client1.admin.HeaderIconUploadComingSoon')
              });
            }
          }, app.translator.trans('wusong8899-client1.admin.HeaderIconUploadButton')),
          m('div.HeaderIconSetting-uploadHelp',
            app.translator.trans('wusong8899-client1.admin.HeaderIconUploadHelp')
          )
        ])
      ])
    ]);
  }

  /**
   * Save the setting value
   */
  private saveValue(value: string) {
    // Debounce the save operation
    clearTimeout((this as any).saveTimeout);
    (this as any).saveTimeout = setTimeout(() => {
      app.data.settings[this.attrs.setting] = value;
      
      // Save to backend
      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/settings',
        body: {
          [this.attrs.setting]: value
        }
      }).catch(() => {
        // Handle save error silently for now
      });
    }, 500);
  }
}
