import { useEffect, useRef } from 'react';

/**
 * Hook: يرجع position الماوس كـ normalized values بين -1 و 1
 * يتعطل تلقائياً على الأجهزة التي تعمل باللمس (Touch Devices) لتوفير الأداء ومنع القفزات المفاجئة.
 */
export function useMouseParallax(strength = 0.02) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouch = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0;

    if (isTouch) return; // تعطيل حركة الماوس على أجهزة اللمس

    const handleMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2 * strength;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2 * strength;
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [strength]);

  return mouse;
}
