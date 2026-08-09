import { CheckCircle2 } from 'lucide-react'

export default function OrderConfirmation({ onClose, emailFailed }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
      <CheckCircle2 size={56} className="text-cyan-600" />
      <h3 className="text-xl font-bold text-gray-900">¡Pedido enviado!</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Hemos recibido tu solicitud. Te contactaremos pronto para confirmar los detalles.
      </p>
      {emailFailed && (
        <p className="text-amber-600 text-xs max-w-xs bg-amber-50 rounded-lg px-3 py-2">
          Tu pedido se envió por WhatsApp, pero no pudimos enviar la copia por correo. No te preocupes, de todas formas lo recibimos.
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
      >
        Cerrar
      </button>
    </div>
  )
}