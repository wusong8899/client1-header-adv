<?php

namespace wusong8899\Client1HeaderAdv;

use Flarum\Extend;

class SettingsHelper
{
    /**
     * Generate settings configuration for advertisement slides
     * 
     * @param int $maxSlides Maximum number of slides to configure
     * @return array Array of Extend\Settings configurations
     */
    public static function generateSlideSettings(int $maxSlides = 30): array
    {
        $settings = [];
        
        // Add transition time setting
        $settings[] = (new Extend\Settings)->serializeToForum(
            'Client1HeaderAdvTransitionTime', 
            'wusong8899-client1-header-adv.TransitionTime'
        );
        
        // Generate settings for each slide
        for ($i = 1; $i <= $maxSlides; $i++) {
            // Link setting
            $settings[] = (new Extend\Settings)->serializeToForum(
                "Client1HeaderAdvLink{$i}", 
                "wusong8899-client1-header-adv.Link{$i}"
            );
            
            // Image setting
            $settings[] = (new Extend\Settings)->serializeToForum(
                "Client1HeaderAdvImage{$i}", 
                "wusong8899-client1-header-adv.Image{$i}"
            );
        }
        
        return $settings;
    }
    
    /**
     * Get frontend configuration
     * 
     * @return array Array of frontend configurations
     */
    public static function getFrontendConfig(): array
    {
        return [
            (new Extend\Frontend('forum'))
                ->js(__DIR__ . '/../js/dist/forum.js')
                ->css(__DIR__ . '/../less/forum.less'),
            (new Extend\Frontend('admin'))
                ->js(__DIR__ . '/../js/dist/admin.js')
                ->css(__DIR__ . '/../less/admin.less'),
            new Extend\Locales(__DIR__ . '/../locale'),
        ];
    }
    
    /**
     * Get complete extension configuration
     * 
     * @param int $maxSlides Maximum number of slides
     * @return array Complete configuration array
     */
    public static function getExtensionConfig(int $maxSlides = 30): array
    {
        return array_merge(
            self::getFrontendConfig(),
            self::generateSlideSettings($maxSlides)
        );
    }
}
