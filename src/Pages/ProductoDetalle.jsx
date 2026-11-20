import { usePageMeta, SITE_URL } from '../lib/seo'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Circle, MoveHorizontal, Ruler, Calendar, Info, ShoppingCart, Zap } from 'lucide-react'
import CheckoutForm from '../Components/CheckoutForm'
import LoginGate from '../Components/LoginGate'
import OrderConfirmation from '../Components/OrderConfirmation'
import { useCheckoutForm } from '../hooks/useCheckoutForm'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { buildCartLine } from '../lib/productUtils'
import { createPaymentLink, fetchLensOptions, fetchProduct } from '../lib/orderService'

function groupLensOptionsByCategoria(lensOptions) {
  const groups = {}
  for (const option of lensOptions) {
    if (!groups[option.categoria]) groups[option.categoria] = []
    groups[option.categoria].push(option)
  }
  return Object.entries(groups).map(([categoria, options]) => ({ categoria, options }))
}

// Productos antiguos guardan cada color como texto plano (ej. "C1"); los
// nuevos llevan { nombre, hex } para poder mostrar el color real.
function getColorNombre(color) {
  return typeof color === 'string' ? color : color.nombre
}

function getColorHex(color) {
  return typeof color === 'string' ? null : color.hex
}

function getColorImages(color) {
  return typeof color === 'string' ? [] : color.images || []
}

function formatMedida(medida) {
  return [medida.calibre, medida.puente, medida.varilla].filter(Boolean).join(' / ')
}

// Un ícono distinto por campo para que el selector de medida se lea de un
// vistazo, en vez de un texto plano "56 mm / 18 mm / 145 mm".
const MEDIDA_FIELDS = [
  { key: 'calibre', icon: Circle },
  { key: 'puente', icon: MoveHorizontal },
  { key: 'varilla', icon: Ruler },
]

/* ---------- Paso 1: Detalles del producto + selectores ---------- */
function ProductDetails({
  product,
  selectedColor,
  onSelectColor,
  selectedMedidaIndex,
  onSelectMedida,
  medidaError,
  selectedImage,
  onSelectImage,
  colorError,
  onContinue,
  onAddToCart,
  lensGroups,
  selectedLensOptions,
  onSelectLensOption,
  lensOptionsTotal,
}) {
  const { name, description, price, codigo, brand, material, forma, caracteristicas, colores_disponibles, medidas_disponibles, images, categoria } = product
  const esAroOftalmico = categoria === 'oftalmico'

  // Si el color elegido tiene fotos propias, la galería las usa a ellas;
  // si no (productos viejos o colores sin fotos asignadas), usa las
  // imágenes generales del producto como respaldo.
  const selectedColorObj = colores_disponibles?.find((c) => getColorNombre(c) === selectedColor)
  const selectedColorImages = selectedColorObj ? getColorImages(selectedColorObj) : []
  const activeImages = selectedColorImages.length > 0 ? selectedColorImages : images

  const citaMessage = `Hola! Me interesa probarme el modelo ${name} de ${brand} en tienda. ¿Podemos agendar una cita?`
  const citaUrl = `https://wa.me/50371497972?text=${encodeURIComponent(citaMessage)}`

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:pt-6">
      {/* Galería */}
      <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center p-6 sm:p-10 rounded-3xl">
        <img
          key={activeImages?.[selectedImage] ?? activeImages?.[0]}
          src={activeImages?.[selectedImage] ?? activeImages?.[0]}
          alt={name}
          className="max-h-full max-w-full object-contain mix-blend-multiply animate-fade-up"
        />
      </div>
      {activeImages?.length > 1 && (
        <div className="flex gap-2 pt-4 overflow-x-auto no-scrollbar">
          {activeImages.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`w-16 h-16 shrink-0 rounded-2xl border-2 p-1.5 bg-gray-50 transition-all ${
                selectedImage === idx ? 'border-cyan-600' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`${name} miniatura ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
      </div>

      <div className="flex flex-col">

      <div className="py-5 space-y-6">
        {/* Encabezado */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{name}</h2>
          {description && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{description}</p>}
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            ${(price + lensOptionsTotal).toFixed(2)}
          </p>
          {lensOptionsTotal > 0 ? (
            <p className="text-xs text-gray-500 mt-1">Aro ${price} + personalización de lente ${lensOptionsTotal.toFixed(2)}</p>
          ) : (
            esAroOftalmico && <p className="text-sm text-gray-500 mt-1">Precio solo del aro, no incluye lentes</p>
          )}
        </div>

        {/* Aviso: la tienda vende el aro; los lentes graduados se cotizan aparte con la receta. */}
        {esAroOftalmico && (
          <div className="flex gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4">
            <Info size={20} className="text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 leading-relaxed space-y-1.5">
              <p className="font-semibold text-gray-900">¿Necesitas lentes graduados?</p>
              <p>
                Este precio es únicamente del aro. Al hacer tu pedido, sube tu receta y te enviaremos la
                cotización de tus lentes. Los lentes se pagan aparte, solo si aceptas la cotización.
              </p>
              <p>
                ¿No tienes receta?{' '}
                <Link to="/examenes-de-la-vista" className="font-semibold text-cyan-700 hover:text-cyan-800 underline underline-offset-2">
                  Agenda tu examen de la vista
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Ficha técnica */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {codigo && (
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">Código</p>
              <p className="font-semibold text-gray-800">{codigo}</p>
            </div>
          )}
          {forma && (
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">Forma</p>
              <p className="font-semibold text-gray-800">{forma}</p>
            </div>
          )}
          {material && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 col-span-2">
              <p className="text-xs text-gray-500">Material</p>
              <p className="font-semibold text-gray-800">{material}</p>
            </div>
          )}
          {caracteristicas && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 col-span-2">
              <p className="text-xs text-gray-500">Características</p>
              <p className="font-semibold text-gray-800">{caracteristicas}</p>
            </div>
          )}
        </div>

        {/* Selector de medida */}
        {medidas_disponibles?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Medida (calibre / puente / varilla)</p>
            <div className="flex flex-wrap gap-2">
              {medidas_disponibles.map((medida, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectMedida(idx)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    selectedMedidaIndex === idx
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {MEDIDA_FIELDS.filter((field) => medida[field.key]).map((field) => (
                    <span key={field.key} className="flex items-center gap-1">
                      <field.icon size={13} className="opacity-60" />
                      {medida[field.key]}
                    </span>
                  ))}
                </button>
              ))}
            </div>
            {medidaError && <p className="text-red-500 text-xs mt-2">{medidaError}</p>}
          </div>
        )}

        {/* Selector de color */}
        {colores_disponibles?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Color {selectedColor && <span className="font-normal text-gray-500">· {selectedColor}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {colores_disponibles.map((color) => {
                const nombre = getColorNombre(color)
                const hex = getColorHex(color)
                return (
                  <button
                    key={nombre}
                    type="button"
                    onClick={() => onSelectColor(nombre)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedColor === nombre
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {hex && (
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                    )}
                    {nombre}
                  </button>
                )
              })}
            </div>
            {colorError && <p className="text-red-500 text-xs mt-2">{colorError}</p>}
          </div>
        )}

        {/* Personalización de lente (filtro, marca, etc.) — solo aparece si el
            admin ya activó opciones con precio definido. */}
        {lensGroups.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-800">Personaliza tu lente</p>
            {lensGroups.map(({ categoria, options }) => (
              <div key={categoria}>
                <p className="text-xs text-gray-500 mb-2 capitalize">{categoria}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectLensOption(categoria, null)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      !selectedLensOptions[categoria]
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Ninguno
                  </button>
                  {options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelectLensOption(categoria, option.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        selectedLensOptions[categoria] === option.id
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {option.nombre} (+${option.precio_adicional.toFixed(2)})
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAddToCart}
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white px-6 py-4 rounded-full font-semibold shadow-lg shadow-gray-900/10 transition-all"
          >
            <ShoppingCart size={18} /> Agregar al carrito
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="w-full inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-4 rounded-full font-semibold transition-all"
          >
            <Zap size={18} /> Comprar ahora
          </button>
        </div>
        <a
          href={citaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 py-1.5"
        >
          <Calendar size={16} /> Prefiero probármelo en tienda
        </a>
      </div>
      </div>
    </div>
  )
}

/* ---------- Componente principal ---------- */
export default function ProductoDetalle() {
  const { codigo } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState('detalle') // 'detalle' | 'checkout' | 'confirmacion'
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedMedidaIndex, setSelectedMedidaIndex] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lensGroups, setLensGroups] = useState([])
  const [selectedLensOptions, setSelectedLensOptions] = useState({})
  const checkout = useCheckoutForm()
  const { user, getIdToken } = useAuth()
  const { addLine } = useCart()

  const brandName = (product?.brand || '').replace(/[.]$/, '')
  usePageMeta({
    title: product ? product.name : notFound ? 'Producto no encontrado' : undefined,
    description: product
      ? `${product.name} de ${brandName} a $${Number(product.price).toFixed(2)}. ${product.description || ''} Envíos a todo El Salvador.`.slice(0, 300)
      : undefined,
    path: `/producto/${codigo}`,
    image: product?.images?.[0],
    type: product ? 'product' : 'website',
    noindex: notFound,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.codigo,
          description: product.description || product.name,
          image: product.images || [],
          brand: { '@type': 'Brand', name: brandName },
          material: product.material || undefined,
          color: (product.colores_disponibles || []).map((c) => (typeof c === 'string' ? c : c.nombre)).join(', ') || undefined,
          category: product.categoria === 'sol' ? 'Lentes de sol' : 'Aros oftálmicos',
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/producto/${encodeURIComponent(product.codigo)}`,
            priceCurrency: 'USD',
            price: Number(product.price).toFixed(2),
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: 'Óptica Más Visión' },
          },
        }
      : null,
  })

  // Carga el producto por código y reinicia el estado del selector cada vez
  // que cambia (por ejemplo, al navegar de un producto a otro).
  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setStep('detalle')
    setSelectedImage(0)
    setSelectedLensOptions({})
    checkout.reset()
    setIsSubmitting(false)
    window.scrollTo(0, 0)

    fetchProduct(codigo)
      .then((p) => {
        setProduct(p)
        setSelectedColor(p.colores_disponibles?.[0] ? getColorNombre(p.colores_disponibles[0]) : null)
        setSelectedMedidaIndex(p.medidas_disponibles?.length ? 0 : null)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo])

  // Carga las opciones de lente activas solo para aros oftálmicos. Si el
  // admin todavía no ha publicado ninguna (caso normal por ahora, mientras
  // no hay precios definidos), lensGroups queda vacío y la sección ni
  // siquiera se renderiza — el flujo se ve igual que antes de esta función.
  useEffect(() => {
    if (product?.categoria === 'oftalmico') {
      fetchLensOptions()
        .then((options) => setLensGroups(groupLensOptionsByCategoria(options)))
        .catch((err) => {
          console.error('Error cargando opciones de lente:', err)
          setLensGroups([])
        })
    } else {
      setLensGroups([])
    }
  }, [product])

  // Carga las direcciones guardadas al entrar al checkout con sesión iniciada
  // (o justo cuando el usuario inicia sesión estando ya en este paso).
  useEffect(() => {
    if (step === 'checkout' && user) {
      checkout.loadAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, user])

  if (loading) {
    return (
      <section className="min-h-screen pt-28 pb-16 px-4">
        <p className="text-center text-gray-400">Cargando producto...</p>
      </section>
    )
  }

  if (notFound || !product) {
    return (
      <section className="min-h-screen pt-28 pb-16 px-4 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
        <p className="text-gray-500 text-sm mb-6">Puede que ya no esté disponible.</p>
        <Link to="/" className="text-cyan-600 font-semibold hover:underline">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  const allLensOptions = lensGroups.flatMap((group) => group.options)
  const selectedLensOptionIds = Object.values(selectedLensOptions).filter(Boolean)
  const lensOptionsTotal = selectedLensOptionIds.reduce((sum, id) => {
    const option = allLensOptions.find((o) => o.id === id)
    return sum + (option?.precio_adicional ?? 0)
  }, 0)

  const handleSelectLensOption = (categoria, optionId) => {
    setSelectedLensOptions((prev) => ({ ...prev, [categoria]: optionId }))
  }

  const validateSelection = () => {
    if (product.colores_disponibles?.length && !selectedColor) {
      checkout.setErrors((prev) => ({ ...prev, color: 'Selecciona un color para continuar.' }))
      return false
    }
    if (product.medidas_disponibles?.length && selectedMedidaIndex === null) {
      checkout.setErrors((prev) => ({ ...prev, medida: 'Selecciona una medida para continuar.' }))
      return false
    }
    return true
  }

  const goToCheckout = () => {
    if (validateSelection()) setStep('checkout')
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return
    const colorObj = product.colores_disponibles?.find((c) => getColorNombre(c) === selectedColor) ?? null
    const medidaObj = selectedMedidaIndex !== null ? product.medidas_disponibles[selectedMedidaIndex] : null
    const lensOptions = selectedLensOptionIds.map((id) => allLensOptions.find((o) => o.id === id)).filter(Boolean)
    addLine(buildCartLine(product, { color: colorObj, medida: medidaObj, lensOptions }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkout.validate()) return

    const selectedMedida =
      selectedMedidaIndex !== null ? formatMedida(product.medidas_disponibles[selectedMedidaIndex]) : ''

    const orderData = {
      items: [
        { codigo: product.codigo, cantidad: 1, color: selectedColor, medida: selectedMedida, lensOptionIds: selectedLensOptionIds },
      ],
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
      checkout.setErrors((prev) => ({ ...prev, submit: 'No pudimos iniciar el pago. Intenta de nuevo.' }))
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen pt-28 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className={`${step === 'detalle' ? 'max-w-6xl' : 'max-w-2xl'} mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden`}>
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          {step === 'checkout' ? (
            <button
              type="button"
              onClick={() => setStep('detalle')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              <ChevronLeft size={18} /> Volver
            </button>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">{product.brand}</span>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Volver al catálogo
          </button>
        </div>

        <div className={step === 'detalle' ? 'px-5 sm:px-8 lg:px-10 pb-8' : 'px-6 pb-6'}>
          {step === 'confirmacion' && <OrderConfirmation onClose={() => navigate(-1)} />}

          {step === 'detalle' && (
            <ProductDetails
              product={product}
              selectedColor={selectedColor}
              onSelectColor={(color) => {
                setSelectedColor(color)
                setSelectedImage(0)
                checkout.setErrors((prev) => ({ ...prev, color: null }))
              }}
              selectedMedidaIndex={selectedMedidaIndex}
              onSelectMedida={(idx) => {
                setSelectedMedidaIndex(idx)
                checkout.setErrors((prev) => ({ ...prev, medida: null }))
              }}
              medidaError={checkout.errors.medida}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              colorError={checkout.errors.color}
              onContinue={goToCheckout}
              onAddToCart={handleAddToCart}
              lensGroups={lensGroups}
              selectedLensOptions={selectedLensOptions}
              onSelectLensOption={handleSelectLensOption}
              lensOptionsTotal={lensOptionsTotal}
            />
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
    </section>
  )
}