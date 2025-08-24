<?php

declare(strict_types=1);

namespace wusong8899\Client1HeaderAdv\Services;

use Flarum\Extend;

/**
 * Service for generating slide-related settings configurations
 */
final class SlideSettingsService
{
    public function __construct(
        private readonly int $maxSlides = 30
    ) {}

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