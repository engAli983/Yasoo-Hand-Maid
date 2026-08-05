import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import './AdminDashboard.css';

const CATEGORIES = [
  { id: 'contract', label: 'ليالي العقد (Night of the Contract)' },
  { id: 'jewels', label: 'خزانة الجواهر (The Jewel Cabinet)' },
  { id: 'cases', label: 'جراب اللحظة (The Moment Case)' }
];

export default function AdminDashboard({ onReturnToSite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // بيانات نموذج الإضافة / التعديل
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('contract');
  const [price, setPrice] = useState('');
  const [delivery, setDelivery] = useState('٣-٥ أيام');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // حالات التحميل ورسائل التنبيه
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [filterCategory, setFilterCategory] = useState('all');

  const EXPECTED_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'yasso2026';

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('yasso_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchProducts();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === EXPECTED_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('yasso_admin_auth', 'true');
      setLoginError('');
      fetchProducts();
    } else {
      setLoginError('كلمة السر غير صحيحة! يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('yasso_admin_auth');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      showMessage('error', 'حدث خطأ أثناء جلب المنتجات من قاعدة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToStorage = async (file) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('Storage upload warning:', uploadError);
        // في حال لم يكن الـ bucket جاهزاً كـ public storage، نرجع خطأ واضح
        throw new Error('تعذر رفع الصورة للتخزين. تأكد من إنشاء Public Bucket باسم "products" في Supabase.');
      }

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price || (!imageUrl && !selectedFile)) {
      showMessage('error', 'يرجى إكمال البيانات الأساسية (الاسم، السعر، والصورة).');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        finalImageUrl = await uploadImageToStorage(selectedFile);
      }

      const productPayload = {
        title: title.trim(),
        category,
        price: parseFloat(price),
        delivery: delivery.trim() || '٣-٥ أيام',
        description: description.trim(),
        image_url: finalImageUrl
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingId);

        if (error) throw error;
        showMessage('success', 'تم تعديل المنتج بنجاح ✨');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productPayload]);

        if (error) throw error;
        showMessage('success', 'تمت إضافة المنتج الجديد بنجاح 🎉');
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Save product error:', err);
      showMessage('error', err.message || 'حدث خطأ أثناء حفظ المنتج.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setCategory(product.category);
    setPrice(product.price);
    setDelivery(product.delivery || '');
    setDescription(product.description || '');
    setImageUrl(product.image_url);
    setImagePreview(product.image_url);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, productTitle) => {
    if (!window.confirm(`هل أنت تأكد من رغبتك في حذف "${productTitle}"؟`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('success', 'تم حذف المنتج بنجاح.');
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      showMessage('error', 'حدث خطأ أثناء حذف المنتج.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('contract');
    setPrice('');
    setDelivery('٣-٥ أيام');
    setDescription('');
    setImageUrl('');
    setSelectedFile(null);
    setImagePreview('');
  };

  const filteredProducts = products.filter(p => 
    filterCategory === 'all' ? true : p.category === filterCategory
  );

  // شاشة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-logo">
            <span className="sparkle">✨</span>
            <h2>لوحة تحكم المنتجات</h2>
            <p>Yasso Hand Maid - الإدارة الخاصة</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>كلمة السر الخاصة بالمدير:</label>
              <input
                type="password"
                placeholder="أدخل كلمة السر..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                autoFocus
              />
            </div>

            {loginError && <div className="login-error-msg">{loginError}</div>}

            <button type="submit" className="admin-btn primary-btn">
              دخول لوحة التحكم 🔑
            </button>
          </form>

          <button onClick={onReturnToSite} className="admin-btn text-btn">
            ← الرجوع للموقع الرئيسي
          </button>
        </div>
      </div>
    );
  }

  // لوحة التحكم الرئيسية
  return (
    <div className="admin-dashboard-container">
      {/* الهيدر العلوي */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>لوحة إدارة المنتجات</h1>
          <span className="badge-live">Live Sync 🟢</span>
        </div>
        <div className="admin-header-actions">
          <button onClick={onReturnToSite} className="admin-btn secondary-btn">
            🌐 عرض الموقع
          </button>
          <button onClick={handleLogout} className="admin-btn danger-outline-btn">
            🚪 خروج
          </button>
        </div>
      </header>

      {/* رسالة التنبيه */}
      {statusMessage.text && (
        <div className={`status-toast ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="admin-main-grid">
        {/* قسم إضافة / تعديل منتج */}
        <section className="admin-card form-section">
          <h2>{editingId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>اسم المنتج / التنسيق *</label>
              <input
                type="text"
                placeholder="مثال: مرآة كتب كتاب دائرية مطرزة"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>القسم / التصنيف *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>السعر (بالجنيه) *</label>
                <input
                  type="number"
                  placeholder="مثال: 350"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>مدة التنفيذ والتوصيل</label>
                <input
                  type="text"
                  placeholder="مثال: ٣-٥ أيام"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>صورة المنتج *</label>
              <div className="image-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="product-img-file"
                />
                <label htmlFor="product-img-file" className="file-picker-label">
                  📷 اختر صورة من جهازك
                </label>
                <span className="or-divider">أو ضع رابط صورة مباشرة:</span>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                />
              </div>

              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="معاينة الصورة" />
                  <small>معاينة الصورة الحالية</small>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>وصف المنتج / التفاصيل</label>
              <textarea
                rows="3"
                placeholder="شغل يدوي فاخر مطرز باللؤلؤ ومصمم بلمسات خاصة..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="admin-btn primary-btn full-width"
                disabled={loading || uploading}
              >
                {loading || uploading
                  ? 'جاري الحفظ...'
                  : editingId ? 'تحديث المنتج 💾' : 'إضافة المنتج للموقع 🚀'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-btn text-btn"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </section>

        {/* قسم عرض وإدارة المنتجات الحالية */}
        <section className="admin-card list-section">
          <div className="list-section-header">
            <h2>📦 المنتجات المضافة ({filteredProducts.length})</h2>

            <div className="filter-controls">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">جميع الأقسام</option>
                <option value="contract">ليالي العقد</option>
                <option value="jewels">خزانة الجواهر</option>
                <option value="cases">جراب اللحظة</option>
              </select>
              <button onClick={fetchProducts} className="admin-btn icon-btn" title="تحديث القائمة">
                🔄
              </button>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="loading-spinner">جاري تحميل المنتجات من Supabase...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>لا يوجد منتجات مضافة في هذا القسم حتى الآن.</p>
              <small>استخدم النموذج لإضافة أول منتج وتحديد سعره ومكانه في الموقع!</small>
            </div>
          ) : (
            <div className="products-admin-grid">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="admin-product-card">
                  <div className="prod-img-wrap">
                    <img src={prod.image_url} alt={prod.title} />
                    <span className={`prod-cat-badge ${prod.category}`}>
                      {CATEGORIES.find(c => c.id === prod.category)?.label.split(' ')[0]}
                    </span>
                  </div>

                  <div className="prod-details">
                    <h3>{prod.title}</h3>
                    <div className="prod-price-delivery">
                      <span className="prod-price">{prod.price} ج.م</span>
                      {prod.delivery && <span className="prod-delivery">⏱️ {prod.delivery}</span>}
                    </div>
                    {prod.description && <p className="prod-desc">{prod.description}</p>}

                    <div className="card-actions">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="admin-btn edit-btn"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.title)}
                        className="admin-btn delete-btn"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
