import productosSol from '../data/productosSol.json'
import Card from '../Components/Card'

export default function ArosSol() {
  return (
    <section className="flex flex-wrap justify-center bg-gray-100 py-10">
      {productosSol.map((item, index) => (
        <Card key={index} product={item} />
      ))}
    </section>
  )
}
