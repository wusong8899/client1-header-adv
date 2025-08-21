// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
// Comprehensive type definitions for the client1-header-adv extension

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface SliderConfig {
  maxSlides: number;
  checkTime: number;
  defaultTransitionTime: number;
  dom: SliderDomConfig;
  swiper: SwiperOptionsConfig;
}

export interface SliderDomConfig {
  containerId: string;
  swiperClass: string;
}

export interface SwiperOptionsConfig {
  spaceBetween: number;
  effect: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip';
  centeredSlides: boolean;
  slidesPerView: number | 'auto';
  coverflowEffect: CoverflowEffectConfig;
  pagination: PaginationConfig;
  navigation: NavigationConfig;
}

export interface CoverflowEffectConfig {
  rotate: number;
  depth: number;
  modifier: number;
  slideShadows: boolean;
  stretch: number;
}

export interface PaginationConfig {
  el: string;
  type: 'bullets' | 'fraction' | 'progressbar' | 'custom';
}

export interface NavigationConfig {
  nextEl: string;
  prevEl: string;
}

export interface ExtensionConfig {
  slider: SliderConfig;
}

// =============================================================================
// SLIDE TYPES
// =============================================================================

export interface SlideData {
  id: number;
  link: string;
  image: string;
}

export interface SlideValidation {
  isValid: boolean;
  errors: string[];
}

export interface SlideSettings {
  [key: string]: string | undefined;
}

// =============================================================================
// SOCIAL MEDIA TYPES
// =============================================================================

export interface SocialPlatform {
  name: string;
  urlKey: string;
  iconKey: string;
}

export interface SocialMediaConfig {
  platforms: SocialPlatform[];
}

// =============================================================================
// ADMIN COMPONENT TYPES
// =============================================================================

export interface DynamicSlideSettingsComponentAttrs {
  extensionId: string;
  maxSlides?: number;
}

export interface HeaderIconSettingComponentAttrs {
  extensionId: string;
}

export interface SettingConfig {
  setting: string;
  type: 'number' | 'url' | 'text' | 'boolean';
  label: string;
  help?: string;
}

// =============================================================================
// FORUM COMPONENT TYPES
// =============================================================================

export interface SlideshowManagerConfig {
  transitionTime: number;
  maxSlides: number;
  checkTime: number;
}

export interface MobileConfig {
  widthMultiplier: number;
  marginFactor: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// =============================================================================
// SWIPER TYPES
// =============================================================================

export interface SwiperInstance {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
  update: () => void;
  slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
  slideNext: (speed?: number, runCallbacks?: boolean) => void;
  slidePrev: (speed?: number, runCallbacks?: boolean) => void;
}

// =============================================================================
// DOM UTILITY TYPES
// =============================================================================

export interface DOMUtilsInterface {
  querySelector: (selector: string) => Element | null;
  querySelectorAll: (selector: string) => NodeListOf<Element>;
  getElementById: (id: string) => HTMLElement | null;
  createElement: (tagName: string, options?: CreateElementOptions) => HTMLElement;
  appendChild: (parent: Element, child: Element) => void;
  prependChild: (parent: Element, child: Element) => void;
  removeElement: (element: Element) => void;
  setStyles: (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => void;
}

export interface CreateElementOptions {
  className?: string;
  id?: string;
  innerHTML?: string;
  textContent?: string;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface ExtensionError extends Error {
  component?: string;
  context?: Record<string, any>;
  timestamp?: Date;
}

export interface ErrorHandlerInterface {
  handleError: (error: ExtensionError) => void;
  logError: (message: string, context?: Record<string, any>) => void;
}

// =============================================================================
// CONFIGURATION PROVIDER TYPES
// =============================================================================

export interface ConfigProviderInterface {
  getConfig: () => ExtensionConfig;
  updateConfig: (updates: Partial<ExtensionConfig>) => void;
  resetConfig: () => void;
}

export interface SettingsProviderInterface {
  getSetting: (key: string) => any;
  setSetting: (key: string, value: any) => Promise<void>;
  getSettings: () => Record<string, any>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
}

// =============================================================================
// MOBILE DETECTION TYPES
// =============================================================================

export interface MobileDetectionInterface {
  isMobileDevice: () => boolean;
  isTablet: () => boolean;
  isDesktop: () => boolean;
  getDeviceType: () => 'mobile' | 'tablet' | 'desktop';
}

// =============================================================================
// FLARUM INTEGRATION TYPES
// =============================================================================

export interface FlarumApp {
  forum: {
    attribute: (key: string) => any;
  };
  session: {
    user: any;
  };
  translator: {
    trans: (key: string, parameters?: Record<string, any>) => string;
  };
  extensionData: {
    for: (extensionId: string) => any;
  };
  data: {
    settings: Record<string, any>;
  };
  request: (options: RequestOptions) => Promise<any>;
}

export interface RequestOptions {
  method: string;
  url: string;
  body?: Record<string, any>;
}

// =============================================================================
// COMPONENT STATE TYPES
// =============================================================================

export interface ComponentState<T = any> {
  data: T;
  loading: boolean;
  error: ErrorState;
}

export interface SlideComponentState {
  slides: SlideData[];
  nextId: number;
  loading: boolean;
  error: ErrorState;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface URLValidationOptions {
  allowEmpty?: boolean;
  protocols?: string[];
  maxLength?: number;
}

export interface SlideValidationOptions {
  requireImage?: boolean;
  requireLink?: boolean;
  maxImageSize?: number;
  allowedImageFormats?: string[];
}

// =============================================================================
// EVENT TYPES
// =============================================================================

export interface SlideChangeEvent {
  slideId: number;
  field: 'link' | 'image';
  value: string;
}

export interface SlideActionEvent {
  action: 'add' | 'remove' | 'update';
  slideId?: number;
  data?: Partial<SlideData>;
}

// =============================================================================
// HOOKS TYPES
// =============================================================================

export interface UseSettingsHook {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
  loading: boolean;
  error: ErrorState;
}

export interface UseSwiperHook {
  swiper: SwiperInstance | null;
  initialize: (element: HTMLElement, options: any) => void;
  destroy: () => void;
  update: () => void;
}

export interface UseMobileDetectionHook {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}