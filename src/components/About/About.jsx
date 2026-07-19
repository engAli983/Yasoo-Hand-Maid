import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   قطع الزجاج المتطايرة — 8 قطع غير منتظمة
   ══════════════════════════════════════════ */
const SHARDS = [
  { id: 0, cp: 'polygon(0% 5%,  55% 0%,  58% 48%, 2%  50%)',  top: '10%', left: '26%' },
  { id: 1, cp: 'polygon(45% 0%, 100% 4%, 96% 50%, 42% 48%)', top: '10%', left: '50%' },
  { id: 2, cp: 'polygon(2%  48%, 58% 45%, 55% 92%, 0%  90%)', top: '45%', left: '26%' },
  { id: 3, cp: 'polygon(42% 45%, 98% 42%, 100% 96%, 40% 94%)',top: '45%', left: '50%' },
  { id: 4, cp: 'polygon(5%  5%,  50% 2%,  48% 18%, 8%  20%)', top: '12%', left: '28%' },
  { id: 5, cp: 'polygon(28% 55%, 72% 50%, 74% 78%, 25% 82%)', top: '55%', left: '35%' },
  { id: 6, cp: 'polygon(12% 25%, 48% 20%, 45% 55%, 10% 58%)', top: '30%', left: '30%' },
  { id: 7, cp: 'polygon(58% 18%, 94% 12%, 92% 48%, 55% 52%)', top: '25%', left: '52%' },
];

/* نص "من احنا" — مقسّم لكلمات للـ reveal */
const ABOUT_WORDS = 'نصنع من كل خيط دهبي ذكرى لا تُنسى ومن كل لؤلؤة قصة تحكيها الأيام'.split(' ');

/* تايم لاين مراحل الصناعة */
const TIMELINE_STEPS = [
  { title: 'فكرة', desc: 'كل قطعة تبدأ بفكرة وحلم ننسجه خصيصاً لكِ.' },
  { title: 'تصميم', desc: 'رسم المخطط وتحديد اللمسات الفنية والديكور.' },
  { title: 'صبر ولؤلؤ', desc: 'تثبيت حبات اللؤلؤ ونسج الخيط الذهبي بدقة فائقة.' },
  { title: 'توصيل', desc: 'تعبئة زجاجية فاخرة لتصلكِ قطعة مجوهرات حقيقية.' }
];

export default function About() {
  const sectionRef = useRef(null);
  const wordsRef   = useRef([]);
  const shardsRef  = useRef([]);
  const timelineStepsRef = useRef([]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 769px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      const { isMobile } = context.conditions;

      gsap.fromTo('.about-heading',
        { opacity: 0, y: isMobile ? 30 : 45 },
        {
          opacity: 1, y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? 'top 82%' : 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        wordsRef.current.filter(Boolean),
        { opacity: 0, y: isMobile ? 18 : 28, rotateX: 15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: isMobile ? 0.05 : 0.07,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? 'top 75%' : 'top 65%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      shardsRef.current.filter(Boolean).forEach((el, i) => {
        const angle = (i / SHARDS.length) * Math.PI * 2;
        const dist = isMobile ? (200 + Math.random() * 100) : (500 + Math.random() * 250);
        
        gsap.fromTo(el,
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            rotation: Math.random() * 600 - 300,
            opacity: 0,
            scale: 0.15,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            scale: 1,
            duration: isMobile ? 1.4 : 1.8,
            delay: i * (isMobile ? 0.04 : 0.08),
            ease: 'power4.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: isMobile ? 'top 85%' : 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      gsap.fromTo('.about-signature',
        { opacity: 0, y: 15 },
        {
          opacity: 0.95,
          y: 0,
          duration: 1.0,
          delay: isMobile ? 0.4 : 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.about-text',
            start: isMobile ? 'top 70%' : 'top 60%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      if (isMobile) {
        gsap.fromTo('.timeline-line',
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            duration: 1.2,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: '.about-timeline',
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      } else {
        gsap.fromTo('.timeline-line',
          { scaleX: 0, transformOrigin: 'right center' },
          {
            scaleX: 1,
            duration: 1.2,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: '.about-timeline',
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      gsap.fromTo(
        timelineStepsRef.current.filter(Boolean),
        { opacity: 0, y: isMobile ? 20 : 30 },
        {
          opacity: 1,
          y: 0,
          stagger: isMobile ? 0.12 : 0.18,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-timeline',
            start: isMobile ? 'top 85%' : 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      gsap.fromTo('.about-value-item',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-values',
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }
      );

    }, sectionRef);

    return () => mm.revert();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>

      {/* ── خلفية قطع الزجاج ── */}
      <div className="about-board-wrap" aria-hidden="true">
        {SHARDS.map((s, i) => (
          <div
            key={s.id}
            className="glass-shard"
            ref={el => { shardsRef.current[i] = el; }}
            style={{ clipPath: s.cp, top: s.top, left: s.left }}
          />
        ))}
        <div className="board-frame" />
      </div>

      {/* ── محتوى السكشن ── */}
      <div className="about-content">
        <span className="about-eyebrow">Glass Atelier — قصتنا</span>

        <h2 className="about-heading">من احنا</h2>

        <div className="gold-divider about-divider" />

        {/* text reveal */}
        <p className="about-text" role="text" aria-label="نصنع من كل خيط دهبي ذكرى لا تنسى">
          {ABOUT_WORDS.map((word, i) => (
            <span
              key={i}
              className="about-word"
              ref={el => { wordsRef.current[i] = el; }}
            >
              {word}{' '}
            </span>
          ))}
        </p>

        {/* توقيع شخصي */}
        <span className="about-signature">— اسماء، صاحبة الأتيليه الزجاجي</span>

        {/* تايم لاين الخطوات */}
        <div className="about-timeline">
          <div className="timeline-line" />
          {TIMELINE_STEPS.map((step, i) => (
            <div
              key={i}
              className="timeline-step"
              ref={el => { timelineStepsRef.current[i] = el; }}
            >
              <div className="step-circle">{i + 1}</div>
              <div className="step-info">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* القيم الثلاثة */}
        <div className="about-values">
          {[
            { icon: '◈', label: 'صبر وإتقان'         },
            { icon: '◈', label: 'تصميم فريد لكل عروسة' },
            { icon: '◈', label: 'لمسة يدوية أصيلة'    },
          ].map((v) => (
            <div key={v.label} className="about-value-item">
              <span className="value-icon">{v.icon}</span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
