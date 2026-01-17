import Card from '../components/Card'
import productosOftalmicos from '../data/productosOftalmicos.json'

export default function ArosOftalmicos() {
  return (
    <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Aros Oftálmicos</h1>
          <p className="text-gray-600 text-lg">Encuentra tu estilo perfecto</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {productosOftalmicos.map((item, index) => (
            <Card key={index} product={item} />
          ))}
        </div>
      </div>
    </section>
  )
}