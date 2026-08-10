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

export default function Card({ product }) {
  const { addToCart } = useCart()

  const { name, price, brand, images, codigo, colores_disponibles } = product || {}
  const [activeImage, setActiveImage] = useState(images?.[0])

  useEffect(() => setActiveImage(images?.[0]), [images])

  if (!product) return null

  // El código de producto es la llave real en D1; el Worker la usa para
  // recalcular el precio del pedido, así que el carrito debe llevarla.
  const id = codigo

  const whatsappNumber = '50371497972'
  const whatsappMessage = `Hola! Me interesa el modelo *${name}* de ${brand}. Precio: $${price}`
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const swatches = (colores_disponibles || []).filter((color) => getColorHex(color))

  return (
    <div className="w-full max-w-[340px] group">
      <Link
        to={`/producto/${codigo}`}
        className="block relative aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-4"
      >
        <img
          src={activeImage}
          alt={name}
          className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/producto/${codigo}`}
            className="block text-base font-semibold text-gray-900 hover:text-cyan-600 transition-colors truncate"
          >
            {name}
          </Link>
          <p className="text-xs text-gray-500">{brand}</p>
        </div>
        <p className="text-base font-semibold text-gray-900 whitespace-nowrap">${price}</p>
      </div>

      {swatches.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          {swatches.map((color, idx) => (
            <button
              key={`${getColorHex(color)}-${idx}`}
              type="button"
              onClick={() => setActiveImage(getColorImages(color)[0] || images?.[0])}
              aria-label={typeof color === 'string' ? color : color.nombre}
              className="w-5 h-5 rounded-full border border-black/10 shrink-0 hover:scale-110 transition-transform"
              style={{ backgroundColor: getColorHex(color) }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={() => addToCart({ id, codigo, name, price, brand, image: images?.[0] })}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
        >
          <ShoppingCart size={16} />
          Agregar al carrito
        </button>

        <a
          href={whatsappURL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm transition-colors"
        >
          <MessageCircle size={16} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  )
}
