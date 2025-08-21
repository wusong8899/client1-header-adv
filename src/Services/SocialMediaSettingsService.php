<?php

declare(strict_types=1);

namespace wusong8899\Client1HeaderAdv\Services;

use Flarum\Extend;

/**
 * Service for generating social media settings configurations
 */
final class SocialMediaSettingsService
{
    /**
     * Supported social media platforms
     */
    private const PLATFORMS = [
        'Kick',
        'Facebook', 
        'Twitter',
        'YouTube',
        'Instagram'
    ];

    /**
     * Generate settings configuration for social media platforms
     *
     * @return array<Extend\Settings> Array of Extend\Settings configurations
     */
    public function generateSocialMediaSettings(): array
    {
        $settings = [];

        foreach (self::PLATFORMS as $platform) {
            $settings = [
                ...$settings,
                ...$this->createPlatformSettings($platform)
            ];
        }

        return $settings;
    }

    /**
     * Create settings for a single platform
     *
     * @param string $platform The platform name
     * @return array<Extend\Settings> Settings for URL and icon
     */
    private function createPlatformSettings(string $platform): array
    {
        $settingKey = "wusong8899-client1-header-adv.Social{$platform}";
        
        return [
            // URL setting
            (new Extend\Settings)->serializeToForum(
                "{$settingKey}Url",
                "{$settingKey}Url"
            ),
            // Icon setting
            (new Extend\Settings)->serializeToForum(
                "{$settingKey}Icon",
                "{$settingKey}Icon"
            ),
        ];
    }

    /**
     * Get list of supported platforms
     *
     * @return array<string> List of platform names
     */
    public function getSupportedPlatforms(): array
    {
        return self::PLATFORMS;
    }

    /**
     * Check if platform is supported
     */
    public function isPlatformSupported(string $platform): bool
    {
        return in_array($platform, self::PLATFORMS, true);
    }
}