import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle, Clock } from 'lucide-react'
import { buildPaymentWhatsAppURL } from '../lib/orderService'
import { useCart } from '../context/CartContext'

export default function PaymentReturnNotice() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { clearCart } = useCart()
  const orderId = searchParams.get('pedido')

  // Se vacía el carrito al volver de Wompi (ya sea que el pago haya salido
  // bien o no) — no antes, para no perder los artículos si el cliente
  // abandona el pago a medio camino.
  useEffect(() => {
    if (orderId) clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (!orderId) return null

  const monto = searchParams.get('monto')

  const handleClose = () => {
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center gap-4">
        <Clock size={48} className="text-cyan-600" />
        <h3 className="text-xl font-bold text-gray-900">Estamos confirmando tu pago</h3>
        <p className="text-gray-500 text-sm">
          En cuanto Wompi confirme la transacción te avisaremos por correo electrónico. También puedes escribirnos
          por WhatsApp para darle seguimiento a tu pedido.
        </p>

        <a
          href={buildPaymentWhatsAppURL({ orderId, monto })}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all"
        >
          <MessageCircle size={20} />
          Escribir por WhatsApp
        </a>

        <button
          type="button"
          onClick={handleClose}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
