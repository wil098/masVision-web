import Card from '../components/Card'
import productosSol from '../data/productosSol.json'

export default function ArosSol() {
  return (
    <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lentes de Sol</h1>
          <p className="text-gray-600 text-lg">Protege tus ojos con estilo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {productosSol.map((item, index) => (
            <Card key={index} product={item} />
          ))}
        </div>
      </div>
    </section>
  )
}