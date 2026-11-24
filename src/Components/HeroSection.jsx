import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Glasses } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchHeroSlides } from '../lib/orderService'

const AUTOPLAY_MS = 7000
const CACHE_KEY = 'heroSlides:v1'
const WHATSAPP_CITA = 'https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión'

// Lo que se ve mientras llega la respuesta (o si el servidor falla): el
// slide que antes estaba fijo en el código.
const DEFAULT_SLIDES = [
  {
    id: 'default',
    eyebrow: 'Óptica Más Visión',
    title: 'Nueva colección',
    subtitle: 'Lentes de alta calidad y exámenes visuales profesionales, con envíos a todo El Salvador.',
    image: `${import.meta.env.BASE_URL}img/wide%20foto.png`,
    image_movil: '',
    boton_texto: 'Ver catálogo',
    boton_link: '/aros-oftalmicos',
    mostrar_texto: true,
    enfoque: 'derecha',
  },
]

// Qué parte de la foto se conserva al recortarla (sobre todo en celular).
// Si hay foto vertical para celular, en celular se centra y el enfoque solo
// aplica en pantallas grandes.
const ENFOQUE_CLASSES = {
  izquierda: { movil: 'object-[15%_center]', desktop: 'md:object-[35%_center]' },
  centro: { movil: 'object-center', desktop: 'md:object-center' },
  derecha: { movil: 'object-[85%_center]', desktop: 'md:object-[65%_center]' },
}

function readCachedSlides() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    return Array.isArray(cached) && cached.length > 0 ? cached : null
  } catch {
    return null
  }
}

function writeCachedSlides(slides) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(slides))
  } catch {
    // Sin almacenamiento (modo privado, etc.): solo se pierde el caché.
  }
}

function isExternal(href) {
  return /^https:\/\//.test(href)
}

// Enlace interno con el router o externo en pestaña nueva.
function SmartLink({ href, className, children, ...rest }) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className} {...rest}>
      {children}
    </Link>
  )
}

function titleSizeClass(title) {
  const len = (title || '').length
  if (len > 28) return 'text-4xl sm:text-5xl lg:text-6xl'
  if (len > 16) return 'text-5xl sm:text-6xl lg:text-7xl'
  return 'text-6xl sm:text-7xl lg:text-8xl'
}

function SlideImage({ slide, eager }) {
  const enfoque = ENFOQUE_CLASSES[slide.enfoque] || ENFOQUE_CLASSES.centro
  return (
    <picture>
      {slide.image_movil && <source media="(max-width: 767px)" srcSet={slide.image_movil} />}
      <img
        src={slide.image}
        alt={slide.mostrar_texto ? '' : slide.title || slide.boton_texto || 'Promoción de Óptica Más Visión'}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover ${slide.image_movil ? 'object-center' : enfoque.movil} ${enfoque.desktop}`}
      />
    </picture>
  )
}

function SlideText({ slide, isFirst }) {
  const Heading = isFirst ? 'h1' : 'h2'
  return (
    <div className="relative max-w-7xl mx-auto h-full px-4 flex items-end md:items-center pb-32 md:pb-0 min-h-[700px] md:min-h-[760px]">
      <div className="w-full md:w-1/2 pt-24 md:pt-0 text-white">
        {slide.eyebrow && (
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-5">
            <span className="w-8 h-px bg-cyan-300" /> {slide.eyebrow}
          </p>
        )}
        <Heading
          className={`${titleSizeClass(slide.title)} font-extrabold uppercase tracking-tighter leading-[0.9] mb-6 text-balance`}
        >
          {slide.title}
        </Heading>
        {slide.subtitle && <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-md">{slide.subtitle}</p>}

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={WHATSAPP_CITA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-cyan-500 text-slate-950 px-8 py-4 rounded-full font-bold shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-colors"
          >
            <Calendar size={20} />
            Agendar cita
          </a>

          {slide.boton_texto && slide.boton_link && (
            <SmartLink
              href={slide.boton_link}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/40 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              <Glasses size={20} />
              {slide.boton_texto}
            </SmartLink>
          )}
        </div>
      </div>
    </div>
  )
}

function Slide({ slide, index, active, total }) {
  const label = `${index + 1} de ${total}`
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        active ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
      }`}
    >
      <SlideImage slide={slide} eager={index === 0} />

      {slide.mostrar_texto ? (
        <>
          {/* Degradado para que el texto se lea sobre la mitad izquierda (más fuerte en celular). */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent md:from-slate-950/85 md:via-slate-950/40 md:to-transparent" />
          <div className={active ? 'animate-fade-up' : ''}>
            <SlideText slide={slide} isFirst={index === 0} />
          </div>
        </>
      ) : (
        <>
          {/* Banner con el texto ya en la imagen: solo un velo arriba para que se lea el menú. */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/60 to-transparent" />
          {slide.boton_link && (
            <SmartLink
              href={slide.boton_link}
              aria-label={slide.title || slide.boton_texto || 'Ver promoción'}
              className="absolute inset-0"
            />
          )}
          {index === 0 && slide.title && <h1 className="sr-only">{slide.title}</h1>}
        </>
      )}
    </div>
  )
}

const HeroSection = () => {
  const [slides, setSlides] = useState(() => readCachedSlides() || DEFAULT_SLIDES)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const total = slides.length

  useEffect(() => {
    let cancelled = false
    fetchHeroSlides()
      .then((data) => {
        if (cancelled) return
        const next = Array.isArray(data) && data.length > 0 ? data : DEFAULT_SLIDES
        setSlides(next)
        setCurrent((c) => (c < next.length ? c : 0))
        writeCachedSlides(next === DEFAULT_SLIDES ? [] : next)
      })
      .catch((err) => console.error('Error cargando la portada:', err))
    return () => {
      cancelled = true
    }
  }, [])

  const goTo = useCallback((i) => setCurrent(((i % total) + total) % total), [total])
  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // Avance automático: se detiene con el mouse/foco encima, con la pestaña
  // oculta y para quien prefiere menos movimiento.
  useEffect(() => {
    if (total < 2 || paused) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (!document.hidden) setCurrent((c) => (c + 1) % total)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [total, paused, current])

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  return (
    <section
      className="relative w-full min-h-[700px] md:min-h-[760px] overflow-hidden bg-slate-950"
      aria-roledescription={total > 1 ? 'carrusel' : undefined}
      aria-label="Promociones"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={total > 1 ? onTouchStart : undefined}
      onTouchEnd={total > 1 ? onTouchEnd : undefined}
      onKeyDown={total > 1 ? onKeyDown : undefined}
    >
      {/* Sensor para el Navbar: en cuanto sale de vista, el navbar deja de ser transparente. */}
      <div id="hero-sentinel" className="absolute top-0 left-0 h-20 w-full z-20" aria-hidden="true" />

      {slides.map((slide, i) => (
        <Slide key={slide.id} slide={slide} index={i} active={i === current} total={total} />
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Promoción anterior"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/30 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente promoción"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/30 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-[4.5rem] sm:bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a la promoción ${i + 1}`}
                aria-current={i === current}
                className="p-2 group"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default HeroSection
