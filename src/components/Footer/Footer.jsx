import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logoImg from '../../assets/logo.png';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   Footer — الخاتمة
   اللآلئ تدور حوالين الشعار (CSS animation)
   بدون Three.js Canvas — لا يوجد draw call إضافي
   ══════════════════════════════════════════ */
export default function Footer() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ① الشعار يظهر من تحت */
      gsap.fromTo('.footer-brand',
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* ② Social links تظهر بـ stagger */
      gsap.fromTo('.footer-social-link',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-socials',
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* ③ Copyright يطلع */
      gsap.fromTo('.footer-copyright',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.0,
          scrollTrigger: {
            trigger: '.footer-copyright',
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert(); // ✅ cleanup
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="footer-section" ref={sectionRef}>

      {/* خلفية ضبابية */}
      <div className="footer-bg-glow" aria-hidden="true" />

      {/* ── حلقات مدارية CSS + اللآلئ ── */}
      <div className="footer-pearl-orbit" aria-hidden="true">
        {/* الحلقات */}
        <div className="orbit-ring orbit-ring-1" />
        <div className="orbit-ring orbit-ring-2" />
        <div className="orbit-ring orbit-ring-3" />

        {/* 8 لآلئ بتدور — CSS فقط */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="pearl-orbiter" />
        ))}
      </div>

      {/* ── Brand Logo ── */}
      <div className="footer-brand">
        <img src={logoImg} alt="لوجو ياسو هاند ميد" className="footer-logo-img" />
        <div className="footer-logo-text">
          ياسو
          <span className="footer-logo-accent">هاند ميد</span>
        </div>
        <span className="footer-tagline">The Glass Atelier · منذ ٢٠٢٤</span>
      </div>

      {/* ── الخط الدهبي ── */}
      <div className="gold-divider footer-divider" />

      {/* ── Nav Links ── */}
      <nav className="footer-nav" aria-label="روابط التنقل">
        {[
          { label: 'من احنا',      id: 'about' },
          { label: 'الغرف الثلاثة', id: 'rooms' },
          { label: 'خلف الستار',    id: 'live'  },
          { label: 'اطلبي تصميمك', id: 'order' },
        ].map(({ label, id }) => (
          <button
            key={id}
            className="footer-nav-link"
            onClick={() => scrollTo(id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Social Links ── */}
      <div className="footer-socials">
        <a
          href="https://www.tiktok.com/@yasoo_handmade"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
          aria-label="تيك توك"
        >
          <span className="social-icon">🎵</span>
          TikTok
        </a>
        <a
          href="https://wa.me/201066307580"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
          aria-label="واتساب"
        >
          <span className="social-icon">💬</span>
          WhatsApp
        </a>
      </div>

      {/* ── Copyright ── */}
      <p className="footer-copyright">
        © {new Date().getFullYear()} Yasso Hand Maid — جميع الحقوق محفوظة
        <br />
        صُنع بالحب والذهب — The Glass Atelier
      </p>

    </footer>
  );
}
