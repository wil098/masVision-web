import { Calendar, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[640px] md:min-h-[720px] overflow-hidden bg-slate-950">
      {/* Sensor para el Navbar: en cuanto sale de vista, el navbar deja de ser transparente. */}
      <div id="hero-sentinel" className="absolute top-0 left-0 h-20 w-full z-20" aria-hidden="true" />

      {/* Imagen de fondo full-bleed */}
      <img
        src={`${import.meta.env.BASE_URL}img/wide foto.png`}
        alt="Modelo usando lentes de sol de Óptica Más Visión"
        className="absolute inset-0 w-full h-full object-cover object-[85%_center] md:object-[65%_center]"
      />

      {/* Overlay para legibilidad del texto sobre la mitad izquierda (más fuerte en mobile, donde el recorte deja al modelo más cerca del texto) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent md:from-slate-950/85 md:via-slate-950/40 md:to-transparent" />

      <div className="relative max-w-7xl mx-auto h-full px-4 flex items-center min-h-[640px] md:min-h-[720px]">
        <div className="w-full md:w-1/2 pt-20 md:pt-0 text-white">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            NUEVA
            <br />
            COLECCIÓN
          </h1>
          <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-md">
            Lentes de alta calidad y exámenes visuales profesionales, con envíos a todo El Salvador.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-cyan-600 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:bg-cyan-500 transition-colors"
            >
              <Calendar size={20} />
              Agendar cita
            </a>

            <Link
              to="/ofertas"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              <Eye size={20} />
              Ver promociones
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
