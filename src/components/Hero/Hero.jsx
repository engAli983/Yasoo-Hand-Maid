import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import logoImg from '../../assets/logo.png';
import './Hero.css';

/* ══════════════════════════════════════════
   [1] نجوم الخلفية — Points + BufferGeometry
   draw call واحد بدل آلاف الـ meshes
   ══════════════════════════════════════════ */
function StarField({ count = 1200 }) {
  // نحسب الـ geometry مرة واحدة بس عند mount
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // كرة نصف قطرها بين 40 و 80
      const r     = 40 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.4 + Math.random() * 1.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count]);

  const material = useMemo(() => new THREE.PointsMaterial({
    color: 0xF3ECDD,
    size: 0.18,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  }), []);

  return <points geometry={geometry} material={material} />;
}

/* ══════════════════════════════════════════
   [2] بيانات اللآلئ — قُللت لـ 9 لآلئ
   segments: 20 بدل 40 (ربع عدد المثلثات)
   ══════════════════════════════════════════ */
const PEARL_DATA = [
  { id: 0, pos: [-3.8,  1.8, -2.5], r: 0.22, spd: 0.35, ph: 0.0  },
  { id: 1, pos: [ 3.2,  1.2, -2.0], r: 0.15, spd: 0.50, ph: 1.1  },
  { id: 2, pos: [-1.8, -1.8, -2.0], r: 0.28, spd: 0.28, ph: 2.3  },
  { id: 3, pos: [ 1.8,  2.5, -3.5], r: 0.12, spd: 0.60, ph: 0.7  },
  { id: 4, pos: [ 4.2, -0.8, -3.0], r: 0.18, spd: 0.40, ph: 1.9  },
  { id: 5, pos: [-3.2, -0.3, -2.0], r: 0.13, spd: 0.55, ph: 4.2  },
  { id: 6, pos: [ 0.8, -2.5, -2.5], r: 0.20, spd: 0.32, ph: 0.4  },
  { id: 7, pos: [ 0.3,  0.0, -5.0], r: 0.32, spd: 0.22, ph: 3.9  },
  { id: 8, pos: [-2.2,  3.0, -3.0], r: 0.14, spd: 0.45, ph: 3.2  },
];

/* [2] MeshStandardMaterial بدل MeshPhysicalMaterial
   بدون transmission/clearcoat — أسرع بكتير */
const PEARL_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#EEE4D0'),
  roughness: 0.12,
  metalness: 0.35,
  envMapIntensity: 1.2,
  emissive: new THREE.Color('#1A1208'),
  emissiveIntensity: 0.08,
});

/* [4] throttle الماوس — ref مشترك بيتحدث بـ requestAnimationFrame
   مش كل frame تلقائياً */
const mouseTarget = { x: 0, y: 0 };
const mouseCurrent = { x: 0, y: 0 };

if (typeof window !== 'undefined') {
  const isTouch = 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0;

  if (!isTouch) {
    let ticking = false;
    window.addEventListener('mousemove', (e) => {
      if (!ticking) {
        // throttle بـ rAF — يتحدث مرة كل ~16ms فقط
        requestAnimationFrame(() => {
          mouseTarget.x = (e.clientX / window.innerWidth  - 0.5) * 2;
          mouseTarget.y = -(e.clientY / window.innerHeight - 0.5) * 2;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

/* لؤلؤة واحدة */
function Pearl({ pos, r, spd, ph }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // lerp ناعم للماوس — مش abrupt
    mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.04;
    mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.04;

    ref.current.position.x = pos[0] + Math.sin(t * spd * 0.8 + ph) * 0.25 + mouseCurrent.x * 0.35;
    ref.current.position.y = pos[1] + Math.sin(t * spd       + ph) * 0.30 + mouseCurrent.y * 0.28;
    ref.current.position.z = pos[2] + Math.cos(t * spd * 0.5 + ph) * 0.10;
    ref.current.rotation.y += 0.002;
  });

  return (
    <mesh ref={ref} position={pos} material={PEARL_MATERIAL}>
      {/* [2] segments: 20×20 بدل 40×40 = ربع عدد المثلثات */}
      <sphereGeometry args={[r, 20, 20]} />
    </mesh>
  );
}

/* ══════════════════════════════════════════
   Responsive Camera Controller
   يضبط الـ FOV وموقع الكاميرا تلقائياً على الشاشات الطولية (الموبايل)
   لمنع خروج اللآلئ عن مساحة العرض.
   ══════════════════════════════════════════ */
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1.0) {
      // شاشة طولية (موبايل)
      camera.fov = 70 + (1.0 - aspect) * 28;
      camera.position.z = 6 + (1.0 - aspect) * 2.2;
    } else {
      // شاشة عرضية (كمبيوتر)
      camera.fov = 70;
      camera.position.z = 6;
    }
    camera.updateProjectionMatrix();
  }, [size.width, size.height, camera]);

  return null;
}

/* ══════════════════════════════════════════
   Scene — إضاءة مبسطة (2 lights بدل 4)
   ══════════════════════════════════════════ */
function Scene() {
  return (
    <>
      <ResponsiveCamera />
      {/* [3] إضاءتين بدل 4 — ambient + مصدر واحد دهبي */}
      <ambientLight intensity={0.6} color="#1A4A3E" />
      <pointLight
        position={[4, 3, 5]}
        intensity={2.5}
        color="#D4AF6A"
        distance={20}
        decay={2}
      />

      {/* [1] نجوم بـ Points — draw call واحد */}
      <StarField count={1200} />

      {/* [2] 9 لآلئ بدل 18 */}
      {PEARL_DATA.map(p => (
        <Pearl key={p.id} pos={p.pos} r={p.r} spd={p.spd} ph={p.ph} />
      ))}
    </>
  );
}

/* ══════════════════════════════════════════
   Golden Thread SVG Path
   ══════════════════════════════════════════ */
const THREAD_PATH =
  'M 30,320 ' +
  'C 80,290 140,275 190,295 ' +
  'C 240,315 260,355 245,385 ' +
  'C 230,415 195,420 170,405 ' +
  'C 145,390 140,365 155,345 ' +
  'C 170,325 200,322 225,335 ' +
  'C 270,358 280,395 310,400 ' +
  'C 350,408 385,385 405,355 ' +
  'C 425,325 425,285 405,262 ' +
  'C 385,239 355,238 335,255 ' +
  'C 315,272 310,300 320,325 ' +
  'C 335,355 365,365 395,358 ' +
  'C 430,350 455,320 480,305 ' +
  'C 520,280 565,278 605,300 ' +
  'C 645,322 655,362 638,390 ' +
  'C 621,418 590,422 568,408 ' +
  'C 546,394 542,368 556,350 ' +
  'C 570,332 598,330 622,342 ' +
  'C 655,360 665,390 690,388 ' +
  'C 715,386 735,365 745,342 ' +
  'C 758,312 750,278 730,262';

/* ══════════════════════════════════════════
   Hero Component
   ══════════════════════════════════════════ */
export default function Hero() {
  const handleEnter = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section" aria-label="المشهد الافتتاحي">

      {/* [3] Canvas: dpr مقيّد، antialias=false، gl.powerPreference */}
      <div className="hero-canvas-wrapper" aria-hidden="true">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 70 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            shadows={false}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      {/* تأثيرات التوهج الضبابي (CSS فقط — zero GPU cost) */}
      <div className="hero-pearl-glow glow-gold"    aria-hidden="true" />
      <div className="hero-pearl-glow glow-emerald" aria-hidden="true" />
      <div className="hero-vignette"                aria-hidden="true" />

      {/* الخيط الدهبي SVG */}
      <motion.svg
        className="hero-golden-thread"
        viewBox="0 0 760 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <defs>
          <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="gold-glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* توهج خلفي ناعم */}
        <motion.path
          d={THREAD_PATH}
          stroke="#D4AF6A"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          filter="url(#gold-glow-soft)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ duration: 3.0, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* الخيط الرئيسي */}
        <motion.path
          d={THREAD_PATH}
          stroke="#D4AF6A"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#gold-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 3.0, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* نقطة متحركة */}
        <motion.circle
          r="3"
          fill="#D4AF6A"
          filter="url(#gold-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.0, delay: 0.3, ease: 'linear', times: [0, 0.05, 0.95, 1] }}
        >
          <animateMotion
            dur="3s"
            begin="0.3s"
            fill="freeze"
            path={THREAD_PATH}
          />
        </motion.circle>
      </motion.svg>

      {/* محتوى Hero */}
      <div className="hero-content">
        <motion.img
          src={logoImg}
          alt="لوجو ياسو هاند ميد"
          className="hero-logo-img"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.span
          className="hero-tag"
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ delay: 1.4, duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          The Glass Atelier
        </motion.span>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 55 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          ياسو
          <span className="hero-title-accent">هاند ميد</span>
        </motion.h1>

        <motion.div
          className="gold-divider hero-divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 2.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 1.1 }}
        >
          شغل يدوي فاخر لمستلزمات الأفراح
        </motion.p>

        <motion.button
          id="hero-enter-btn"
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, duration: 0.9 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnter}
          aria-label="ابدئي رحلة الاستكشاف"
        >
          ادخلي عالمنا
          <span className="cta-arrow-icon" aria-hidden="true">↓</span>
        </motion.button>
      </div>

      {/* مؤشر السكرول */}
      <motion.div
        className="hero-scroll-hint"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.2, duration: 1.2 }}
      >
        <div className="scroll-line" />
      </motion.div>

    </section>
  );
}
