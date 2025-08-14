import type { RootConfig } from './types';

export const defaultConfig: RootConfig = {
  env: (process.env.NODE_ENV as any) || 'production',
  app: {
    extensionId: 'wusong8899-client1-header-adv',
    translationPrefix: 'wusong8899-client1',
  },
  slider: {
    maxSlides: 30,
    defaultTransitionTime: 5000,
    checkTime: 10,
    dataCheckInterval: 100,
    dom: {
      containerId: 'swiperAdContainer',
      swiperClass: 'adSwiper',
    },
    swiper: {
      spaceBetween: 30,
      effect: 'coverflow',
      centeredSlides: true,
      slidesPerView: 2,
      coverflowEffect: {
        rotate: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
        stretch: 0,
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    },
  },
  ui: {
    headerIconId: 'wusong8899Client1HeaderIcon',
    headerIconUrl: 'https://ex.cc/assets/files/date/test.png',
  },
  data: {
    apiResources: {
      // Links queue functionality moved to client1-links-queue extension
    },
  },
};

