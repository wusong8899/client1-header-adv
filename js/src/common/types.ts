/**
 * Simplified Type Definitions
 * Ultra-minimal type definitions for the client1-header-adv extension
 */

// =============================================================================
// CORE DATA STRUCTURES
// =============================================================================

/**
 * Slide data structure
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
// Social media links removed

/**
 * Header icon configuration
 */
export interface HeaderIcon {
  url: string; // Logo图片URL
  link: string; // Logo点击链接
}

/**
 * Extension settings structure
 */
export interface ExtensionSettings {
  slides: SlideData[];
  transitionTime: number;
  headerIcon?: HeaderIcon;
  tagGlideTitle?: string; // Tag轮播区域的标题文字
  tagGlideTitleIcon?: string; // Tag轮播标题的图标URL
}

// =============================================================================
// ADMIN COMPONENT TYPES
// =============================================================================

/**
 * Social media platform configuration
 */
// SocialPlatform removed

// =============================================================================
// GLIDE TYPES
// =============================================================================

/**
 * Basic Glide instance interface
 */
export interface GlideInstance {
  destroy: () => void;
  update: () => void;
  go: (pattern: string | number) => void;
  mount: () => GlideInstance;
  on: (events: string | string[], handler: Function) => void;
  play: () => void;
  pause: () => void;
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
