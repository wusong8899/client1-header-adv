export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface AppConfig {
  extensionId: string;
  translationPrefix: string;
}

export interface SliderDomConfig {
  containerId: string; // e.g., 'swiperAdContainer'
  swiperClass: string; // e.g., 'adSwiper'
}

export interface SwiperCoverflowConfig {
  rotate: number;
  depth: number;
  modifier: number;
  slideShadows: boolean;
  stretch: number;
}

export interface SwiperPaginationConfig {
  el: string;
  type: 'bullets' | 'fraction' | 'progressbar' | 'custom';
}

export interface SwiperNavigationConfig {
  nextEl: string;
  prevEl: string;
}

export interface SwiperOptionsConfig {
  spaceBetween: number;
  effect: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | string;
  centeredSlides: boolean;
  slidesPerView: number | 'auto';
  coverflowEffect: SwiperCoverflowConfig;
  pagination: SwiperPaginationConfig;
  navigation: SwiperNavigationConfig;
}

export interface SliderConfig {
  maxSlides: number;
  defaultTransitionTime: number; // ms
  checkTime: number; // ms, small polling interval
  dataCheckInterval: number; // ms, UI/data polling
  dom: SliderDomConfig;
  swiper: SwiperOptionsConfig;
}

export interface UIConfig {
  headerIconId: string;
  headerIconUrl: string;
}

export interface DataConfig {
  apiResources: {
    buttonsCustomizationList: string;
    linksQueueList: string;
  };
}

export interface RootConfig {
  env: Environment;
  app: AppConfig;
  slider: SliderConfig;
  ui: UIConfig;
  data: DataConfig;
}

