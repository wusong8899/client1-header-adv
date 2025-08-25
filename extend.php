<?php

declare(strict_types=1);

use Flarum\Extend;

/**
 * Simplified Extension Configuration
 * Single JSON setting replaces 73+ individual settings
 */
return [
    // Frontend assets
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),
    
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),
    
    // Locales
    new Extend\Locales(__DIR__ . '/locale'),
    
    // Core JSON settings with serializer callback
    (new Extend\Settings)->serializeToForum(
        'wusong8899-client1-header-adv.settings',
        'Client1HeaderAdvSettings',
        function ($value) {
            // Return raw JSON string, ensuring it's properly serialized
            return $value ?: '{}';
        }
    ),
    
    // Legacy compatibility settings (for backward compatibility)
    (new Extend\Settings)->serializeToForum(
        'wusong8899-client1-header-adv.TransitionTime',
        'Client1HeaderAdvTransitionTime'
    ),
];