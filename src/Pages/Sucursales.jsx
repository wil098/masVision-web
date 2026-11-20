import { usePageMeta } from '../lib/seo'
import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Navigation,
  MessageCircle,
  CreditCard,
  Microscope,
  ChevronDown,
} from 'lucide-react'

const BASE = import.meta.env.BASE_URL

const SUCURSALES = [
  {
    id: 1,
    nombre: 'Casa Matriz',
    ciudad: 'San Vicente',
    direccion: '4 local 3b, 4A Calle Oriente Bis, San Vicente',
    telefono: '2393-0403',
    mapaUrl: 'https://maps.app.goo.gl/inmttgdC75NxPR9k9',
    imagen: `${BASE}img/cas matriz optica.jpg`,
    tipo: 'Sede central',
  },
  {
    id: 2,
    nombre: 'Sucursal San Vicente',
    ciudad: 'San Vicente',
    direccion: '1 Calle Pte local 12, San Vicente',
    telefono: '2319-2358',
    mapaUrl: 'https://maps.app.goo.gl/bnGn1JNfsRcyNN5S6',
    imagen: `${BASE}img/sucursal 1.png`,
    tipo: 'Sucursal 1',
  },
  {
    id: 3,
    nombre: 'Sucursal Zacatecoluca',
    ciudad: 'Zacatecoluca',
    direccion: 'Avenida Juan Vicente Villacorta, Local #12, Zacatecoluca',
    telefono: '2334-1463',
    mapaUrl: 'https://maps.app.goo.gl/rv1syUiv2xZfPowC9',
    imagen: `${BASE}img/sucursal 2.png`,
    tipo: 'Sucursal 2',
  },
  {
    id: 4,
    nombre: 'Sucursal Cojutepeque',
    ciudad: 'Cojutepeque',
    direccion: 'Av José María Rivas, Cojutepeque',
    telefono: '2397-9044',
    mapaUrl: 'https://maps.app.goo.gl/42YGnDrJoNjqRTq48',
    imagen: `${BASE}img/sucursal 4.png`,
    tipo: 'Sucursal 3',
  },
]

const HORARIO = [
  { dias: 'Lunes a viernes', horas: '8:00 AM – 5:00 PM' },
  { dias: 'Sábado', horas: '8:00 AM – 12:00 MD' },
  { dias: 'Domingo', horas: 'Cerrado' },
]

const FACILIDADES = [
  {
    icon: CreditCard,
    titulo: 'Métodos de pago',
    texto:
      'Aceptamos efectivo, transferencias bancarias, enlaces de pago y todas las tarjetas de crédito o débito (tasa 0 disponible en sucursales participantes).',
  },
  {
    icon: Microscope,
    titulo: 'Laboratorio propio',
    texto:
      'Contamos con equipo digital avanzado para el biselado y montaje de tus lentes, reduciendo el tiempo de entrega al mínimo.',
  },
]

const FAQS = [
  {
    q: '¿Es necesario programar una cita para el examen visual?',
    a: 'No es estrictamente necesario, atendemos por orden de llegada. Sin embargo, te recomendamos agendar tu cita previamente vía WhatsApp para asegurarte un espacio sin tiempos de espera, especialmente los días sábados.',
  },
  {
    q: '¿Cuánto tiempo tardan en entregar mis lentes nuevos?',
    a: 'Para graduaciones sencillas o antirreflejantes estándar, podemos tener tus lentes listos el mismo día gracias a nuestro laboratorio express. Para lentes más especializados (como progresivos o policarbonato con tratamientos avanzados), el tiempo estimado es de 3 a 5 días hábiles.',
  },
  {
    q: '¿Puedo llevar mi propio aro y solo comprar los lentes graduados?',
    a: '¡Por supuesto! Trae tu aro favorito a cualquiera de nuestras sucursales. Nuestros técnicos evaluarán el material y estado del aro para garantizar que soporte el montaje de las nuevas lunas de forma segura.',
  },
]

const GALERIA = [
  { src: 'abel.jpeg', titulo: 'Área de recepción y exhibición', tag: 'Moderna y confortable', grande: true },
  { src: 'maquina.jpg', titulo: 'Tecnología de alta precisión', tag: 'Laboratorio' },
  { src: 'aro gildi.jpg', titulo: 'Más de 500 diseños exclusivos', tag: 'Tendencias' },
  { src: 'exam.jpg', titulo: 'Consultorio clínico profesional', tag: 'Examen clínico' },
  { src: 'hero-modelo.png', titulo: 'Marcas premium de sol', tag: 'Protección UV' },
]

// Estado de apertura según la hora de El Salvador (todas las sucursales
// comparten horario), sin depender de la zona horaria del visitante.
function getEstadoApertura(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/El_Salvador',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t) => parts.find((p) => p.type === t)?.value
  const dia = get('weekday')
  const minutos = Number(get('hour')) * 60 + Number(get('minute'))
  const cierre = dia === 'Sat' ? 12 * 60 : dia === 'Sun' ? null : 17 * 60
  const abierto = cierre !== null && minutos >= 8 * 60 && minutos < cierre
  if (abierto) {
    return { abierto, texto: `Abierto · cierra a las ${dia === 'Sat' ? '12:00 MD' : '5:00 PM'}` }
  }
  const abreHoy = cierre !== null && minutos < 8 * 60
  const abreManana = dia === 'Sat' ? 'el lunes' : 'mañana'
  return { abierto, texto: `Cerrado · abre ${abreHoy ? 'hoy' : abreManana} a las 8:00 AM` }
}

function useEstadoApertura() {
  const [estado, setEstado] = useState(() => getEstadoApertura())
  useEffect(() => {
    const id = setInterval(() => setEstado(getEstadoApertura()), 60_000)
    return () => clearInterval(id)
  }, [])
  return estado
}

const mapEmbedUrl = (s) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(`Óptica Más Visión, ${s.direccion}, El Salvador`)}&z=16&output=embed`

const telHref = (tel) => `tel:+503${tel.replace(/-/g, '')}`

function EstadoBadge({ estado, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
        estado.abierto ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
      } ${className}`}
    >
      <span className="relative flex w-2 h-2">
        {estado.abierto && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />}
        <span className={`relative inline-flex w-2 h-2 rounded-full ${estado.abierto ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      </span>
      {estado.texto}
    </span>
  )
}

export default function Sucursales() {
  usePageMeta({
    title: 'Sucursales y horarios',
    description:
      'Óptica Más Visión en San Vicente (2 sucursales), Zacatecoluca y Cojutepeque. Direcciones, teléfonos, horarios y cómo llegar.',
    path: '/sucursales',
  })
  const estado = useEstadoApertura()
  const [activaId, setActivaId] = useState(SUCURSALES[0].id)
  const [faqAbierta, setFaqAbierta] = useState(0)
  const activa = SUCURSALES.find((s) => s.id === activaId)

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Encabezado */}
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-24 sm:pt-36 sm:pb-32 px-4">
        <img
          src={`${BASE}img/sucursal 1.png`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30" />
        <div className="relative max-w-7xl mx-auto text-white animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3">Nuestras ópticas</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">Sucursales y horarios</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-xl mb-6">
            Cuatro ubicaciones en San Vicente, Zacatecoluca y Cojutepeque, con la atención profesional que tus ojos
            merecen.
          </p>
          <EstadoBadge estado={estado} className="!bg-white/10 !text-white backdrop-blur" />
        </div>
      </section>

      {/* Mapa + selector */}
      <section className="relative z-10 px-4 -mt-16 sm:-mt-20">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 overflow-hidden grid lg:grid-cols-[380px_1fr]">
          <div className="p-3 sm:p-4 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:overflow-visible">
            {SUCURSALES.map((s) => {
              const sel = s.id === activaId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActivaId(s.id)}
                  aria-pressed={sel}
                  className={`shrink-0 w-64 lg:w-auto text-left flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                    sel ? 'border-cyan-500 bg-cyan-50/60 ring-1 ring-cyan-500' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                      sel ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <MapPin size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-cyan-700">{s.tipo}</span>
                    <span className="block font-bold text-gray-900 leading-tight">{s.nombre}</span>
                    <span className="block text-xs text-gray-500 mt-1 leading-snug">{s.direccion}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative min-h-[320px] lg:min-h-[460px] bg-gray-100">
            <iframe
              key={activa.id}
              title={`Mapa de ${activa.nombre}`}
              src={mapEmbedUrl(activa)}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute left-3 right-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 bg-white/95 backdrop-blur rounded-2xl shadow-lg p-4">
              <p className="font-bold text-gray-900">{activa.nombre}</p>
              <p className="text-xs text-gray-500 mb-3">{activa.direccion}</p>
              <div className="flex gap-2">
                <a
                  href={activa.mapaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                >
                  <Navigation size={15} /> Cómo llegar
                </a>
                <a
                  href={telHref(activa.telefono)}
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-800 text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                >
                  <Phone size={15} /> Llamar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjetas de sucursales */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">Visítanos</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Elige tu sucursal más cercana</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-start gap-3">
            <Clock size={20} className="text-cyan-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-gray-900 mb-1">Mismo horario en todas</p>
              {HORARIO.map((h) => (
                <p key={h.dias} className="flex justify-between gap-6 text-gray-600">
                  <span>{h.dias}</span>
                  <span className={h.horas === 'Cerrado' ? 'text-gray-400' : 'font-semibold text-gray-800'}>{h.horas}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {SUCURSALES.map((s) => (
            <article
              key={s.id}
              className="group bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.imagen}
                  alt={s.nombre}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-gray-800">
                  {s.tipo}
                </span>
                <span className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow">{s.ciudad}</span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{s.nombre}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.direccion}</p>
                <a
                  href={telHref(s.telefono)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-cyan-700 mb-5"
                >
                  <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center">
                    <Phone size={14} />
                  </span>
                  {s.telefono}
                </a>
                <div className="mt-auto flex gap-2">
                  <a
                    href={s.mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-cyan-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                  >
                    <Navigation size={15} /> Cómo llegar
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActivaId(s.id)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    aria-label={`Ver ${s.nombre} en el mapa`}
                    title="Ver en el mapa"
                    className="w-11 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    <MapPin size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Galería */}
      <section className="bg-white py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">Instalaciones</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Conoce nuestras ópticas</h2>
            <p className="text-gray-500">
              Equipos con tecnología de vanguardia y espacios cómodos diseñados para brindarte la mejor experiencia visual.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 sm:gap-4 md:h-[520px]">
            {GALERIA.map((g) => (
              <figure
                key={g.src}
                className={`relative rounded-3xl overflow-hidden group bg-gray-100 ${
                  g.grande ? 'col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square md:aspect-auto'
                }`}
              >
                <img
                  src={`${BASE}img/${g.src}`}
                  alt={g.titulo}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-cyan-800">
                  {g.tag}
                </span>
                <figcaption className={`absolute bottom-3 left-4 right-4 text-white font-bold ${g.grande ? 'text-lg sm:text-xl' : 'text-sm'}`}>
                  {g.titulo}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Facilidades */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">En todas las sucursales</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              Pensado para tu comodidad y confianza
            </h2>
            <p className="text-gray-500">
              No importa cuál sucursal elijas, en todas garantizamos el mismo estándar de excelencia, comodidad y tecnología.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {FACILIDADES.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 group hover:shadow-xl hover:shadow-gray-200/60 transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="bg-white py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="md:sticky md:top-28 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Información útil</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              ¿Dudas sobre cómo visitarnos?
            </h2>
            <p className="text-gray-500 text-sm">
              Aquí resolvemos las preguntas más comunes de nuestros pacientes antes de asistir a nuestras ópticas.
            </p>
          </div>

          <div className="md:col-span-2 divide-y divide-gray-100 border-y border-gray-100">
            {FAQS.map((f, i) => {
              const open = faqAbierta === i
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    onClick={() => setFaqAbierta(open ? null : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-bold text-gray-900 sm:text-lg">{f.q}</span>
                    <span
                      className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center transition-all ${
                        open ? 'bg-gray-900 border-gray-900 text-white rotate-180' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <p className="overflow-hidden text-gray-600 text-sm sm:text-base leading-relaxed pr-12">
                      <span className="block pb-5">{f.a}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/30 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative text-white max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">¿Tienes dudas de cómo llegar?</h2>
            <p className="text-slate-300 mb-8">
              Escríbenos y te ayudamos a agendar tu cita en la sucursal más cercana.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/50371497972?text=Hola, necesito ayuda para ubicar una sucursal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-7 py-3.5 rounded-full font-bold transition-colors"
              >
                <MessageCircle size={18} /> Escribir por WhatsApp
              </a>
              <a
                href="https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
              >
                <Calendar size={18} /> Agendar cita
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
