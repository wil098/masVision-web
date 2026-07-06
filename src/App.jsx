import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import ArosSol from './Pages/ArosSol';
import ArosOftalmicos from './Pages/ArosOftalmicos';
import Ofertas from './Pages/Ofertas';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import { CartProvider } from './context/CartContext';

// CORRECCIÓN 1: Asegúrate de que la palabra "pages" esté en minúscula 
// si tu carpeta general se llama así (tenías './Pages/Sucursales')
import Sucursales from './pages/Sucursales' 

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aros-de-sol" element={<ArosSol />} />
        <Route path="/aros-oftalmicos" element={<ArosOftalmicos />} />
        <Route path="/ofertas" element={<Ofertas />} />
        
        {/* CORRECCIÓN 2: Agregamos la ruta para la pestaña de sucursales */}
        <Route path="/sucursales" element={<Sucursales />} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}