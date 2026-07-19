import './index.css';
import { useLenis } from './hooks/useLenis';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Rooms from './components/Rooms/Rooms';
import LiveFeed from './components/LiveFeed/LiveFeed';
import OrderForm from './components/OrderForm/OrderForm';
import Footer from './components/Footer/Footer';

export default function App() {
  // تفعيل Lenis للسكرول الناعم
  useLenis();

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
