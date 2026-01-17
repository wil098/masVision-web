import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArosSol from './pages/ArosSol'
import ArosOftalmicos from './pages/ArosOftalmicos'
import Ofertas from './pages/Ofertas'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aros-de-sol" element={<ArosSol />} />
        <Route path="/aros-oftalmicos" element={<ArosOftalmicos />} />
        <Route path="/ofertas" element={<Ofertas />} />
      </Routes>
      <Footer />
    </>
  )
}