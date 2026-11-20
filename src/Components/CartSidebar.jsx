import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ShoppingBag, ChevronLeft, ShieldCheck, Truck, Lock, ArrowRight, Undo2, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { lineUnitPrice, MAX_QTY } from '../lib/cartUtils'
import CheckoutForm from './CheckoutForm'
import LoginGate from './LoginGate'
import { useCheckoutForm } from '../hooks/useCheckoutForm'
import { useAuth } from '../context/AuthContext'
import { createPaymentLink } from '../lib/orderService'
import { useBodyScrollLock, useEscapeKey } from '../hooks/useOverlay'

const money = (n) => `$${n.toFixed(2)}`

const STEPS = [
  { id: 'carrito', label: 'Carrito' },
  { id: 'checkout', label: 'Envío' },
  { id: 'pago', label: 'Pago' },
]

function Stepper({ step }) {
  const current = STEPS.findIndex((s) => s.id === step)
  return (
    <ol className="flex items-center gap-2 px-6 pb-4">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
          <span
            className={`w-6 h-6 shrink-0 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${
              i < current ? 'bg-cyan-600 text-white' : i === current ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i < current ? <Check size={12} /> : i + 1}
          </span>
          <span className={`text-xs font-semibold ${i <= current ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
          {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < current ? 'bg-cyan-600' : 'bg-gray-200'}`} />}
        </li>
      ))}
    </ol>
  )
}

function CartLine({ line, highlighted }) {
  const { setQuantity, removeLine, closeCart } = useCart()
  const unit = lineUnitPrice(line)
  const ref = useRef(null)

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [highlighted])

  return (
    <li
      ref={ref}
      className={`flex gap-4 py-5 transition-colors duration-700 ${highlighted ? 'bg-cyan-50/60 -mx-6 px-6' : ''}`}
    >
      <Link
        to={`/producto/${line.codigo}`}
        onClick={closeCart}
        className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 overflow-hidden"
      >
        {line.image ? (
          <img src={line.image} alt={line.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
        ) : (
          <ShoppingBag size={28} className="text-gray-300" />
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {line.brand && <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">{line.brand}</p>}
            <Link
              to={`/producto/${line.codigo}`}
              onClick={closeCart}
              className="block text-sm font-semibold text-gray-900 hover:text-cyan-700 leading-snug line-clamp-2"
            >
              {line.name}
            </Link>
          </div>
          <p className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">{money(unit * line.quantity)}</p>
        </div>

        <div className="mt-1.5 space-y-0.5 text-xs text-gray-500">
          {line.color && (
            <p className="flex items-center gap-1.5">
              {line.color.hex && (
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: line.color.hex }} />
              )}
              {line.color.nombre}
            </p>
          )}
          {line.medida && <p>Medida {line.medida}</p>}
          {line.lensOptions?.length > 0 && (
            <p>
              Lente: {line.lensOptions.map((o) => o.nombre).join(', ')}{' '}
              <span className="text-gray-400">(+{money(unit - line.price)})</span>
            </p>
          )}
          {line.categoria === 'oftalmico' && !line.lensOptions?.length && <p className="text-gray-400">Solo aro</p>}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-gray-200 h-9">
            <button
              type="button"
              onClick={() => (line.quantity <= 1 ? removeLine(line.lineId) : setQuantity(line.lineId, line.quantity - 1))}
              aria-label={line.quantity <= 1 ? `Eliminar ${line.name}` : 'Quitar uno'}
              className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"
            >
              {line.quantity <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
            </button>
            <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.lineId, line.quantity + 1)}
              disabled={line.quantity >= MAX_QTY}
              aria-label="Agregar uno"
              className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:text-gray-300"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeLine(line.lineId)}
            className="text-xs font-semibold text-gray-400 hover:text-red-600 underline-offset-2 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  )
}

export default function CartSidebar() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartLensTotal,
    cartTotal,
    clearCart,
    isCartOpen,
    closeCart,
    lastAddedId,
    lastAddedAt,
    lastRemoved,
    undoRemove,
  } = useCart()
  const [step, setStep] = useState('carrito') // 'carrito' | 'checkout'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [highlightId, setHighlightId] = useState(null)
  const checkout = useCheckoutForm()
  const { user, getIdToken } = useAuth()

  useBodyScrollLock(isCartOpen)

  const handleClose = () => {
    setStep('carrito')
    setConfirmClear(false)
    checkout.reset()
    closeCart()
  }
  useEscapeKey(isCartOpen, handleClose)

  // Resalta por un momento la línea recién agregada.
  useEffect(() => {
    if (!isCartOpen || !lastAddedId) return
    setHighlightId(lastAddedId)
    const t = setTimeout(() => setHighlightId(null), 1600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartOpen, lastAddedAt])

  // Carga las direcciones guardadas al entrar al checkout con sesión iniciada
  // (o justo cuando el usuario inicia sesión estando ya en este paso).
  useEffect(() => {
    if (step === 'checkout' && user) {
      checkout.loadAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, user])

  useEffect(() => {
    if (cart.length === 0 && step === 'checkout') setStep('carrito')
  }, [cart.length, step])

  if (!isCartOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkout.validate()) return

    const orderData = {
      items: cart.map((line) => ({
        codigo: line.codigo,
        cantidad: line.quantity,
        color: line.color?.nombre || '',
        medida: line.medida || '',
        lensOptionIds: (line.lensOptions || []).map((o) => o.id),
      })),
      telefono: checkout.telefono,
      addressId: checkout.usingNewAddress ? null : checkout.selectedAddressId,
      address: checkout.usingNewAddress ? checkout.newAddress : null,
      guardarDireccion: checkout.guardarDireccion,
      recetaFile: checkout.recetaFile,
      aceptaMarketing: checkout.aceptaMarketing,
    }

    setIsSubmitting(true)
    try {
      const { urlEnlace } = await createPaymentLink(orderData, getIdToken)
      window.location.href = urlEnlace
    } catch (err) {
      console.error('Error generando el enlace de pago:', err)
      checkout.setErrors((prev) => ({ ...prev, submit: err.message || 'No pudimos iniciar el pago. Intenta de nuevo.' }))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Cabecera */}
        <div className="shrink-0 bg-white border-b border-gray-100">
          <div className="flex justify-between items-center px-6 pt-5 pb-4">
            {step === 'checkout' ? (
              <button
                type="button"
                onClick={() => setStep('carrito')}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-semibold"
              >
                <ChevronLeft size={18} /> Volver al carrito
              </button>
            ) : (
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                Tu carrito {cartCount > 0 && <span className="text-gray-400 font-semibold">({cartCount})</span>}
              </h2>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar carrito"
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {cart.length > 0 && <Stepper step={step} />}
        </div>

        {step === 'carrito' && (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {lastRemoved && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gray-900 text-white px-4 py-3 text-sm animate-fade-in">
                  <span className="truncate">Eliminaste {lastRemoved.line.name}</span>
                  <button type="button" onClick={undoRemove} className="shrink-0 inline-flex items-center gap-1.5 font-semibold text-cyan-300 hover:text-cyan-200">
                    <Undo2 size={15} /> Deshacer
                  </button>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                    <ShoppingBag size={32} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-500 mt-1 mb-6">Encuentra el aro perfecto para ti.</p>
                  <div className="flex flex-col gap-2 w-full max-w-[240px]">
                    <Link
                      to="/aros-oftalmicos"
                      onClick={handleClose}
                      className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors"
                    >
                      Ver aros oftálmicos
                    </Link>
                    <Link
                      to="/aros-de-sol"
                      onClick={handleClose}
                      className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-800 text-sm font-semibold px-5 py-3 rounded-full transition-colors"
                    >
                      Ver lentes de sol
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {cart.map((line) => (
                    <CartLine key={line.lineId} line={line} highlighted={line.lineId === highlightId} />
                  ))}
                </ul>
              )}

              {cart.length > 0 && (
                <div className="py-4 text-right">
                  {confirmClear ? (
                    <span className="inline-flex items-center gap-3 text-xs">
                      <span className="text-gray-500">¿Vaciar el carrito?</span>
                      <button
                        type="button"
                        onClick={() => {
                          clearCart()
                          setConfirmClear(false)
                        }}
                        className="font-semibold text-red-600 hover:underline"
                      >
                        Sí, vaciar
                      </button>
                      <button type="button" onClick={() => setConfirmClear(false)} className="font-semibold text-gray-600 hover:underline">
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-700"
                    >
                      Vaciar carrito
                    </button>
                  )}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 bg-white px-6 pt-4 pb-6 space-y-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.08)]">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <dt>Subtotal ({cartCount} {cartCount === 1 ? 'artículo' : 'artículos'})</dt>
                    <dd className="tabular-nums">{money(cartSubtotal)}</dd>
                  </div>
                  {cartLensTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <dt>Personalización de lentes</dt>
                      <dd className="tabular-nums">{money(cartLensTotal)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 mt-2">
                    <dt className="font-bold text-gray-900">Total</dt>
                    <dd className="text-2xl font-extrabold text-gray-900 tabular-nums">{money(cartTotal)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full h-13 py-4 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white font-semibold rounded-full transition-colors shadow-lg shadow-gray-900/10"
                >
                  <Lock size={16} />
                  Continuar con la compra
                  <ArrowRight size={16} />
                </button>

                <ul className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <li className="flex items-center gap-1.5">
                    <Truck size={14} className="text-cyan-700 shrink-0" /> Envíos a todo El Salvador
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-cyan-700 shrink-0" /> Pago seguro en línea
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        {step === 'checkout' && (
          <div className="flex-1 overflow-y-auto">
            {/* Resumen compacto del pedido */}
            <div className="mx-6 mt-5 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">Resumen del pedido</p>
                <button type="button" onClick={() => setStep('carrito')} className="text-xs font-semibold text-cyan-700 hover:underline">
                  Editar
                </button>
              </div>
              <div className="flex -space-x-3 mb-3">
                {cart.slice(0, 5).map((line) => (
                  <div key={line.lineId} className="w-12 h-12 rounded-xl bg-white border-2 border-gray-50 p-1 flex items-center justify-center">
                    {line.image && <img src={line.image} alt="" className="max-h-full max-w-full object-contain" />}
                  </div>
                ))}
                {cart.length > 5 && (
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                    +{cart.length - 5}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
                </span>
                <span className="font-extrabold text-gray-900 tabular-nums">{money(cartTotal)}</span>
              </div>
            </div>

            {!user && <LoginGate />}
            {user && (
              <>
                <CheckoutForm user={user} checkout={checkout} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                {checkout.errors.submit && <p className="text-red-500 text-xs text-center pb-4 px-6">{checkout.errors.submit}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
