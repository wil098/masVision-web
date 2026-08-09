import { Glasses, Sun, Percent, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  {
    to: '/aros-oftalmicos',
    icon: Glasses,
    title: 'Aros Oftálmicos',
    description: 'Monturas para todas las edades, con la medida exacta para tu receta.',
  },
  {
    to: '/aros-de-sol',
    icon: Sun,
    title: 'Lentes de Sol',
    description: 'Protección UV y estilo, de las marcas que ya conoces y confías.',
  },
  {
    to: '/ofertas',
    icon: Percent,
    title: 'Ofertas',
    description: 'Promociones activas para que cuides tu visión sin pagar de más.',
  },
]

export default function CategoryLinks() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Explora por categoría</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Encuentra justo lo que buscas en un par de clics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.to}
              to={category.to}
              className="group bg-gray-50 hover:bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-transparent hover:border-cyan-100 transition-all duration-300"
            >
              <div className="bg-cyan-50 group-hover:bg-cyan-600 w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors duration-300">
                <category.icon className="text-cyan-600 group-hover:text-white transition-colors duration-300" size={26} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{category.description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600">
                Ver más
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}