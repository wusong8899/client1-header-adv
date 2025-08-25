<?php

declare(strict_types=1);

namespace wusong8899\Client1HeaderAdv\Services;

use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;

/**
 * Smart Slide Management Service
 * 
 * Unified service for managing slides with JSON-based storage,
 * batch operations, and intelligent optimization features.
 */
final class SmartSlideService
{
    private const SLIDES_SETTING_KEY = 'Client1HeaderAdvSlides';
    private const MAX_SLIDES_KEY = 'Client1HeaderAdvMaxSlides';
    private const EXTENSION_KEY_PREFIX = 'wusong8899-client1-header-adv';
    private const DEFAULT_MAX_SLIDES = 30;

    public function __construct(
        private readonly SettingsRepositoryInterface $settings
    ) {}

    /**
     * Get all slides as array
     */
    public function getAllSlides(): array
    {
        $slidesJson = $this->settings->get(self::SLIDES_SETTING_KEY, '[]');
        $slides = json_decode($slidesJson, true) ?: [];
        
        // Ensure slides are properly formatted
        return array_map([$this, 'normalizeSlide'], $slides);
    }

    /**
     * Save slides array to settings
     */
    public function saveSlides(array $slides): bool
    {
        // Validate and normalize all slides
        $normalizedSlides = array_map([$this, 'normalizeSlide'], $slides);
        
        // Remove invalid slides
        $validSlides = array_filter($normalizedSlides, [$this, 'isValidSlide']);
        
        // Re-index array and limit to max slides
        $maxSlides = $this->getMaxSlides();
        $finalSlides = array_values(array_slice($validSlides, 0, $maxSlides));
        
        $slidesJson = json_encode($finalSlides, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $this->settings->set(self::SLIDES_SETTING_KEY, $slidesJson);
        
        return true;
    }

    /**
     * Add a new slide
     */
    public function addSlide(array $slideData): array
    {
        $slides = $this->getAllSlides();
        
        $newSlide = $this->normalizeSlide(array_merge([
            'id' => $this->generateSlideId($slides),
            'content' => [
                'image' => '',
                'link' => '',
                'title' => '',
                'description' => ''
            ],
            'settings' => [
                'active' => true,
                'order' => count($slides) + 1,
                'target' => '_blank',
                'visibility' => 'all'
            ],
            'analytics' => [
                'clicks' => 0,
                'impressions' => 0,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ], $slideData));
        
        $slides[] = $newSlide;
        $this->saveSlides($slides);
        
        return $newSlide;
    }

    /**
     * Update existing slide
     */
    public function updateSlide(string $slideId, array $updateData): bool
    {
        $slides = $this->getAllSlides();
        
        foreach ($slides as $index => $slide) {
            if ($slide['id'] === $slideId) {
                $slides[$index] = $this->normalizeSlide(array_merge_recursive($slide, $updateData));
                $this->saveSlides($slides);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Delete slide by ID
     */
    public function deleteSlide(string $slideId): bool
    {
        $slides = $this->getAllSlides();
        $originalCount = count($slides);
        
        $slides = array_filter($slides, fn($slide) => $slide['id'] !== $slideId);
        
        if (count($slides) !== $originalCount) {
            // Reorder remaining slides
            $slides = array_values($slides);
            foreach ($slides as $index => $slide) {
                $slides[$index]['settings']['order'] = $index + 1;
            }
            
            $this->saveSlides($slides);
            return true;
        }
        
        return false;
    }

    /**
     * Reorder slides by IDs array
     */
    public function reorderSlides(array $slideIds): bool
    {
        $slides = $this->getAllSlides();
        $reorderedSlides = [];
        
        // Create lookup array
        $slideLookup = [];
        foreach ($slides as $slide) {
            $slideLookup[$slide['id']] = $slide;
        }
        
        // Reorder based on provided IDs
        foreach ($slideIds as $index => $slideId) {
            if (isset($slideLookup[$slideId])) {
                $slide = $slideLookup[$slideId];
                $slide['settings']['order'] = $index + 1;
                $reorderedSlides[] = $slide;
            }
        }
        
        // Add any missing slides to the end
        foreach ($slides as $slide) {
            if (!in_array($slide['id'], $slideIds)) {
                $slide['settings']['order'] = count($reorderedSlides) + 1;
                $reorderedSlides[] = $slide;
            }
        }
        
        $this->saveSlides($reorderedSlides);
        return true;
    }

    /**
     * Batch update slides
     */
    public function batchUpdate(array $operations): array
    {
        $results = [];
        
        foreach ($operations as $operation) {
            $type = $operation['type'] ?? '';
            $data = $operation['data'] ?? [];
            
            switch ($type) {
                case 'add':
                    $results[] = ['type' => 'add', 'result' => $this->addSlide($data)];
                    break;
                case 'update':
                    $slideId = $operation['slideId'] ?? '';
                    $results[] = ['type' => 'update', 'result' => $this->updateSlide($slideId, $data)];
                    break;
                case 'delete':
                    $slideId = $operation['slideId'] ?? '';
                    $results[] = ['type' => 'delete', 'result' => $this->deleteSlide($slideId)];
                    break;
                case 'reorder':
                    $slideIds = $data['slideIds'] ?? [];
                    $results[] = ['type' => 'reorder', 'result' => $this->reorderSlides($slideIds)];
                    break;
            }
        }
        
        return $results;
    }

    /**
     * Migrate from legacy format (Link1, Image1, Link2, Image2...)
     */
    public function migrateFromLegacyFormat(): bool
    {
        $maxSlides = $this->getMaxSlides();
        $migratedSlides = [];
        
        for ($i = 1; $i <= $maxSlides; $i++) {
            $link = $this->settings->get("Client1HeaderAdvLink{$i}", '');
            $image = $this->settings->get("Client1HeaderAdvImage{$i}", '');
            
            if (!empty($link) || !empty($image)) {
                $migratedSlides[] = [
                    'id' => "legacy-{$i}",
                    'content' => [
                        'image' => $image,
                        'link' => $link,
                        'title' => '',
                        'description' => ''
                    ],
                    'settings' => [
                        'active' => true,
                        'order' => $i,
                        'target' => '_blank',
                        'visibility' => 'all'
                    ],
                    'analytics' => [
                        'clicks' => 0,
                        'impressions' => 0,
                        'created_at' => date('Y-m-d H:i:s'),
                        'migrated_from_legacy' => true
                    ]
                ];
            }
        }
        
        if (!empty($migratedSlides)) {
            $this->saveSlides($migratedSlides);
            
            // Clean up legacy settings (optional - commented out for safety)
            /*
            for ($i = 1; $i <= $maxSlides; $i++) {
                $this->settings->delete("Client1HeaderAdvLink{$i}");
                $this->settings->delete("Client1HeaderAdvImage{$i}");
            }
            */
            
            return true;
        }
        
        return false;
    }

    /**
     * Get analytics summary
     */
    public function getAnalyticsSummary(): array
    {
        $slides = $this->getAllSlides();
        
        $totalClicks = 0;
        $totalImpressions = 0;
        $activeSlides = 0;
        
        foreach ($slides as $slide) {
            if ($slide['settings']['active']) {
                $activeSlides++;
                $totalClicks += $slide['analytics']['clicks'] ?? 0;
                $totalImpressions += $slide['analytics']['impressions'] ?? 0;
            }
        }
        
        return [
            'total_slides' => count($slides),
            'active_slides' => $activeSlides,
            'total_clicks' => $totalClicks,
            'total_impressions' => $totalImpressions,
            'ctr' => $totalImpressions > 0 ? round(($totalClicks / $totalImpressions) * 100, 2) : 0
        ];
    }

    /**
     * Generate Extend\Settings configuration for frontend
     */
    public function generateFrontendSettings(): array
    {
        return [
            (new Extend\Settings)->serializeToForum(
                self::EXTENSION_KEY_PREFIX . '.Slides',
                self::SLIDES_SETTING_KEY
            ),
            (new Extend\Settings)->serializeToForum(
                self::EXTENSION_KEY_PREFIX . '.MaxSlides',
                self::MAX_SLIDES_KEY
            ),
        ];
    }

    /**
     * Get maximum number of slides allowed
     */
    private function getMaxSlides(): int
    {
        return (int) $this->settings->get(self::MAX_SLIDES_KEY, self::DEFAULT_MAX_SLIDES);
    }

    /**
     * Generate unique slide ID
     */
    private function generateSlideId(array $existingSlides): string
    {
        do {
            $id = 'slide-' . uniqid();
        } while ($this->slideIdExists($id, $existingSlides));
        
        return $id;
    }

    /**
     * Check if slide ID exists
     */
    private function slideIdExists(string $id, array $slides): bool
    {
        foreach ($slides as $slide) {
            if ($slide['id'] === $id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Normalize slide data structure
     */
    private function normalizeSlide(array $slide): array
    {
        return [
            'id' => $slide['id'] ?? '',
            'content' => [
                'image' => $slide['content']['image'] ?? '',
                'link' => $slide['content']['link'] ?? '',
                'title' => $slide['content']['title'] ?? '',
                'description' => $slide['content']['description'] ?? ''
            ],
            'settings' => [
                'active' => $slide['settings']['active'] ?? true,
                'order' => (int) ($slide['settings']['order'] ?? 1),
                'target' => in_array($slide['settings']['target'] ?? '_blank', ['_blank', '_self']) 
                    ? $slide['settings']['target'] 
                    : '_blank',
                'visibility' => in_array($slide['settings']['visibility'] ?? 'all', ['all', 'desktop', 'mobile'])
                    ? $slide['settings']['visibility']
                    : 'all'
            ],
            'analytics' => [
                'clicks' => (int) ($slide['analytics']['clicks'] ?? 0),
                'impressions' => (int) ($slide['analytics']['impressions'] ?? 0),
                'created_at' => $slide['analytics']['created_at'] ?? date('Y-m-d H:i:s'),
                'last_clicked' => $slide['analytics']['last_clicked'] ?? null,
                'migrated_from_legacy' => $slide['analytics']['migrated_from_legacy'] ?? false
            ]
        ];
    }

    /**
     * Validate slide data
     */
    private function isValidSlide(array $slide): bool
    {
        return !empty($slide['id']) && 
               (!empty($slide['content']['image']) || !empty($slide['content']['link']));
    }
}