<?php

declare(strict_types=1);

namespace wusong8899\Client1HeaderAdv\Services;

use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;
use wusong8899\Client1HeaderAdv\Enums\ExtensionConstants;

/**
 * Service for generating slide-related settings configurations
 */
final class SlideSettingsService
{
    public function __construct(
        private readonly int $maxSlides
    ) {}

    /**
     * Create service instance with maxSlides read from database settings
     *
     * @param SettingsRepositoryInterface $settings Settings repository
     * @return self Service instance with dynamic maxSlides
     */
    public static function createFromSettings(SettingsRepositoryInterface $settings): self
    {
        $maxSlides = (int) $settings->get(
            'Client1HeaderAdvMaxSlides', 
            ExtensionConstants::DEFAULT_MAX_SLIDES->value
        );
        
        // Ensure maxSlides is within reasonable bounds (1-100)
        $maxSlides = max(1, min(100, $maxSlides));
        
        return new self($maxSlides);
    }

    /**
     * Generate settings configuration for advertisement slides
     *
     * @return array<Extend\Settings> Array of Extend\Settings configurations
     */
    public function generateSlideSettings(): array
    {
        $settings = [];

        // Generate settings for each slide
        for ($i = 1; $i <= $this->maxSlides; $i++) {
            $settings = [
                ...$settings,
                ...$this->createSlideSettings($i)
            ];
        }

        return $settings;
    }

    /**
     * Create settings for a single slide
     *
     * @param int $slideNumber The slide number (1-indexed)
     * @return array<Extend\Settings> Settings for link and image
     */
    private function createSlideSettings(int $slideNumber): array
    {
        return [
            // Link setting
            (new Extend\Settings)->serializeToForum(
                "wusong8899-client1-header-adv.Link{$slideNumber}",
                "Client1HeaderAdvLink{$slideNumber}"
            ),
            // Image setting
            (new Extend\Settings)->serializeToForum(
                "wusong8899-client1-header-adv.Image{$slideNumber}",
                "Client1HeaderAdvImage{$slideNumber}"
            ),
        ];
    }

    /**
     * Get maximum number of slides supported
     */
    public function getMaxSlides(): int
    {
        return $this->maxSlides;
    }

    /**
     * Validate slide number is within range
     */
    public function isValidSlideNumber(int $slideNumber): bool
    {
        return $slideNumber >= 1 && $slideNumber <= $this->maxSlides;
    }
}