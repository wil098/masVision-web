import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Lock, MapPin, Truck, Glasses, CheckCircle2, Clock, XCircle, MessageCircle, ShieldCheck } from 'lucide-react'
import { fetchOrderView, fetchProduct } from '../lib/orderService'
import { usePageMeta } from '../lib/seo'

const money = (n) => `$${Number(n || 0).toFixed(2)}`

// "Aro Gildi Mopan (GCP2400174) - Gildi - Color: C7 - Verde - Medida: 50 mm / 18 mm / 140 mm x1 — $75.00"
function parseLinea(linea) {
  const m = linea.match(/^(.*?) \(([^)]+)\) - (.*?) x(\d+) — \$([\d.]+)$/)
  if (!m) return null
  const [, nombre, codigo, resto, cantidad, total] = m
  const partes = resto.split(' - ')
  const marca = partes.shift()
  const detalle = partes.join(' - ')
  const color = detalle.match(/Color: (.*?)(?: - Medida:| - Lente:|$)/)?.[1]
  const medida = detalle.match(/Medida: (.*?)(?: - Lente:|$)/)?.[1]
  return { nombre, codigo, marca, color, medida, cantidad: Number(cantidad), total: Number(total) }
}

function ItemImage({ codigo, color }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    fetchProduct(codigo)
      .then((p) => {
        const c = (p.colores_disponibles || []).find((x) => (typeof x === 'string' ? x : x.nombre) === color)
        setSrc((c && typeof c !== 'string' && c.images?.[0]) || p.images?.[0] || null)
      })
      .catch(() => setSrc(null))
  }, [codigo, color])
  return (
    <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2">
      {src ? <img src={src} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <Glasses size={28} className="text-gray-300" />}
    </div>
  )
}

const ESTADOS = {
  cotizado: { icon: Clock, titulo: 'Tu cotización está lista', texto: 'Revisa tu pedido y paga todo junto en un solo pago.', tono: 'text-cyan-700 bg-cyan-50' },
  cotizacion: { icon: Clock, titulo: 'Estamos revisando tu receta', texto: 'Te avisaremos por correo y WhatsApp cuando tu cotización esté lista.', tono: 'text-sky-700 bg-sky-50' },
  pagado: { icon: CheckCircle2, titulo: '¡Pedido pagado!', texto: 'Gracias por tu compra. Te avisaremos cuando tu pedido vaya en camino.', tono: 'text-emerald-700 bg-emerald-50' },
  cancelado: { icon: XCircle, titulo: 'Pedido cancelado', texto: 'Si fue un error, escríbenos por WhatsApp.', tono: 'text-gray-600 bg-gray-100' },
}

export default function PedidoPublico() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const token = params.get('t') || ''
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState(null)

  usePageMeta({ title: 'Tu pedido', path: `/pedido/${id}`, noindex: true })

  useEffect(() => {
    fetchOrderView(id, token)
      .then(setPedido)
      .catch((err) => setError(err.message))
  }, [id, token])

  if (error) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">No encontramos este pedido</h1>
        <p className="text-gray-500 mb-6">El enlace no es válido o está incompleto. Revisa el correo que te enviamos.</p>
        <a
          href="https://wa.me/50371497972?text=Hola, no puedo abrir el enlace de mi pedido"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold"
        >
          <MessageCircle size={16} /> Escríbenos por WhatsApp
        </a>
      </section>
    )
  }

  if (!pedido) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-24 rounded-3xl bg-gray-100" />
          <div className="h-64 rounded-3xl bg-gray-100" />
        </div>
      </section>
    )
  }

  const lineas = String(pedido.resumen || '').split('\n').map((l) => l.trim()).filter(Boolean)
  const items = lineas.map(parseLinea).filter(Boolean)
  const envio = lineas.map((l) => l.match(/^Envío a domicilio — \$([\d.]+)$/)).find(Boolean)
  const estado = ESTADOS[pedido.status] || ESTADOS.cotizacion
  const EstadoIcon = estado.icon
  const puedePagar = pedido.status === 'cotizado' && pedido.url_pago

  return (
    <section className="min-h-screen pt-28 pb-16 px-4 bg-gray-50/60">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
        <div className={`rounded-3xl p-5 sm:p-6 flex items-start gap-4 ${estado.tono}`}>
          <EstadoIcon size={28} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Pedido #{pedido.numero}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mt-1">
              {pedido.nombre ? `${pedido.nombre}, ` : ''}
              {estado.titulo.charAt(0).toLowerCase() + estado.titulo.slice(1)}
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-1">{estado.texto}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tu pedido</h2>
          <ul className="divide-y divide-gray-100">
            {items.map((it, i) => (
              <li key={i} className="flex gap-4 py-4 first:pt-0">
                <ItemImage codigo={it.codigo} color={it.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">{it.marca?.replace(/\.$/, '')}</p>
                      <Link to={`/producto/${it.codigo}`} className="font-semibold text-gray-900 hover:text-cyan-700">
                        {it.nombre}
                      </Link>
                    </div>
                    <p className="font-bold text-gray-900 tabular-nums">{money(it.total)}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {it.color && <p>Color {it.color}</p>}
                    {it.medida && <p>Medida {it.medida}</p>}
                    {it.cantidad > 1 && <p>Cantidad: {it.cantidad}</p>}
                  </div>
                </div>
              </li>
            ))}
            {pedido.lentes_precio > 0 && (
              <li className="flex gap-4 py-4">
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <Glasses size={30} />
                </div>
                <div className="flex-1 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">Según tu receta</p>
                    <p className="font-semibold text-gray-900">{pedido.lentes_descripcion}</p>
                  </div>
                  <p className="font-bold text-gray-900 tabular-nums">{money(pedido.lentes_precio)}</p>
                </div>
              </li>
            )}
          </ul>

          <dl className="border-t border-gray-100 pt-4 mt-2 space-y-1.5 text-sm">
            {envio && (
              <div className="flex justify-between text-gray-600">
                <dt className="flex items-center gap-1.5">
                  <Truck size={14} /> Envío a domicilio
                </dt>
                <dd className="tabular-nums">{money(envio[1])}</dd>
              </div>
            )}
            {pedido.status === 'cotizacion' ? (
              <div className="flex justify-between items-baseline pt-2">
                <dt className="font-bold text-gray-900">Aro + envío</dt>
                <dd className="text-xl font-extrabold text-gray-900 tabular-nums">{money(pedido.total)}</dd>
              </div>
            ) : (
              <div className="flex justify-between items-baseline pt-2">
                <dt className="font-bold text-gray-900">Total</dt>
                <dd className="text-3xl font-extrabold text-gray-900 tabular-nums">{money(pedido.total)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 flex items-start gap-3">
          <MapPin size={20} className="text-cyan-700 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 mb-1">Se envía a</p>
            <p className="text-gray-700">{pedido.direccion}</p>
            <p className="text-gray-700">
              {pedido.municipio}, {pedido.departamento}
            </p>
            {pedido.referencia && <p className="text-gray-500 mt-1">Referencia: {pedido.referencia}</p>}
          </div>
        </div>

        {puedePagar && (
          <div className="sticky bottom-4 z-10">
            <a
              href={pedido.url_pago}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white text-lg font-semibold px-6 py-4 rounded-full shadow-xl shadow-gray-900/20 transition-colors"
            >
              <Lock size={18} /> Pagar {money(pedido.total)}
            </a>
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
              <ShieldCheck size={14} className="text-cyan-700" /> Un solo pago con tarjeta, seguro a través de Wompi
            </p>
          </div>
        )}

        <p className="text-center text-sm text-gray-500">
          ¿Dudas con tu pedido o tus lentes?{' '}
          <a
            href={`https://wa.me/50371497972?text=${encodeURIComponent(`Hola, tengo una duda sobre mi pedido #${pedido.numero}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-cyan-700 hover:underline"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </section>
  )
}
