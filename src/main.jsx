import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // 👈 Importante
import Navbar from './Components/Navbar.jsx'
import HeroSection from './Components/Herosection.jsx'
import Footer from './Components/Footer.jsx'
import BrandCarousel from './Components/BrandCarousel.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
    <Navbar/>
    <HeroSection/>
     <BrandCarousel/>
    <Footer/>
   
  </React.StrictMode>,
)
