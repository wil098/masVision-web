import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArosSol from './pages/ArosSol'
import ArosOftalmicos from './pages/ArosOftalmicos'
import Ofertas from './pages/Ofertas'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// CORRECCIÓN 1: Asegúrate de que la palabra "pages" esté en minúscula 
// si tu carpeta general se llama así (tenías './Pages/Sucursales')
import Sucursales from './pages/Sucursales' 

export default function App() {
  return (
    <>
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
    </>
  )
}