import products from '../data/products.json'
import Card from '../Components/Card'

export default function Home() {
  return (
    <section className="flex flex-wrap justify-center bg-gray-100 py-10">
      {products.map((item, index) => (
        <Card key={index} product={item} />
      ))}
    </section>
  )
}
