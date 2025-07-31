import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArosSol from './pages/ArosSol'
import ArosOftalmicos from './pages/ArosOftalmicos'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HeroSection from './Components/Herosection'
import Card from './Components/Card'
import products from './data/products.json'
import BrandCarousel from './Components/BrandCarousel'

export default function App() {
  return (
    <>
      <Navbar />
      <HeroSection />
        <BrandCarousel />
     <section className="flex flex-row flex-wrap gap-4 justify-center items-start bg-gray-100 py-10">
  {products.map((item, index) => (
    <Card key={index} product={item} />
  ))}
</section>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aros-de-sol" element={<ArosSol />} />
        <Route path="/aros-oftalmicos" element={<ArosOftalmicos />} />
      </Routes>
      <Footer />
    </>
  )
}
