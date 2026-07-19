import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DesignsModal.css';

/* ══════════════════════════════════════════
   استيراد الصور ديناميكياً من المجلدات بـ Vite
   ══════════════════════════════════════════ */
const contractGlob = import.meta.glob('../../assets/contract/*.webp', { eager: true });
const sortedContractKeys = Object.keys(contractGlob).sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
  return numA - numB;
});
const contractImages = sortedContractKeys.map(key => contractGlob[key].default || contractGlob[key]);

const jewelGlob = import.meta.glob('../../assets/jewels/*.webp', { eager: true });
const sortedJewelKeys = Object.keys(jewelGlob).sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
  return numA - numB;
});
const jewelImages = sortedJewelKeys.map(key => jewelGlob[key].default || jewelGlob[key]);

const caseGlob = import.meta.glob('../../assets/cases/*.webp', { eager: true });
const sortedCaseKeys = Object.keys(caseGlob).sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
  return numA - numB;
});
const caseImages = sortedCaseKeys.map(key => caseGlob[key].default || caseGlob[key]);

/* ══════════════════════════════════════════
   بناء هيكل البيانات ديناميكياً
   ══════════════════════════════════════════ */
const contractTitles = [
  "مرآة كتب كتاب محمود ونورهان",
  "مرآة الأسماء الدائرية بالورد واللؤلؤ",
  "منديل كتب كتاب محمود ومريم المطرز",
  "بوكيه زفاف ملكي بالورد والريش",
  "بوكيه العروسة الكلاسيكي باللؤلؤ",
  "مرآة العروسة المزينة بالذهب واللؤلؤ",
  "مرآة كتب كتاب دائرية كلاسيكية",
  "بوكيه وصيفة العروس بالورد واللؤلؤ",
  "بوكيه اللؤلؤ الأبيض الفاخر",
  "لقطة مقربة لتطريز مرآة كتب الكتاب",
  "مرآة محمود ونورهان - زاوية كاملة",
  "مرآة العروسين باللؤلؤ والورد الأبيض"
];

const contractDesigns = contractImages.map((img, i) => ({
  id: `contract-${i}`,
  title: contractTitles[i] || `تصميم كتب كتاب مميز #${i + 1}`,
  desc: "شغل يدوي فاخر مصمم بلمسات خاصة ومطرز باللؤلؤ",
  img: img
}));

const jewelTitles = [
  "عقد زفاف فاخر من اللؤلؤ",
  "خاتم سلك الفضة المطرز باللؤلؤ",
  "مشط شعر العروس الملكي بالورد واللؤلؤ",
  "مروحة كتب الكتاب باللؤلؤ والريش الأبيض",
  "مروحة الأسماء والخرز الكلاسيكية للكتب كتاب"
];

const jewelDesigns = jewelImages.map((img, i) => ({
  id: `jewel-${i}`,
  title: jewelTitles[i] || `إكسسوار زفاف راقي #${i + 1}`,
  desc: "تفاصيل صغيرة لامعة تكتمل بها إطلالتك وتجعلها فريدة",
  img: img
}));

const caseTitles = [
  "جراب اللؤلؤ والذهب الفاخر"
];

const caseDesigns = caseImages.map((img, i) => ({
  id: `case-${i}`,
  title: caseTitles[i] || `جراب موبايل باللؤلؤ #${i + 1}`,
  desc: "تصميم مرصع بالكامل بحبات اللؤلؤ الطبيعي والكريستال",
  img: img
}));

const DESIGNS_DATA = {
  contract: [
    ...contractDesigns,
    { id: 'c-ph-1', isPlaceholder: true, placeholderText: 'تصاميم مرايا ومناديل جديدة قريباً' }
  ],
  jewels: [
    ...jewelDesigns,
    { id: 'j-ph-1', isPlaceholder: true, placeholderText: 'سلاسل وإكسسوارات زفاف جديدة قريباً' }
  ],
  cases: [
    ...caseDesigns,
    { id: 'ca-ph-1', isPlaceholder: true, placeholderText: 'جراب كريستال ناعم قريباً' },
    { id: 'ca-ph-2', isPlaceholder: true, placeholderText: 'جراب الورد المجفف بالريزن' }
  ]
};

/* ══════════════════════════════════════════
   مكون تحميل الصور الانسيابي (Smooth Image Loader)
   ══════════════════════════════════════════ */
function SmoothImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`smooth-image-wrap ${loaded ? 'is-loaded' : ''}`}>
      <img
        src={src}
        alt={alt}
        className={`${className} smooth-img`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
      <div className="smooth-image-placeholder" />
    </div>
  );
}

export default function DesignsModal({ isOpen, onClose, room }) {
  const [selectedImg, setSelectedImg] = useState(null);

  // إغلاق المودال عند الضغط على Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedImg) {
          setSelectedImg(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      window.lenis?.stop();
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      window.lenis?.start();
    };
  }, [isOpen, onClose, selectedImg]);

  const designs = room ? (DESIGNS_DATA[room.id] || []) : [];

  return (
    <AnimatePresence>
      {isOpen && room && (
        <div className="designs-modal-backdrop" onClick={onClose}>
          {/* 3D Glass Door Open/Close Animation via Framer Motion */}
          <motion.div
            className="designs-modal-window"
            style={{ '--room-accent': room.accent }}
            onClick={(e) => e.stopPropagation()} 
            data-lenis-prevent
            initial={{
              opacity: 0,
              rotateY: 85,
              scale: 0.8,
              perspective: 1200,
              transformOrigin: 'right center'
            }}
            animate={{
              opacity: 1,
              rotateY: 0,
              scale: 1,
              transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
            }}
            exit={{
              opacity: 0,
              rotateY: -85,
              scale: 0.8,
              transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
            }}
          >
            {/* زر الإغلاق */}
            <button
              className="designs-modal-close"
              onClick={onClose}
              aria-label="إغلاق المعرض"
            >
              ✕
            </button>

            {/* Header */}
            <header className="designs-modal-header">
              <h3 className="designs-modal-title">{room.title}</h3>
              <span className="designs-modal-subtitle">{room.titleEn} — معرض التصاميم</span>
            </header>

            {/* Grid Content */}
            <div className="designs-modal-content">
              <div className="designs-grid">
                {designs.map((item) => (
                  <div
                    key={item.id}
                    className="design-item-card"
                    onClick={() => !item.isPlaceholder && setSelectedImg(item)}
                  >
                    <div className="design-img-wrap">
                      {item.isPlaceholder ? (
                        <div className="design-img-placeholder">
                          <span className="placeholder-icon">✦</span>
                          <span className="placeholder-text">{item.placeholderText}</span>
                        </div>
                      ) : (
                        <SmoothImage
                          className="design-img"
                          src={item.img}
                          alt={item.title}
                        />
                      )}
                    </div>
                    {!item.isPlaceholder && (
                      <div className="design-card-info">
                        <h4 className="design-card-title">{item.title}</h4>
                        <p className="design-card-desc">{item.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {selectedImg && (
              <motion.div
                className="lightbox-backdrop"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImg(null);
                }}
                data-lenis-prevent
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="lightbox-content"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    className="lightbox-close"
                    onClick={() => setSelectedImg(null)}
                    aria-label="إغلاق الصورة الكبيرة"
                  >
                    ✕
                  </button>
                  <img
                    className="lightbox-img"
                    src={selectedImg.img}
                    alt={selectedImg.title}
                  />
                  <p className="lightbox-caption">{selectedImg.title}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
