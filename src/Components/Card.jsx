import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

// Productos antiguos guardan cada color como texto plano (ej. "C1"); los
// nuevos llevan { nombre, hex, images } para poder mostrar el color real.
function getColorHex(color) {
  return typeof color === 'string' ? null : color.hex
}

function getColorImages(color) {
  return typeof color === 'string' ? [] : color.images || []
}

const MAX_SWATCHES = 5

export function CardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="aspect-square rounded-3xl bg-gray-100 mb-4" />
      <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-4" />
      <div className="h-10 bg-gray-100 rounded-full" />
    </div>
  )
}

export default function Card({ product }) {
  const { requestAdd } = useCart()

  const { name, price, brand, images, codigo, colores_disponibles, categoria, nueva_coleccion } = product || {}
  const [activeImage, setActiveImage] = useState(images?.[0])
  const [activeSwatch, setActiveSwatch] = useState(null)

  useEffect(() => {
    setActiveImage(images?.[0])
    setActiveSwatch(null)
  }, [images])

  if (!product) return null

  const whatsappNumber = '50371497972'
  const whatsappMessage = `Hola! Me interesa el modelo *${name}* de ${brand}. Precio: $${price}`
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const swatches = (colores_disponibles || []).filter((color) => getColorHex(color))
  const extraColors = swatches.length - MAX_SWATCHES
  const brandLabel = (brand || '').replace(/\.$/, '')

  return (
    <div className="group w-full flex flex-col bg-white rounded-3xl border border-gray-100 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200">
      <Link
        to={`/producto/${codigo}`}
        className="block relative aspect-square rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden mb-4"
      >
        {activeImage && (
          <img
            src={activeImage}
            alt={name}
            loading="lazy"
            className="w-full h-full object-contain p-4 sm:p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {nueva_coleccion ? (
          <span className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Nuevo
          </span>
        ) : null}
        {categoria === 'oftalmico' && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            Solo aro
          </span>
        )}
      </Link>

      <div className="px-1 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700 mb-1">{brandLabel}</p>
        <Link
          to={`/producto/${codigo}`}
          className="block text-sm sm:text-base font-semibold text-gray-900 hover:text-cyan-700 transition-colors line-clamp-2 leading-snug"
        >
          {name}
        </Link>

        <div className="flex items-center justify-between gap-2 mt-2 min-h-[24px]">
          <p className="text-lg font-bold text-gray-900">${price}</p>
          {swatches.length > 0 && (
            <div className="flex items-center gap-1">
              {swatches.slice(0, MAX_SWATCHES).map((color, idx) => (
                <button
                  key={`${getColorHex(color)}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(getColorImages(color)[0] || images?.[0])
                    setActiveSwatch(idx)
                  }}
                  aria-label={typeof color === 'string' ? color : color.nombre}
                  title={typeof color === 'string' ? color : color.nombre}
                  className={`w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full border border-black/10 shrink-0 transition-all ${
                    activeSwatch === idx ? 'ring-2 ring-offset-2 ring-cyan-600' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: getColorHex(color) }}
                />
              ))}
              {extraColors > 0 && <span className="text-[11px] font-semibold text-gray-500 ml-0.5">+{extraColors}</span>}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-4">
          <button
            onClick={() => requestAdd(product)}
            aria-label={`Agregar ${name} al carrito`}
            className="flex-1 flex items-center justify-center gap-2 text-white px-3 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-colors bg-gray-900 hover:bg-cyan-700"
          >
            <ShoppingCart size={16} />
            <span className="hidden min-[400px]:inline">Agregar</span>
          </button>

          <a
            href={whatsappURL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            title="Consultar por WhatsApp"
            className="w-10 sm:w-12 shrink-0 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </div>
  )
}
