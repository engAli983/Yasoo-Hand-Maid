import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './OrderForm.css';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   📌 رقم الواتساب الحقيقي للبراند
   ══════════════════════════════════════════ */
const WHATSAPP_NUMBER = '201066307580';

const PRODUCTS = [
  { value: 'ليالي العقد (مرايا / بوكيهات / مناديل)', label: 'ليالي العقد (مرايا / بوكيهات / مناديل)' },
  { value: 'خزانة الجواهر (سلاسل / خواتم / إكسسوارات)', label: 'خزانة الجواهر (سلاسل / خواتم / إكسسوارات)' },
  { value: 'جراب اللحظة (جراب موبايل باللؤلؤ)', label: 'جراب اللحظة (جراب موبايل باللؤلؤ)' },
  { value: 'استفسار عام / متابعة طلب قائم', label: 'استفسار عام / متابعة طلب قائم' }
];

function buildWhatsAppMessage(data) {
  const isGeneralInquiry = data.product === 'استفسار عام / متابعة طلب قائم';
  
  const lines = isGeneralInquiry ? [
    '🌸 أهلاً يا ياسو! عندي استفسار أو حابة أتابع الأوردر بتاعي 🌸',
    '',
    `👤 الاسم الكامل: ${data.coupleNames}`,
    `🎁 موضوع الاستفسار: ${data.product}`,
    `📝 التفاصيل: ${data.notes || 'لا يوجد'}`,
    '',
    '✨ في انتظار ردك الجميلة!',
  ] : [
    '🌸 أهلاً يا ياسو! عاوزة أطلب تصميم مميز 🌸',
    '',
    `👰 اسم العروسين: ${data.coupleNames}`,
    `📅 تاريخ الفرح: ${data.weddingDate || 'لسه مش محدد'}`,
    `🎁 القسم المطلوب: ${data.product}`,
    `🎨 الألوان المفضلة: ${data.colors || 'مفتوح'}`,
    `📝 ملاحظات خاصة: ${data.notes || 'لا يوجد'}`,
    '',
    '✨ في انتظار ردك لتحديد التفاصيل وباقي الخطوات!',
  ];
  return encodeURIComponent(lines.join('\n'));
}

export default function OrderForm() {
  const sectionRef = useRef(null);
  const [sent,     setSent    ] = useState(false);
  const [form,     setForm    ] = useState({
    coupleNames: '',
    weddingDate: '',
    product:     'ليالي العقد (مرايا / بوكيهات / مناديل)',
    colors:      '',
    notes:       '',
  });
  const [errors, setErrors] = useState({});

  /* ── GSAP ScrollTrigger entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* هيدر الفورم */
      gsap.fromTo('.order-header',
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

      /* الكارت نفسه */
      gsap.fromTo('.order-card',
        { opacity: 0, y: 55, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.order-card',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert(); // ✅ cleanup
  }, []);

  /* ── التحديث ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── Validation ── */
  const validate = () => {
    const newErrors = {};
    if (!form.coupleNames.trim()) {
      newErrors.coupleNames = form.product === 'استفسار عام / متابعة طلب قائم' 
        ? 'الاسم مطلوب للتواصل' 
        : 'يرجى إدخال اسم العروسين لتخصيص التصميم';
    }
    return newErrors;
  };

  /* ── فتح واتساب ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const msg = buildWhatsAppMessage(form);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const isGeneralInquiry = form.product === 'استفسار عام / متابعة طلب قائم';

  return (
    <section id="order" className="order-section" ref={sectionRef}>

      {/* Header */}
      <div className="order-header">
        <span className="order-eyebrow">تواصل مباشر وتصميم خاص</span>
        <h2 className="order-title">اطلبي تصميمك أو استفسري</h2>
        <div className="gold-divider" />
        <p className="order-subtitle">
          اكتبي بياناتك وطلبك وهيتولد شات واتساب تلقائيًا بكل التفاصيل لتواصل أسرع
        </p>
      </div>

      {/* Form Card */}
      <div className="order-card">
        {sent ? (
          /* رسالة نجاح */
          <div className="order-success">
            <span className="success-icon">✅</span>
            <h3 className="success-title">تم توجيهك للواتساب!</h3>
            <p className="success-text">
              فُتح شات واتساب برسالتك الجاهزة، يمكنك إرسالها الآن وسنقوم بالرد عليكي فوراً لتنسيق التصاميم والاستفسارات 🌸
            </p>
          </div>
        ) : (
          <form
            className="order-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="فورم طلب تصميم"
          >
            {/* اسم العميل / العروسين */}
            <div className="form-group">
              <label className="form-label" htmlFor="coupleNames">
                <span className="label-required">*</span>
                {isGeneralInquiry ? 'الاسم الكامل للتواصل' : 'اسم العروسين'}
              </label>
              <input
                id="coupleNames"
                name="coupleNames"
                type="text"
                className="form-input"
                placeholder={isGeneralInquiry ? 'مثال: سارة محمد' : 'مثال: أحمد ومروة'}
                value={form.coupleNames}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!errors.coupleNames}
              />
              {errors.coupleNames && (
                <span className="form-error-msg">
                  {errors.coupleNames}
                </span>
              )}
            </div>

            {/* تاريخ الفرح + المنتج */}
            <div className="form-row">
              {!isGeneralInquiry && (
                <div className="form-group">
                  <label className="form-label" htmlFor="weddingDate">
                    تاريخ الفرح
                  </label>
                  <input
                    id="weddingDate"
                    name="weddingDate"
                    type="date"
                    className="form-input"
                    value={form.weddingDate}
                    onChange={handleChange}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              )}

              <div className="form-group" style={{ flex: isGeneralInquiry ? '1 1 100%' : '1 1 50%' }}>
                <label className="form-label" htmlFor="product">
                  <span className="label-required">*</span>
                  القسم أو طبيعة الطلب
                </label>
                <select
                  id="product"
                  name="product"
                  className="form-select"
                  value={form.product}
                  onChange={handleChange}
                  aria-required="true"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* الألوان المفضلة */}
            {!isGeneralInquiry && (
              <div className="form-group">
                <label className="form-label" htmlFor="colors">
                  الألوان المفضلة
                </label>
                <input
                  id="colors"
                  name="colors"
                  type="text"
                  className="form-input"
                  placeholder="مثال: أبيض وذهبي، أو وردي وفضي..."
                  value={form.colors}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* ملاحظات */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                {isGeneralInquiry ? 'تفاصيل الاستفسار أو الأوردر للمتابعة' : 'تفاصيل إضافية للطلب'}
              </label>
              <textarea
                id="notes"
                name="notes"
                className="form-textarea"
                placeholder={isGeneralInquiry ? 'اكتبي سؤالك هنا، أو رقم الأوردر وتفاصيل ما تريدين الاستفسار عنه...' : 'أي تفاصيل أو تعديلات خاصة تريدين إضافتها...'}
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* زرار الإرسال */}
            <button
              type="submit"
              className="order-submit"
              id="order-submit-btn"
              aria-label="إرسال الطلب والاستفسار عبر واتساب"
            >
              <span className="whatsapp-icon">💬</span>
              تواصل معنا على واتساب
            </button>

            <p className="order-privacy">
              بياناتك مشفرة وتواصل مباشر — بمجرد الضغط سيتم توجيهك لشات واتساب دون حفظ بياناتك في أي خادم
            </p>
          </form>
        )}
      </div>

    </section>
  );
}
