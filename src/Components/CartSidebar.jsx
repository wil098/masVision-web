import { useEffect, useState } from "react"
import { X, Trash2, Plus, Minus, ShoppingBag, ChevronLeft } from "lucide-react"
import { useCart } from "../context/CartContext"
import CheckoutForm from "./CheckoutForm"
import LoginGate from "./LoginGate"
import { useCheckoutForm } from "../hooks/useCheckoutForm"
import { useAuth } from "../context/AuthContext"
import { createPaymentLink } from "../lib/orderService"

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const [step, setStep] = useState('carrito') // 'carrito' | 'checkout'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const checkout = useCheckoutForm()
  const { user, getIdToken } = useAuth()

  // Carga las direcciones guardadas al entrar al checkout con sesión iniciada
  // (o justo cuando el usuario inicia sesión estando ya en este paso).
  useEffect(() => {
    if (step === 'checkout' && user) {
      checkout.loadAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, user])

  if (!isOpen) return null

  const handleClose = () => {
    setStep('carrito')
    checkout.reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkout.validate()) return

    const orderData = {
      items: cart.map((item) => ({ codigo: item.codigo, cantidad: item.quantity })),
      telefono: checkout.telefono,
      addressId: checkout.usingNewAddress ? null : checkout.selectedAddressId,
      address: checkout.usingNewAddress ? checkout.newAddress : null,
      guardarDireccion: checkout.guardarDireccion,
      recetaFile: checkout.recetaFile,
    }

    setIsSubmitting(true)
    try {
      const { urlEnlace } = await createPaymentLink(orderData, getIdToken)
      window.location.href = urlEnlace
    } catch (err) {
      console.error('Error generando el enlace de pago:', err)
      checkout.setErrors((prev) => ({ ...prev, submit: 'No pudimos iniciar el pago. Intenta de nuevo.' }))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Fondo semitransparente con desenfoque suave */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Contenedor del Panel Deslizable */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">

        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          {step === 'checkout' ? (
            <button
              onClick={() => setStep('carrito')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              <ChevronLeft size={18} /> Volver
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingBag size={22} className="text-cyan-600" />
              <h2 className="text-xl font-bold text-gray-800">Mi Carrito</h2>
            </div>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {step === 'carrito' && (
          <>
            {/* Cuerpo / Lista de Artículos */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <ShoppingBag size={48} className="text-gray-300 stroke-[1.5]" />
                  <p className="text-base font-medium">El carrito está vacío</p>
                  <button
                    onClick={handleClose}
                    className="text-sm font-semibold text-cyan-600 hover:underline"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50/50"
                  >
                    {/* Imagen del Aro */}
                    <div className="w-20 h-20 bg-white rounded-xl border border-gray-200/60 p-2 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={item.image || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Detalles e Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 block mb-0.5">
                        {item.brand}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 truncate">
                        {item.name}
                      </h4>
                      <p className="text-base font-black text-gray-900 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Selector de Cantidades */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold text-gray-800 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Botón para remover por completo */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-xl transition-colors shrink-0"
                      title="Eliminar artículo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Sección de Totales y Checkout */}
            {cart.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-gray-800">
                  <span className="font-semibold text-sm">Total acumulado:</span>
                  <span className="text-3xl font-black text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={clearCart}
                    className="col-span-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3.5 px-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Vaciar
                  </button>
                  <button
                    onClick={() => setStep('checkout')}
                    className="col-span-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm shadow-lg shadow-cyan-100 flex items-center justify-center gap-2"
                  >
                    Procesar Pedido
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === 'checkout' && !user && <LoginGate />}

        {step === 'checkout' && user && (
          <>
            <CheckoutForm user={user} checkout={checkout} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            {checkout.errors.submit && <p className="text-red-500 text-xs text-center pb-4">{checkout.errors.submit}</p>}
          </>
        )}
      </div>
    </div>
  )
}