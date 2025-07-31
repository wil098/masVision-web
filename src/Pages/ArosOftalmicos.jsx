import productosOftalmicos from '../data/productosOftalmicos.json'
import Card from '../Components/Card'

export default function ArosOftalmicos() {
  return (
    <section className="flex flex-wrap justify-center bg-gray-100 py-10">
      {productosOftalmicos.map((item, index) => (
        <Card key={index} product={item} />
      ))}
    </section>
  )
}
