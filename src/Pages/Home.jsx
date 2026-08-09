import { useEffect, useState } from 'react'
import HeroSection from '../components/HeroSection'
import BrandCarousel from '../components/BrandCarousel'
import CategoryLinks from '../components/CategoryLinks'
import Card from '../components/Card'
import { fetchProducts } from '../lib/orderService'

export default function Home() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts({ destacado: true })
      .then(setProductos)
      .catch((err) => console.error('Error cargando el catálogo:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <HeroSection />
      <BrandCarousel />
      <CategoryLinks />

      {/* Sección de productos */}
      <section id="productos" className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nuestros Productos Destacados
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubre nuestra selección de lentes de las mejores marcas internacionales
            </p>
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Cargando catálogo...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {productos.map((item) => (
                <Card key={item.codigo} product={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}