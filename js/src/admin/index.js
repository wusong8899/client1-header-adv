import app from 'flarum/admin/app';
import { initializeAdminSettings } from './SettingsGenerator';

app.initializers.add('wusong8899/client1-header-adv', () => {
    initializeAdminSettings();
});
