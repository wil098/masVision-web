import { usePageMeta } from '../lib/seo'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import HeroSection from '../Components/HeroSection'
import TrustBar from '../Components/TrustBar'
import ProductCarousel from '../Components/ProductCarousel'
import FeatureGrid from '../Components/FeatureGrid'
import Card, { CardSkeleton } from '../Components/Card'
import { fetchProducts } from '../lib/orderService'

export default function Home() {
  usePageMeta({ path: '/' })
  const [nuevaColeccion, setNuevaColeccion] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts({ nuevaColeccion: true })
      .then(setNuevaColeccion)
      .catch((err) => console.error('Error cargando la nueva colección:', err))
  }, [])

  useEffect(() => {
    fetchProducts({ destacado: true })
      .then(setProductos)
      .catch((err) => console.error('Error cargando el catálogo:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustBar />
      <ProductCarousel title="Nueva colección" eyebrow="Recién llegados" products={nuevaColeccion} />
      <FeatureGrid />

      {/* Productos destacados */}
      <section id="productos" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">Favoritos</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Productos destacados</h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Una selección de lentes de las mejores marcas internacionales.
              </p>
            </div>
            <Link
              to="/aros-oftalmicos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-cyan-700 transition-colors group"
            >
              Ver todo el catálogo
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : productos.map((item) => <Card key={item.codigo} product={item} />)}
          </div>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="px-4 pb-16 sm:pb-24">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl bg-slate-950">
          <img
            src={`${import.meta.env.BASE_URL}img/exam.jpg`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 max-w-xl text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">¿Cuándo fue tu último examen de la vista?</h2>
            <p className="text-slate-300 mb-8">
              Agenda tu cita en cualquiera de nuestras sucursales y deja que nuestros optometristas cuiden de tu visión.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/50371497972?text=Hola, quiero agendar un examen de la vista en Óptica Más Visión"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-7 py-3.5 rounded-full font-bold transition-colors"
              >
                Agendar por WhatsApp
              </a>
              <Link
                to="/examenes-de-la-vista"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
              >
                Saber más
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
