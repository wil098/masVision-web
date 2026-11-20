import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { MAX_QTY } from '../lib/cartUtils'
import { buildCartLine, formatMedida, getColorHex, getColorImages, getColorNombre, cleanBrand } from '../lib/productUtils'
import { useBodyScrollLock, useEscapeKey } from '../hooks/useOverlay'

export default function QuickAddModal() {
  const { quickAddProduct: product, closeQuickAdd, addLine } = useCart()
  const [colorIdx, setColorIdx] = useState(0)
  const [medidaIdx, setMedidaIdx] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setColorIdx(0)
    setMedidaIdx(0)
    setQty(1)
  }, [product])

  useBodyScrollLock(Boolean(product))
  useEscapeKey(Boolean(product), closeQuickAdd)

  if (!product) return null

  const colores = product.colores_disponibles || []
  const medidas = product.medidas_disponibles || []
  const color = colores[colorIdx]
  const image = getColorImages(color)[0] || product.images?.[0]

  const handleAdd = () => {
    addLine(buildCartLine(product, { color, medida: medidas[medidaIdx], quantity: qty }))
    closeQuickAdd()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Agregar ${product.name}`}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={closeQuickAdd} />

      <div className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-sheet-up sm:animate-pop-in max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeQuickAdd}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid sm:grid-cols-2">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] sm:aspect-auto sm:min-h-[420px] flex items-center justify-center p-8">
            {image && <img key={image} src={image} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply animate-fade-in" />}
          </div>

          <div className="p-6 sm:p-8 flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 mb-1">{cleanBrand(product.brand)}</p>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 pr-8">{product.name}</h2>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">${Number(product.price).toFixed(2)}</p>
            {product.categoria === 'oftalmico' && <p className="text-xs text-gray-500 mt-0.5">Precio solo del aro, no incluye lentes</p>}

            {colores.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-900 mb-2.5">
                  Color <span className="font-normal text-gray-500">· {getColorNombre(color)}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colores.map((c, i) => {
                    const hex = getColorHex(c)
                    const sel = i === colorIdx
                    return hex ? (
                      <button
                        key={`${getColorNombre(c)}-${i}`}
                        type="button"
                        onClick={() => setColorIdx(i)}
                        aria-label={getColorNombre(c)}
                        aria-pressed={sel}
                        title={getColorNombre(c)}
                        className={`w-9 h-9 rounded-full border border-black/10 transition-all ${
                          sel ? 'ring-2 ring-offset-2 ring-gray-900' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ) : (
                      <button
                        key={`${getColorNombre(c)}-${i}`}
                        type="button"
                        onClick={() => setColorIdx(i)}
                        aria-pressed={sel}
                        className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          sel ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {getColorNombre(c)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {medidas.length > 1 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-900 mb-2.5">Medida (calibre / puente / varilla)</p>
                <div className="flex flex-wrap gap-2">
                  {medidas.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMedidaIdx(i)}
                      aria-pressed={i === medidaIdx}
                      className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                        i === medidaIdx ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {formatMedida(m)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {medidas.length === 1 && <p className="text-xs text-gray-500 mt-4">Medida: {formatMedida(medidas[0])}</p>}

            <div className="mt-auto pt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Quitar uno"
                  className="w-11 h-12 flex items-center justify-center text-gray-600 disabled:text-gray-300"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                  disabled={qty >= MAX_QTY}
                  aria-label="Agregar uno"
                  className="w-11 h-12 flex items-center justify-center text-gray-600 disabled:text-gray-300"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 h-12 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white rounded-full font-semibold transition-colors"
              >
                <ShoppingCart size={17} />
                Agregar · ${(Number(product.price) * qty).toFixed(2)}
              </button>
            </div>

            <Link
              to={`/producto/${product.codigo}`}
              onClick={closeQuickAdd}
              className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              {product.categoria === 'oftalmico' ? 'Ver ficha completa y personalizar lentes' : 'Ver ficha completa'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
