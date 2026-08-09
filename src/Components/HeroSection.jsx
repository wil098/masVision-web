import { Calendar, Eye, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="w-full pt-24 pb-12 px-4 bg-gradient-to-b from-white via-white to-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="bg-gradient-to-br from-white via-sky-50 to-blue-100 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">

            {/* TEXTO */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 text-slate-800">
              <div className="inline-flex items-center gap-2 bg-cyan-50 px-4 py-1.5 rounded-full mb-6">
                <Truck size={16} className="text-cyan-600" />
                <p className="text-sm font-medium text-cyan-700">
                  Hacemos envíos a todo El Salvador
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight">
                Tu visión, en
                <span className="block text-slate-500">
                  cualquier parte del país
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                Exámenes visuales profesionales y lentes de alta calidad. Compra en línea de forma segura y recíbelos hasta la puerta de tu casa, sin importar el departamento.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-cyan-600 text-white px-8 py-4 rounded-xl font-medium shadow-md shadow-cyan-100 hover:bg-cyan-700 transition"
                >
                  <Calendar size={20} />
                  Agendar cita
                </a>

                <Link
                  to="/ofertas"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  <Eye size={20} />
                  Ver promociones
                </Link>
              </div>

            </div>

            {/* IMAGEN */}
            <div className="w-full md:w-1/2 h-72 md:h-auto flex items-center justify-center p-6 md:p-10">
              <img
                src={`${import.meta.env.BASE_URL}img/family.png`}
                alt="Familia usando lentes de Óptica Más Visión"
                className="max-w-full max-h-full object-contain"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection