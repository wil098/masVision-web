import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductCarousel({ title, products }) {
  const trackRef = useRef(null)

  const scrollByCard = (direction) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('[data-carousel-item]')
    const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <Link
              key={product.codigo}
              to={`/producto/${product.codigo}`}
              data-carousel-item
              className="group snap-start shrink-0 w-[220px] sm:w-[260px]"
            >
              <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>
                <p className="text-base font-semibold text-gray-900 whitespace-nowrap">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
