import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductCarousel({ title, eyebrow, products }) {
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
    <section className="pt-16 sm:pt-24 pb-8 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">{eyebrow}</p>}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">{title}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {products.map((product) => (
            <Link
              key={product.codigo}
              to={`/producto/${product.codigo}`}
              data-carousel-item
              className="group snap-start shrink-0 w-[220px] sm:w-[260px]"
            >
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-gray-200/70">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{(product.brand || '').replace(/\.$/, '')}</p>
                </div>
                <p className="text-base font-bold text-gray-900 whitespace-nowrap">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
