import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DesignsModal from './DesignsModal';

// استيراد أغلفة الأقسام الثلاثة مباشرة من تخديم Supabase التلقائي
const contractCover = 'https://uvsqokeqtpdbqskznhso.supabase.co/storage/v1/object/public/products/contract/contract_1.webp';
const jewelCover = 'https://uvsqokeqtpdbqskznhso.supabase.co/storage/v1/object/public/products/jewels/jewel_1.webp';
const caseCover = 'https://uvsqokeqtpdbqskznhso.supabase.co/storage/v1/object/public/products/cases/case_1.webp';

import './Rooms.css';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   بيانات الأقسام الثلاثة الأساسية
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
    features: [
      'مرايا كتب الكتاب بالورد الطبيعي',
      'مناديل كتب الكتاب المطرزة باللؤلؤ',
      'بوكيهات الورد الهاند ميد الفاخرة'
    ]
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
    features: [
      'سلاسل وإكسسوارات زفاف بالخرز',
      'خواتم وأساور هاند ميد مطلية بالذهب',
      'مشط شعر العروس الملكي'
    ]
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
    features: [
      'جراب اللؤلؤ والذهب الفاخر',
      'جراب الكريستال الناعم للموبايل',
      'تصميمات هاند ميد مخصصة بالطلب'
    ]
  }
];

/* ══════════════════════════════════════════
   Room Card Component
   ══════════════════════════════════════════ */
function RoomCard({ room, onShowDesigns }) {
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
        
        <div className="room-meta">
          <span className="room-delivery" style={{ borderColor: `${room.accent}33`, color: room.accent, backgroundColor: `${room.accent}12` }}>
            <i className="fa-solid fa-truck-fast"></i> التسليم خلال {room.delivery}
          </span>
        </div>

        <p className="room-desc">{room.desc}</p>

        <hr className="room-divider"
          style={{ background: `linear-gradient(90deg,transparent,${room.accent},transparent)` }}
        />

        <ul className="room-products" aria-label="أبرز التصاميم">
          {room.features.map((item, i) => (
            <li key={i} className="room-product-item">
              <span className="product-bullet" style={{ color: room.accent }}>
                <i className="fa-solid fa-gem"></i>
              </span>
              <span className="product-text">{item}</span>
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
          onClick={() => onShowDesigns(room)}
          style={{ backgroundColor: room.accent, color: '#0d0b10' }}
        >
          عرض المنتجات <i className="fa-solid fa-wand-magic-sparkles"></i>
        </button>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════
   Main Rooms Component
   ══════════════════════════════════════════ */
export default function Rooms() {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleShowDesigns = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <section id="rooms" className="rooms-section" ref={sectionRef} aria-label="أقسام المنتجات">
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
              <RoomCard room={room} onShowDesigns={handleShowDesigns} />
            </div>
          ))}
        </div>
      </div>

      {/* مؤشر السكرول الأفقي */}
      <div className="rooms-progress-hint" aria-hidden="true">
        <span>اسحبي للاستكشاف</span>
        <span className="scroll-arrow-h"><i className="fa-solid fa-arrow-left"></i></span>
      </div>

      {/* Modal */}
      <DesignsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        room={selectedRoom}
      />
    </section>
  );
}
