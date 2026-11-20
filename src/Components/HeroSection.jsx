import { Calendar, Glasses } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[660px] md:min-h-[760px] overflow-hidden bg-slate-950">
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

      <div className="relative max-w-7xl mx-auto h-full px-4 flex items-center min-h-[660px] md:min-h-[760px]">
        <div className="w-full md:w-1/2 pt-20 md:pt-0 text-white animate-fade-up">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-5">
            <span className="w-8 h-px bg-cyan-300" /> Óptica Más Visión
          </p>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-6">
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
              className="inline-flex items-center justify-center gap-2 bg-cyan-500 text-slate-950 px-8 py-4 rounded-full font-bold shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-colors"
            >
              <Calendar size={20} />
              Agendar cita
            </a>

            <Link
              to="/aros-oftalmicos"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/40 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              <Glasses size={20} />
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
