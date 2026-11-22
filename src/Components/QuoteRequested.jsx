import { FileCheck2, MessageCircle } from 'lucide-react'

// Pantalla después de pedir cotización de lentes: todavía no se ha pagado nada.
export default function QuoteRequested({ onClose, closeLabel = 'Seguir viendo la tienda' }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-14 gap-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
        <FileCheck2 size={32} />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900">¡Recibimos tu receta!</h3>
      <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
        Vamos a revisar tu graduación y te enviaremos la cotización de tus lentes por <strong>correo y WhatsApp</strong>.
        Pagas todo junto (aro + lentes + envío) en un solo pago.
      </p>
      <p className="text-xs text-gray-400 max-w-xs">Todavía no has pagado nada. También verás la cotización en Mi cuenta.</p>
      <div className="flex flex-col gap-2 w-full max-w-[260px] mt-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-900 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
        >
          {closeLabel}
        </button>
        <a
          href="https://wa.me/50371497972?text=Hola, acabo de enviar mi receta para cotizar mis lentes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-800 px-6 py-3 rounded-full font-semibold transition-colors"
        >
          <MessageCircle size={16} /> Escribirnos por WhatsApp
        </a>
      </div>
    </div>
  )
}
