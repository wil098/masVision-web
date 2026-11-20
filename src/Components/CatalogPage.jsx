import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import Card, { CardSkeleton } from './Card'
import PromoBlockCard from './PromoBlockCard'
import { fetchProducts, fetchPromoBlocks } from '../lib/orderService'
import { buildGridItems } from '../lib/promoGrid'

const SORTS = [
  { value: 'relevancia', label: 'Destacados' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre (A-Z)' },
]

// Normaliza para que "Guanebucán" se encuentre buscando "guanebucan".
const normalize = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// Cada bloque de colección abre un grupo nuevo, para que la colección
// empiece siempre en una fila propia de la grilla.
function groupByColeccion(items) {
  const groups = []
  for (const item of items) {
    const abreGrupo = item.type === 'promo' && item.data.coleccion
    if (abreGrupo || groups.length === 0) groups.push([])
    groups[groups.length - 1].push(item)
  }
  return groups
}

export default function CatalogPage({ categoria, promoPage, eyebrow, title, subtitle, image, imagePosition = 'center' }) {
  const [productos, setProductos] = useState([])
  const [promoBlocks, setPromoBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [material, setMaterial] = useState('todos')
  const [sort, setSort] = useState('relevancia')

  useEffect(() => {
    Promise.all([
      fetchProducts({ categoria }),
      fetchPromoBlocks(promoPage).catch((err) => {
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
  }, [categoria, promoPage])

  const materiales = useMemo(() => {
    const set = new Set(productos.map((p) => p.material).filter(Boolean))
    return [...set].sort()
  }, [productos])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    let list = productos.filter((p) => {
      if (material !== 'todos' && p.material !== material) return false
      if (!q) return true
      return [p.name, p.brand, p.codigo, p.material].some((v) => normalize(v).includes(q))
    })
    if (sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'nombre') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'))
    return list
  }, [productos, query, material, sort])

  const isFiltering = query.trim() !== '' || material !== 'todos' || sort !== 'relevancia'
  // Los bloques promocionales solo tienen sentido en el orden original.
  const items = buildGridItems(filtered, isFiltering ? [] : promoBlocks)

  const clearFilters = () => {
    setQuery('')
    setMaterial('todos')
    setSort('relevancia')
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Encabezado */}
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-14 sm:pt-36 sm:pb-20 px-4">
        {image && (
          <>
            <img
              src={`${import.meta.env.BASE_URL}img/${image}`}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              style={{ objectPosition: imagePosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto text-white animate-fade-up">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3">{eyebrow}</p>}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3">{title}</h1>
          {subtitle && <p className="text-base sm:text-lg text-slate-200 max-w-xl">{subtitle}</p>}
        </div>
      </section>

      {/* Filtros */}
      <div className="sticky top-[88px] z-30 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative lg:w-72 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar modelo o código"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
            />
          </div>

          {materiales.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-1">
              {['todos', ...materiales].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(m)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                    material === m
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {m === 'todos' ? 'Todos' : m}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 lg:ml-auto">
            <p className="text-sm text-gray-500 whitespace-nowrap">
              {loading ? 'Cargando…' : `${filtered.length} ${filtered.length === 1 ? 'modelo' : 'modelos'}`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Ordenar"
              className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grilla */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-gray-900 mb-2">No encontramos modelos con esos filtros</p>
            <p className="text-gray-500 mb-6">Prueba con otra búsqueda o quita los filtros.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-cyan-700 transition-colors"
            >
              <X size={16} /> Quitar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-6">
            {groupByColeccion(items).map((group) => (
              <div key={group[0].key} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {group.map((item) =>
                  item.type === 'promo' ? (
                    <PromoBlockCard key={item.key} block={item.data} />
                  ) : (
                    <Card key={item.key} product={item.data} />
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
