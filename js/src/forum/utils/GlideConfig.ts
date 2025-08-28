import type { GlideInstance } from '../../common/types';

export interface GlideOptions {
  type?: string;
  perView?: number;
  focusAt?: number | string;
  startAt?: number;
  gap?: number;
  autoplay?: number | boolean;
  hoverpause?: boolean;
  keyboard?: boolean;
  bound?: boolean;
  rewind?: boolean;
  rewindDuration?: number;
  animationDuration?: number;
  breakpoints?: Record<string, Partial<GlideOptions>>;
}

export function getSlideShowGlideConfig(slideCount: number, transitionTime: number): GlideOptions {
  const isMobile = window.innerWidth < 768;
  const requiredSlides = isMobile ? 2 : 4;
  const enableLoop = slideCount >= requiredSlides;

  return {
    type: enableLoop ? 'carousel' : 'slider',
    perView: 2,
    focusAt: 0,
    gap: 30,
    autoplay: transitionTime,
    hoverpause: true,
    keyboard: true,
    bound: !enableLoop,
    rewind: !enableLoop,
    rewindDuration: 800,
    animationDuration: 400,

    breakpoints: {
      1440: { perView: 2, gap: 25 },
      1024: { perView: 2, gap: 20 },
      768: { perView: 1, gap: 15 },
      640: { perView: 1, gap: 20 },
      480: { perView: 1, gap: 15 },
      320: { perView: 1, gap: 10 }
    }
  };
}

export function getTagGlideConfig(): GlideOptions {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;

  return {
    type: 'carousel',
    perView: isMobile ? 1.1 : isTablet ? 1.8 : 2.8,
    focusAt: 0,
    gap: isMobile ? 15 : 20,
    autoplay: 5000,
    hoverpause: !isMobile,
    keyboard: true,
    bound: false,
    rewind: false,
    animationDuration: 600,

    breakpoints: {
      1440: { perView: 3, gap: 25 },
      1024: { perView: 2, gap: 20 },
      768: { perView: 2, gap: 15 },
      640: { perView: 2, gap: 20 },
      480: { perView: 2, gap: 15 },
      320: { perView: 2, gap: 10 }
    }
  };
}

export function getEventCallbacks(componentName: string) {
  return {
    mount: () => {
      console.log(`${componentName} Glide initialized`);
    },
    destroy: () => {
      console.log(`${componentName} Glide destroyed`);
    }
  };
}

export function findContainer(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
  }
  return null;
}

export function destroyGlide(glide: GlideInstance | null, containerSelector?: string): void {
  if (glide && typeof glide.destroy === 'function') {
    try {
      glide.destroy();

      if (containerSelector) {
        const container = document.querySelector(containerSelector) as any;
        if (container) {
          container.glideInstance = null;
        }
      }
    } catch (error) {
      console.error('Error destroying Glide:', error);
    }
  }
}

export async function initializeGlide(
  container: HTMLElement,
  config: GlideOptions,
  componentName: string
): Promise<GlideInstance | null> {
  try {
    const { default: Glide } = await import('@glidejs/glide');

    if (!Glide) {
      throw new Error(`${componentName}: Glide class not found`);
    }

    const glide = new Glide(container, config);

    glide.on('mount.after', () => {
      getEventCallbacks(componentName).mount();
    });

    glide.on('destroy', () => {
      getEventCallbacks(componentName).destroy();
    });

    const instance = glide.mount() as GlideInstance;
    (container as any).glideInstance = instance;

    return instance;
  } catch (error) {
    console.error(`Failed to initialize ${componentName}:`, error);
    return null;
  }
}

class CarouselManager {
  private instances: Map<string, {
    glide: GlideInstance;
    config: GlideOptions;
    type: string;
  }> = new Map();

  register(instanceId: string, glideInstance: GlideInstance, config: GlideOptions): void {
    this.instances.set(instanceId, {
      glide: glideInstance,
      config,
      type: config.type || 'carousel'
    });
  }

  unregister(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      try {
        if (instance.glide && typeof instance.glide.destroy === 'function') {
          instance.glide.destroy();
        }
      } catch (error) {
        console.error('Error destroying Glide instance during unregister:', error);
      } finally {
        this.instances.delete(instanceId);
      }
    }
  }

  pauseOthers(activeId: string): void {
    this.instances.forEach((instance, id) => {
      if (id !== activeId && instance.config.autoplay) {
        instance.glide.pause();
      }
    });
  }

  cleanupAll(): void {
    this.instances.forEach((instance) => {
      try {
        instance.glide.destroy();
      } catch (error) {
        console.error('Error cleaning up Glide instance:', error);
      }
    });
    this.instances.clear();
  }
}

export const carouselManager = new CarouselManager();