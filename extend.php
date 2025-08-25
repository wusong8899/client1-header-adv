<?php

declare(strict_types=1);

use Flarum\Extend;

// Extension constants
$MAX_SLIDES = 30;
$SOCIAL_PLATFORMS = ['Kick', 'Facebook', 'Twitter', 'YouTube', 'Instagram'];

// Build the extension configuration
$config = [
    // Frontend assets
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),
    
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),
    
    // Locales
    new Extend\Locales(__DIR__ . '/locale'),
    
    // Core settings
    (new Extend\Settings)->serializeToForum(
        'wusong8899-client1-header-adv.TransitionTime',
        'Client1HeaderAdvTransitionTime'
    ),
    (new Extend\Settings)->serializeToForum(
        'wusong8899-client1-header-adv.HeaderIconUrl', 
        'Client1HeaderAdvHeaderIconUrl'
    ),
    (new Extend\Settings)->serializeToForum(
        'wusong8899-client1-header-adv.MaxSlides',
        'Client1HeaderAdvMaxSlides'
    ),
];

// Generate social media settings
foreach ($SOCIAL_PLATFORMS as $platform) {
    $config[] = (new Extend\Settings)->serializeToForum(
        "wusong8899-client1-header-adv.Social{$platform}Url",
        "wusong8899-client1-header-adv.Social{$platform}Url"
    );
    $config[] = (new Extend\Settings)->serializeToForum(
        "wusong8899-client1-header-adv.Social{$platform}Icon",
        "wusong8899-client1-header-adv.Social{$platform}Icon"
    );
}

// Generate slide settings (Image + Link for each slide)
for ($i = 1; $i <= $MAX_SLIDES; $i++) {
    // Link setting
    $config[] = (new Extend\Settings)->serializeToForum(
        "wusong8899-client1-header-adv.Link{$i}",
        "Client1HeaderAdvLink{$i}"
    );
    // Image setting
    $config[] = (new Extend\Settings)->serializeToForum(
        "wusong8899-client1-header-adv.Image{$i}",
        "Client1HeaderAdvImage{$i}"
    );
}

return $config;