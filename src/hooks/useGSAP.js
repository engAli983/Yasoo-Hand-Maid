import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook بسيط يربط GSAP مع ScrollTrigger على عنصر معين
 */
export function useGSAPScrollTrigger(callback, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      callback(ref.current, gsap, ScrollTrigger);
    }, ref);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
