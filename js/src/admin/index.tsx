import app from 'flarum/admin/app';
import { initializeAdminSettings } from './SettingsGenerator';

/**
 * Initialize the client1-header-adv admin extension
 */
app.initializers.add('wusong8899/client1-header-adv', (): void => {
    initializeAdminSettings();
});
