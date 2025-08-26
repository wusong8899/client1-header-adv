/**
 * Simplified Type Definitions
 * Ultra-minimal type definitions for the client1-header-adv extension
 */

// =============================================================================
// CORE DATA STRUCTURES
// =============================================================================

/**
 * Simplified slide data structure
 */
export interface SlideData {
  id: string;
  image: string;
  link: string;
  active: boolean;
  order: number;
}

/**
 * Social media link structure
 */
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

/**
 * Header icon configuration
 */
export interface HeaderIcon {
  url: string;    // Logo图片URL
  link: string;   // Logo点击链接
}

/**
 * Extension settings structure
 */
export interface ExtensionSettings {
  slides: SlideData[];
  transitionTime: number;
  socialLinks: SocialLink[];
  headerIcon?: HeaderIcon;
}

// =============================================================================
// ADMIN COMPONENT TYPES
// =============================================================================

/**
 * Social media platform configuration
 */
export interface SocialPlatform {
  name: string;
  urlKey: string;
  iconKey: string;
}

// =============================================================================
// SWIPER TYPES
// =============================================================================

/**
 * Basic Swiper instance interface
 */
export interface SwiperInstance {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
  update: () => void;
  slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Simple error state
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
}