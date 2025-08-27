import app from 'flarum/forum/app';
import type { ExtensionSettings } from '../../common/types';

/**
 * Centralized Settings Manager
 * 
 * Provides a single source of truth for extension settings loading.
 * Handles both JSON format and legacy format migration automatically.
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
 * Load settings from Flarum with fallback to legacy format
 */
function loadSettings(): ExtensionSettings {
  try {
    // Check if app.forum is initialized
    if (!app.forum) {
      console.warn('SettingsManager: Forum not initialized yet, returning empty settings');
      return getEmptySettings();
    }

    // Try JSON format first
    const settingsJson = app.forum.attribute('Client1HeaderAdvSettings');
    
    if (settingsJson) {
      const parsed = typeof settingsJson === 'string' 
        ? JSON.parse(settingsJson) 
        : settingsJson;
      
      if (parsed && Array.isArray(parsed.slides)) {
        return {
          slides: parsed.slides || [],
          transitionTime: parsed.transitionTime || 5000,
          socialLinks: parsed.socialLinks || [],
          headerIcon: parsed.headerIcon || {
            url: app.forum.attribute('Client1HeaderAdvHeaderIconUrl') || '',
            link: app.forum.attribute('Client1HeaderAdvHeaderIconLink') || ''
          },
          tagGlideTitle: parsed.tagGlideTitle || '',
          tagGlideTitleIcon: parsed.tagGlideTitleIcon || ''
        };
      }
    }

    // Fallback to legacy format
    return loadLegacySettings();
  } catch (error) {
    console.error('SettingsManager: Failed to load settings:', error);
    return loadLegacySettings();
  }
}

/**
 * Load settings from legacy individual keys
 */
function loadLegacySettings(): ExtensionSettings {
  // Check if app.forum is initialized
  if (!app.forum) {
    console.warn('SettingsManager: Forum not initialized, cannot load legacy settings');
    return getEmptySettings();
  }

  const settings: ExtensionSettings = {
    slides: [],
    transitionTime: parseInt(app.forum.attribute('Client1HeaderAdvTransitionTime')) || 5000,
    socialLinks: [],
    headerIcon: {
      url: app.forum.attribute('Client1HeaderAdvHeaderIconUrl') || '',
      link: app.forum.attribute('Client1HeaderAdvHeaderIconLink') || ''
    },
    tagGlideTitle: '',
    tagGlideTitleIcon: ''
  };

  // Load up to 30 slides from legacy format
  for (let i = 1; i <= 30; i++) {
    const link = app.forum.attribute(`Client1HeaderAdvLink${i}`) || '';
    const image = app.forum.attribute(`Client1HeaderAdvImage${i}`) || '';

    if (image || link) {
      settings.slides.push({
        id: `legacy-${i}`,
        image,
        link,
        active: true,
        order: i
      });
    }
  }

  // Load social media links from legacy format
  const socialPlatforms = ['Kick', 'Facebook', 'Twitter', 'YouTube', 'Instagram'];
  socialPlatforms.forEach(platform => {
    const url = app.forum.attribute(`Client1HeaderAdvSocial${platform}Url`) || '';
    const icon = app.forum.attribute(`Client1HeaderAdvSocial${platform}Icon`) || '';

    if (url || icon) {
      settings.socialLinks.push({
        platform,
        url,
        icon
      });
    }
  });

  return settings;
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