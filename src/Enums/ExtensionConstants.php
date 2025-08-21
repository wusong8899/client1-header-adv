<?php

declare(strict_types=1);

namespace wusong8899\Client1HeaderAdv\Enums;

/**
 * Extension constants using PHP 8.1+ enums
 * Contains configuration values and limits for the extension
 */
enum ExtensionConstants: string
{
    case EXTENSION_ID = 'wusong8899-client1-header-adv';
    case DEFAULT_MAX_SLIDES = '30';
    case DEFAULT_TRANSITION_TIME = '5000';
    case MIN_TRANSITION_TIME = '1000';
    case MAX_TRANSITION_TIME = '30000';

    /**
     * Get the value as an integer (for numeric constants)
     */
    public function asInt(): int
    {
        return (int) $this->value;
    }

    /**
     * Get extension setting keys
     */
    public static function getSettingKey(string $setting): string
    {
        return self::EXTENSION_ID->value . '.' . $setting;
    }

    /**
     * Validate transition time is within acceptable range
     */
    public static function isValidTransitionTime(int $time): bool
    {
        return $time >= self::MIN_TRANSITION_TIME->asInt() 
            && $time <= self::MAX_TRANSITION_TIME->asInt();
    }
}

/**
 * Enum for asset file paths
 */
enum AssetPaths: string
{
    case ADMIN_JS = '/../js/dist/admin.js';
    case FORUM_JS = '/../js/dist/forum.js';
    case ADMIN_CSS = '/../less/admin.less';
    case FORUM_CSS = '/../less/forum.less';
    case LOCALES = '/../locale';

    /**
     * Get full path relative to src directory
     */
    public function getFullPath(string $srcDir): string
    {
        return $srcDir . $this->value;
    }
}