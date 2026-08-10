import { useEffect, useState } from 'react'
import Card from '../components/Card'
import PromoBlockCard from '../components/PromoBlockCard'
import { fetchProducts, fetchPromoBlocks } from '../lib/orderService'
import { buildGridItems } from '../lib/promoGrid'

export default function ArosSol() {
  const [productos, setProductos] = useState([])
  const [promoBlocks, setPromoBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchProducts({ categoria: 'sol' }),
      fetchPromoBlocks('aros-sol').catch((err) => {
        console.error('Error cargando bloques promocionales:', err)
        return []
      }),
    ])
      .then(([products, blocks]) => {
        setProductos(products)
        setPromoBlocks(blocks)
      })
      .catch((err) => console.error('Error cargando el catálogo:', err))
      .finally(() => setLoading(false))
  }, [])

  const items = buildGridItems(productos, promoBlocks)

  return (
    <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lentes de Sol</h1>
          <p className="text-gray-600 text-lg">Protege tus ojos con estilo</p>
        </div>
        {loading ? (
          <p className="text-center text-gray-400">Cargando catálogo...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {items.map((item) =>
              item.type === 'promo' ? (
                <PromoBlockCard key={item.key} block={item.data} />
              ) : (
                <Card key={item.key} product={item.data} />
              )
            )}
          </div>
        )}
      </div>
    </section>
  )
}
