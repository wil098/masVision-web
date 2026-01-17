import { MessageCircle, Eye } from 'lucide-react'

export default function Card({ product }) {
  if (!product) return null

  const { name, description, price, brand, images } = product
  
  const whatsappNumber = '50371497972'
  const whatsappMessage = `Hola! Me interesa el modelo *${name}* de ${brand}. Precio: $${price}`
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 w-full max-w-[340px] group">
      {/* Imagen con efecto hover mejorado */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={images?.[0]}
          alt={name}
          className="w-full h-full object-contain p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
        />
        {images?.[1] && (
          <img
            src={images[1]}
            alt={`${name} - vista 2`}
            className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
          />
        )}
        
        {/* Badge de marca */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
          <span className="text-xs font-bold text-cyan-600">{brand}</span>
        </div>
        
        {/* Overlay con ícono */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-cyan-600 transition-colors">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Precio</p>
            <p className="text-3xl font-bold text-gray-900">
              ${price}
              <span className="text-sm font-normal text-gray-500">.00</span>
            </p>
          </div>
        </div>

        {/* Botón de WhatsApp mejorado */}
        <a
          href={whatsappURL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <MessageCircle size={20} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  )
}