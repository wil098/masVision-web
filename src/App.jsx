import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
const ArosSol = lazy(() => import('./Pages/ArosSol'));
const ArosOftalmicos = lazy(() => import('./Pages/ArosOftalmicos'));
const ExamenesVista = lazy(() => import('./Pages/ExamenesVista'));
const MiCuenta = lazy(() => import('./Pages/MiCuenta'));
const AdminPanel = lazy(() => import('./Pages/AdminPanel'));
const ProductoDetalle = lazy(() => import('./Pages/ProductoDetalle'));
const Sucursales = lazy(() => import('./Pages/Sucursales'));
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import PaymentReturnNotice from './Components/PaymentReturnNotice';
import CartSidebar from './Components/CartSidebar';
import QuickAddModal from './Components/QuickAddModal';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <PaymentReturnNotice />
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aros-de-sol" element={<ArosSol />} />
          <Route path="/aros-oftalmicos" element={<ArosOftalmicos />} />
          <Route path="/examenes-de-la-vista" element={<ExamenesVista />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/producto/:codigo" element={<ProductoDetalle />} />

          <Route path="/sucursales" element={<Sucursales />} />
        </Routes>
        </Suspense>
        <Footer />
        <CartSidebar />
        <QuickAddModal />
      </CartProvider>
    </AuthProvider>
  );
}