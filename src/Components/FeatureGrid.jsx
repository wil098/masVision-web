import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const FEATURES = [
  {
    to: '/aros-oftalmicos',
    label: 'Aros Oftálmicos',
    text: 'Monturas para tus lentes graduados',
    image: 'Eclipse-Collection-05.JPG',
  },
  {
    to: '/aros-de-sol',
    label: 'Lentes de Sol',
    text: 'Protección UV con estilo',
    image: 'hero-modelo.png',
  },
  {
    to: '/examenes-de-la-vista',
    label: 'Exámenes de Vista',
    text: 'Agenda con nuestros optometristas',
    image: 'exam.jpg',
  },
  {
    to: '/sucursales',
    label: 'Nuestras Sucursales',
    text: 'Visítanos en 4 ubicaciones',
    image: 'sucursal 1.png',
  },
]

export default function FeatureGrid() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">Categorías</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Explora por categoría</h2>
          <p className="text-gray-500 max-w-xl">
            Encuentra justo lo que buscas en un par de clics
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {FEATURES.map((feature) => (
            <Link
              key={feature.label}
              to={feature.to}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-200"
            >
              <img
                src={`${import.meta.env.BASE_URL}img/${feature.image}`}
                alt={feature.label}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex items-end justify-between gap-3 text-white">
                <div className="min-w-0">
                  <p className="text-base sm:text-xl font-bold leading-tight">{feature.label}</p>
                  <p className="hidden sm:block text-sm text-white/75 mt-1">{feature.text}</p>
                </div>
                <span className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-white text-gray-900 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
