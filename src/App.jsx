import { useState, useEffect } from 'react';
import './index.css';
import { useLenis } from './hooks/useLenis';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Rooms from './components/Rooms/Rooms';
import LiveFeed from './components/LiveFeed/LiveFeed';
import OrderForm from './components/OrderForm/OrderForm';
import Footer from './components/Footer/Footer';
import AdminDashboard from './components/Admin/AdminDashboard';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    // 1. الدخول عن طريق كتابة /admin أو #admin في الرابط
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setIsAdminView(true);
    }

    // 2. اختصار سري من الكيبورد لصاحب الموقع (Ctrl + Shift + A)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminView(prev => !prev);
        if (!isAdminView) {
          window.history.pushState({}, '', '/admin');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminView]);

  // تفعيل Lenis للسكرول الناعم فقط في الواجهة الرئيسية
  useLenis();

  const handleReturnToSite = () => {
    setIsAdminView(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  if (isAdminView) {
    return <AdminDashboard onReturnToSite={handleReturnToSite} />;
  }

  return (
    <main id="app-root">
      <Hero />
      <About />
      <Rooms />
      <LiveFeed />
      <OrderForm />
      <Footer />
    </main>
  );
}
