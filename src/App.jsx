import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import ArosSol from './Pages/ArosSol';
import ArosOftalmicos from './Pages/ArosOftalmicos';
import Ofertas from './Pages/Ofertas';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aros-de-sol" element={<ArosSol />} />
        <Route path="/aros-oftalmicos" element={<ArosOftalmicos />} />
        <Route path="/ofertas" element={<Ofertas />} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}