import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DesignsModal from './DesignsModal';

// استيراد الصور الحقيقية للأقسام الثلاثة الجديدة كأغلفة للكروت
import contractCover from '../../assets/contract/contract_1.webp';
import jewelCover from '../../assets/jewels/jewel_1.webp';
import caseCover from '../../assets/cases/case_1.webp';

import './Rooms.css';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   بيانات الأقسام الثلاثة (ليالي العقد، خزانة الجواهر، جراب اللحظة)
   ══════════════════════════════════════════ */
const ROOMS = [
  {
    id: 'contract',
    number: '٠١',
    title: 'ليالي العقد',
    titleEn: 'Night of the Contract',
    desc: 'كل تفاصيل ليلة العقد، من المرايا للورد للمناديل، مصممة بإيد واحدة عشان تبقى ليلتك مختلفة.',
    accent: '#D4AF6A',
    image: contractCover,
    delivery: '٣-٥ أيام',
    products: [
      'مرايا كتب الكتاب بالورد الطبيعي',
      'بوكيهات الورد الهاند ميد الفاخرة',
      'مناديل كتب الكتاب المطرزة باللؤلؤ',
      'أقلام كتب الكتاب بالأسماء الحصرية',
    ],
  },
  {
    id: 'jewels',
    number: '٠٢',
    title: 'خزانة الجواهر',
    titleEn: 'The Jewel Cabinet',
    desc: 'تفاصيل صغيرة بتفرق، كل قطعة اتصممت تلمع بطريقتها.',
    accent: '#4AA68A',
    image: jewelCover,
    delivery: '٢-٤ أيام',
    products: [
      'سلاسل هاند ميد مطلية بالذهب',
      'خواتم وإكسسوارات زفاف بالخرز',
      'أساور وقطع فنية للعروسين',
      'إكسسوارات شعر مرصعة بالكريستال',
    ],
  },
  {
    id: 'cases',
    number: '٠٣',
    title: 'جراب اللحظة',
    titleEn: 'The Moment Case',
    desc: 'جرابات هواتف مصممة يدوياً ومرصعة باللؤلؤ والكريستال اللامع لترافقك الأناقة في كل مكان.',
    accent: '#C9A8D9',
    image: caseCover,
    delivery: '٢-٣ أيام',
    products: [
      'جراب اللؤلؤ والذهب الفاخر',
      'جراب كريستال ناعم ومميز',
      'جراب الريزن والورد المجفف',
      'تصميمات خاصة مخصصة بالطلب',
    ],
  },
];

/* ══════════════════════════════════════════
   Room Card Component
   ══════════════════════════════════════════ */
function RoomCard({ room, onShowDesigns }) {
  // توليد رابط الواتساب الحقيقي للقسم المحدد
  const waMessage = `أهلاً ياسو، عايزة أطلب تصميم من قسم ${room.title}`;
  const waLink = `https://wa.me/201066307580?text=${encodeURIComponent(waMessage)}`;

  return (
    <article
      className="room-card"
      style={{ '--room-accent': room.accent }}
      aria-label={`غرفة ${room.title}`}
    >
      {/* Background Image Overlay */}
      <div className="room-card-bg" style={{ backgroundImage: `url(${room.image})` }} />

      {/* Header */}
      <div className="room-card-header">
        <span className="room-number" aria-hidden="true">{room.number}</span>
      </div>

      {/* Body */}
      <div className="room-card-body">
        <h3 className="room-title">{room.title}</h3>
        <span className="room-subtitle-label">{room.titleEn}</span>
        
        {/* تفاصيل التسليم فقط وبدون أسعار */}
        <div className="room-meta">
          <span className="room-delivery" style={{ borderColor: `${room.accent}33`, color: room.accent, backgroundColor: `${room.accent}12` }}>التسليم خلال {room.delivery}</span>
        </div>

        <p className="room-desc">{room.desc}</p>

        <hr className="room-divider"
          style={{ background: `linear-gradient(90deg,transparent,${room.accent},transparent)` }}
        />

        <ul className="room-products" aria-label="منتجات الغرفة">
          {room.products.map((p, i) => (
            <li key={i} className="room-product-item">
              <span className="product-bullet" style={{ color: room.accent }}>◇</span>
              <span className="product-text">{p}</span>
              {i === 0 && <span className="badge-best-seller" style={{ backgroundColor: room.accent }}>الأكثر طلبًا</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="room-cta-area">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="room-order-btn"
          style={{ borderColor: room.accent, color: room.accent }}
        >
          اطلبي تصميمك
        </a>
        <button
          className="room-designs-btn"
          style={{ borderColor: room.accent, color: room.accent }}
          onClick={() => onShowDesigns(room)}
        >
          شوفي كل التصاميم
        </button>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════
   Rooms Section
   ══════════════════════════════════════════ */
export default function Rooms() {
  const sectionRef  = useRef(null);
  const wrapRef     = useRef(null);
  const trackRef    = useRef(null);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 769px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      const { isDesktop, isMobile } = context.conditions;

      /* ① header entrance */
      gsap.fromTo('.rooms-header',
        { opacity: 0, y: isMobile ? 30 : 45 },
        {
          opacity: 1, y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? 'top 82%' : 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* ② horizontal scroll — desktop only */
      if (isDesktop && trackRef.current) {
        // مسافة السكرول متجاوبة بـ function لتعاد حساباتها عند الريسايز
        const scrollDist = () => window.innerWidth * (ROOMS.length - 1);

        gsap.to(trackRef.current, {
          x: () => -scrollDist(),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            pinSpacing: true,
            start: 'top top',
            end: () => `+=${scrollDist()}`,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }

      /* ③ كل كارد يدخل بـ stagger */
      gsap.fromTo('.room-card',
        { opacity: 0, y: isMobile ? 30 : 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: isMobile ? trackRef.current : sectionRef.current,
            start: isMobile ? 'top 82%' : 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

    });

    return () => mm.revert();
  }, []);

  return (
    <section id="rooms" className="rooms-section" ref={sectionRef}>

      {/* Header */}
      <div className="rooms-header">
        <span className="rooms-eyebrow">الأتيليه الزجاجي</span>
        <h2 className="rooms-title">الغرف الثلاثة</h2>
        <div className="gold-divider" />
        <p className="rooms-subtitle">كل غرفة حكاية... اختاري الفئة التي تناسبك واستكشفي التصاميم</p>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="rooms-wrap" ref={wrapRef}>
        <div className="rooms-track" ref={trackRef}>
          {ROOMS.map(room => (
            <div key={room.id} className="rooms-panel">
              <RoomCard room={room} onShowDesigns={openModal} />
            </div>
          ))}
        </div>
      </div>

      {/* مؤشر السكرول الأفقي */}
      <div className="rooms-progress-hint" aria-hidden="true">
        <span>اسحبي للاستكشاف</span>
        <span className="scroll-arrow-h">→</span>
      </div>

      {/* مودال تصاميم الغرفة */}
      <DesignsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        room={selectedRoom}
      />

    </section>
  );
}
