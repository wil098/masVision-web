import { Link } from 'react-router-dom'

const FEATURES = [
  {
    to: '/aros-oftalmicos',
    label: 'Aros Oftálmicos',
    image: 'Eclipse-Collection-05.JPG',
  },
  {
    to: '/aros-de-sol',
    label: 'Lentes de Sol',
    image: 'hero-modelo.png',
  },
  {
    to: '/sucursales',
    label: 'Exámenes de Vista',
    image: 'exam.jpg',
  },
  {
    to: '/sucursales',
    label: 'Nuestras Sucursales',
    image: 'sucursal 1.png',
  },
]

export default function FeatureGrid() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Explora por categoría</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Encuentra justo lo que buscas en un par de clics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <Link
              key={feature.label}
              to={feature.to}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200"
            >
              <img
                src={`${import.meta.env.BASE_URL}img/${feature.image}`}
                alt={feature.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-md">
                {feature.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
