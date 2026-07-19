import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LiveFeed.css';

gsap.registerPlugin(ScrollTrigger);

function TikTokLogo() {
  return (
    <svg className="tiktok-logo" viewBox="0 0 52 52" fill="none" aria-hidden="true" style={{ width: '22px', height: '22px' }}>
      <path
        d="M36 8c.8 4.4 3.5 7.2 7.8 7.9v7.8c-2.7.1-5.2-.6-7.8-2.2v15.9c0 7.9-6 13.6-13.8 13.6C14.2 51 8 44.8 8 36.7S14.1 22 22.3 22c.6 0 1.2.1 1.7.1v8c-.5-.1-1.1-.2-1.7-.2-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7V8H36Z"
        fill="#D4AF6A"
        opacity="0.9"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════
   LiveFeed Section — Behind the Curtain (خلف الستار)
   ══════════════════════════════════════════ */
export default function LiveFeed() {
  const sectionRef = useRef(null);

  useEffect(() => {
    // تحميل سكريبت تيك توك الرسمي لتهيئة الـ blockquote
    const scriptId = 'tiktok-embed-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // إعادة تهيئة الـ Embeds إذا كان السكريبت محملاً بالفعل
      if (window.tiktokEmbed && typeof window.tiktokEmbed.render === 'function') {
        window.tiktokEmbed.render();
      }
    }

    const ctx = gsap.context(() => {
      /* ① Header entrance */
      gsap.fromTo('.livefeed-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* ② Emerald Curtain Frame entrance */
      gsap.fromTo('.emerald-curtain-container',
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.emerald-curtain-container',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* ③ Follow button */
      gsap.fromTo('.livefeed-follow',
        { opacity: 0, y: 25 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.livefeed-follow',
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );

    }, sectionRef); // ✅ scoped

    return () => ctx.revert(); // ✅ cleanup
  }, []);

  return (
    <section id="live" className="livefeed-section" ref={sectionRef}>

      {/* Header */}
      <div className="livefeed-header">
        <span className="livefeed-eyebrow">Behind the Curtain</span>
        <h2 className="livefeed-title">خلف الستار</h2>
        <div className="gold-divider" />
        <p className="livefeed-subtitle">
          ألقي نظرة على كواليس ورشتنا وتصوير طلبياتنا اليومية مباشرة من حساب تيك توك
        </p>
      </div>

      {/* Emerald Curtain Display Frame */}
      <div className="emerald-curtain-container">
        {/* طيات القماش المخملي يميناً ويساراً */}
        <div className="curtain-drape curtain-drape-left" />
        <div className="curtain-drape curtain-drape-right" />
        
        {/* أربطة الستارة الذهبية */}
        <div className="curtain-tassel left-tassel">✦</div>
        <div className="curtain-tassel right-tassel">✦</div>

        {/* مسرح العرض */}
        <div className="curtain-stage">
          <div className="stage-gold-border">
            <div className="tiktok-embed-container">
              <blockquote 
                className="tiktok-embed" 
                cite="https://www.tiktok.com/@yasoo_handmade" 
                data-unique-id="yasoo_handmade" 
                data-embed-type="creator" 
                style={{ width: '100%', margin: '0 auto', minHeight: '400px' }}
              > 
                <section> 
                  <a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@yasoo_handmade">@yasoo_handmade</a> 
                </section> 
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Follow CTA */}
      <div className="livefeed-follow">
        <div className="follow-buttons-wrap">
          <a
            href="https://www.tiktok.com/@yasoo_handmade"
            target="_blank"
            rel="noopener noreferrer"
            className="follow-btn"
            aria-label="تابعينا على تيك توك"
          >
            <TikTokLogo />
            <span>تابعينا على تيك توك</span>
          </a>
        </div>
      </div>

    </section>
  );
}
