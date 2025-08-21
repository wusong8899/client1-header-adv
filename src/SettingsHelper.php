<?php

declare(strict_types=1);

namespace wusong8899\Client1HeaderAdv;

use Flarum\Extend;
use wusong8899\Client1HeaderAdv\Services\{SlideSettingsService, SocialMediaSettingsService};
use wusong8899\Client1HeaderAdv\Enums\{ExtensionConstants, AssetPaths};

/**
 * Modern settings helper using PHP 8 features and dependency injection
 * @deprecated Use individual services instead. This class will be removed in v2.0
 */
final class SettingsHelper
{
    /**
     * Generate settings configuration for advertisement slides
     *
     * @return array<Extend\Settings|Extend\Frontend|Extend\Locales> Array of Extend configurations
     */
    public static function generateSlideSettings(int $maxSlides = null): array
    {
        $maxSlides ??= ExtensionConstants::DEFAULT_MAX_SLIDES->asInt();

        $slideService = new SlideSettingsService($maxSlides);
        $socialService = new SocialMediaSettingsService();

        return [
            // Core settings
            ...self::generateCoreSettings(),
            // Social media settings
            ...$socialService->generateSocialMediaSettings(),
            // Slide settings
            ...$slideService->generateSlideSettings(),
        ];
    }

    /**
     * Generate core extension settings (transition time, header icon)
     *
     * @return array<Extend\Settings>
     */
    private static function generateCoreSettings(): array
    {
        return [
            // Transition time setting
            (new Extend\Settings)->serializeToForum(
                'Client1HeaderAdvTransitionTime',
                ExtensionConstants::getSettingKey('TransitionTime')
            ),
            // Header icon URL setting  
            (new Extend\Settings)->serializeToForum(
                'Client1HeaderAdvHeaderIconUrl',
                ExtensionConstants::getSettingKey('HeaderIconUrl')
            ),
        ];
    }

    /**
     * Get frontend configuration using modern enum-based paths
     * 
     * @return array<Extend\Frontend|Extend\Locales> Array of frontend configurations
     */
    public static function getFrontendConfig(): array
    {
        $srcDir = __DIR__;

        return [
            (new Extend\Frontend('forum'))
                ->js(AssetPaths::FORUM_JS->getFullPath($srcDir))
                ->css(AssetPaths::FORUM_CSS->getFullPath($srcDir)),
            (new Extend\Frontend('admin'))
                ->js(AssetPaths::ADMIN_JS->getFullPath($srcDir))
                ->css(AssetPaths::ADMIN_CSS->getFullPath($srcDir)),
            new Extend\Locales(AssetPaths::LOCALES->getFullPath($srcDir)),
        ];
    }

    /**
     * Get complete extension configuration
     * 
     * @return array<Extend\Settings|Extend\Frontend|Extend\Locales> Complete configuration array
     */
    public static function getExtensionConfig(int $maxSlides = null): array
    {
        $maxSlides ??= ExtensionConstants::DEFAULT_MAX_SLIDES->asInt();

        return [
            ...self::getFrontendConfig(),
            ...self::generateSlideSettings($maxSlides)
        ];
    }

    /**
     * Validate extension configuration
     */
    public static function validateConfig(int $maxSlides, int $transitionTime): array
    {
        $errors = [];

        if ($maxSlides < 1 || $maxSlides > 100) {
            $errors[] = 'Maximum slides must be between 1 and 100';
        }

        if (!ExtensionConstants::isValidTransitionTime($transitionTime)) {
            $errors[] = sprintf(
                'Transition time must be between %d and %d milliseconds',
                ExtensionConstants::MIN_TRANSITION_TIME->asInt(),
                ExtensionConstants::MAX_TRANSITION_TIME->asInt()
            );
        }

        return $errors;
    }
}
