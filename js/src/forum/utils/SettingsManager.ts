import app from 'flarum/forum/app';
import type { ExtensionSettings } from '../../common/types';

/**
 * Centralized Settings Manager
 * 
 * Provides a single source of truth for extension settings loading.
 * Uses modern JSON format for all extension data.
 * Used by SlideShow, TagSwiper, and SocialMediaButtons components.
 */
let settingsInstance: ExtensionSettings | null = null;

/**
 * Get extension settings with caching
 */
export function getSettings(): ExtensionSettings {
  if (settingsInstance) {
    return settingsInstance;
  }

  settingsInstance = loadSettings();
  return settingsInstance;
}

/**
 * Force reload settings (for admin updates)
 */
export function reloadSettings(): ExtensionSettings {
  settingsInstance = null;
  return getSettings();
}

/**
 * Load settings from Flarum JSON format
 */
function loadSettings(): ExtensionSettings {
  try {
    // Check if app.forum is initialized
    if (!app.forum) {
      console.warn('SettingsManager: Forum not initialized yet, returning empty settings');
      return getEmptySettings();
    }

    // Load JSON format settings
    const settingsJson = app.forum.attribute('Client1HeaderAdvSettings');
    
    if (settingsJson) {
      const parsed = typeof settingsJson === 'string' 
        ? JSON.parse(settingsJson) 
        : settingsJson;
      
      if (parsed && typeof parsed === 'object') {
        return {
          slides: parsed.slides || [],
          transitionTime: parsed.transitionTime || 5000,
          socialLinks: parsed.socialLinks || [],
          headerIcon: parsed.headerIcon || { url: '', link: '' },
          tagGlideTitle: parsed.tagGlideTitle || '',
          tagGlideTitleIcon: parsed.tagGlideTitleIcon || ''
        };
      }
    }

    // Return empty settings if no valid JSON found
    return getEmptySettings();
  } catch (error) {
    console.error('SettingsManager: Failed to load settings:', error);
    return getEmptySettings();
  }
}


/**
 * Return empty settings as fallback when forum isn't initialized
 */
function getEmptySettings(): ExtensionSettings {
  return {
    slides: [],
    transitionTime: 5000,
    socialLinks: [],
    headerIcon: {
      url: '',
      link: ''
    },
    tagGlideTitle: '',
    tagGlideTitleIcon: ''
  };
}

/**
 * Get active slides (filtered and sorted)
 */
export function getActiveSlides() {
  const settings = getSettings();
  return settings.slides
    .filter(slide => slide.active && slide.image)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get active social links (with both URL and icon)
 */
export function getActiveSocialLinks() {
  const settings = getSettings();
  return settings.socialLinks.filter(link => 
    link.url && link.icon && 
    link.url.trim() !== '' && 
    link.icon.trim() !== ''
  );
}

/**
 * Get transition time for slideshows
 */
export function getTransitionTime(): number {
  return getSettings().transitionTime;
}

/**
 * Get header icon configuration
 */
export function getHeaderIcon() {
  const settings = getSettings();
  return settings.headerIcon || {
    url: '',
    link: ''
  };
}

/**
 * Check if extension has any content to display
 */
export function hasContent(): boolean {
  const activeSlides = getActiveSlides();
  const activeSocialLinks = getActiveSocialLinks();
  return activeSlides.length > 0 || activeSocialLinks.length > 0;
}

/**
 * Debug: Log current settings
 */
export function debugSettings(): void {
  const settings = getSettings();
  console.log('SettingsManager Debug:', {
    totalSlides: settings.slides.length,
    activeSlides: getActiveSlides().length,
    socialLinks: settings.socialLinks.length,
    activeSocialLinks: getActiveSocialLinks().length,
    transitionTime: settings.transitionTime
  });
}