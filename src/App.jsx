import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import ArosSol from './Pages/ArosSol';
import ArosOftalmicos from './Pages/ArosOftalmicos';
import Ofertas from './Pages/Ofertas';
import MiCuenta from './Pages/MiCuenta';
import AdminPanel from './Pages/AdminPanel';
import ProductoDetalle from './Pages/ProductoDetalle';
import Sucursales from './Pages/Sucursales';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import PaymentReturnNotice from './Components/PaymentReturnNotice';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <PaymentReturnNotice />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aros-de-sol" element={<ArosSol />} />
          <Route path="/aros-oftalmicos" element={<ArosOftalmicos />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/producto/:codigo" element={<ProductoDetalle />} />

          <Route path="/sucursales" element={<Sucursales />} />
        </Routes>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}