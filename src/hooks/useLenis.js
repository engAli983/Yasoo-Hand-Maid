import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function useLenis() {
  useEffect(() => {
    lenisInstance = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenis = lenisInstance;

    // ✅ GSAP + Lenis integration الرسمي:
    // نستخدم GSAP ticker بدل rAF منفصل عشان loop واحد بس
    gsap.ticker.add((time) => {
      lenisInstance?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger يتحدث مع كل scroll event من Lenis
    lenisInstance.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove((time) => {
        lenisInstance?.raf(time * 1000);
      });
      lenisInstance.destroy();
      lenisInstance = null;
      window.lenis = null;
    };
  }, []);

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}
