import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import './DesignsModal.css';

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // جلب المنتجات الحية من Supabase عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      fetchLiveProducts();
    }
  }, [isOpen]);

  const fetchLiveProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error loading products from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // فلترة المنتجات حسب القسم المفتوح حالياً
  const categoryProducts = room
    ? products.filter(p => p.category === room.id)
    : [];

  return (
    <AnimatePresence>
      {isOpen && room && (
        <div className="designs-modal-backdrop" onClick={onClose}>
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
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Header */}
            <header className="designs-modal-header">
              <h3 className="designs-modal-title">{room.title}</h3>
              <span className="designs-modal-subtitle">{room.titleEn} — معرض المنتجات</span>
            </header>

            {/* Grid Content */}
            <div className="designs-modal-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#a09aa8' }}>
                  جاري جلب المنتجات من قاعدة البيانات...
                </div>
              ) : categoryProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a09aa8' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </span>
                  <h4 style={{ color: '#d4af6a', fontSize: '1.2rem', marginBottom: '8px' }}>
                    لا يوجد منتجات مضافة في قسم ({room.title}) حتى الآن
                  </h4>
                  <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                    يمكن لصاحب الموقع الدخول للوحة التحكم وإضافة أول منتج وتحديد سعره وصورته ليظهر هنا فوراً!
                  </p>
                </div>
              ) : (
                <div className="designs-grid">
                  {categoryProducts.map((item) => (
                    <div
                      key={item.id}
                      className="design-item-card"
                      onClick={() => setSelectedImg(item)}
                    >
                      <div className="design-img-wrap">
                        <SmoothImage
                          className="design-img"
                          src={item.image_url}
                          alt={item.title}
                        />
                        <span 
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            background: 'rgba(212, 175, 106, 0.95)',
                            color: '#0d0b10',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            zIndex: 2
                          }}
                        >
                          {item.price} ج.م
                        </span>
                      </div>
                      <div className="design-card-info">
                        <h4 className="design-card-title">{item.title}</h4>
                        <p className="design-card-desc">{item.description}</p>
                        {item.delivery && (
                          <small style={{ color: '#d4af6a', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            <i className="fa-solid fa-clock"></i> مدة التنفيذ: {item.delivery}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                  <img
                    className="lightbox-img"
                    src={selectedImg.image_url}
                    alt={selectedImg.title}
                  />
                  <p className="lightbox-caption">{selectedImg.title}</p>
                  <div style={{ color: '#d4af6a', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '6px' }}>
                    السعر: {selectedImg.price} جنيه
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
