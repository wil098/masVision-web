import { Calendar, Eye, Shield, Star } from 'lucide-react'
import { Link } from 'react-router-dom'  // ← Agrega este import

const HeroSection = () => {
  return (
    <section className="w-full pt-24 pb-12 px-4 bg-gradient-to-b from-white via-white to-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="bg-gradient-to-br from-white via-sky-50 to-blue-100 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row items-center">

            {/* TEXTO */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 text-slate-800">
              <div className="inline-block bg-slate-100 px-4 py-1 rounded-full mb-6">
                <p className="text-sm font-medium text-slate-600">
                  Promoción especial Back to School
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight">
                Que nada detenga
                <span className="block text-slate-500">
                  Tu aprendizaje
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                Exámenes visuales profesionales y lentes de alta calidad, con aros infantiles seguros y resistentes para acompañarlos en cada etapa escolar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
  <a
    href="https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión y obtener la promoción web"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-medium shadow-md hover:bg-blue-700 transition"
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
            <div className="w-full md:w-1/2 h-72 md:h-auto">
              <img
                src={`${import.meta.env.BASE_URL}img/backto.png`}
                alt="Óptica Más Visión - back to school"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-blue-600" size={26} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">
              Garantía de calidad
            </h3>
            <p className="text-slate-600 text-sm">
              Productos certificados y respaldados
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
            <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-green-600" size={26} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">
              Atención personalizada
            </h3>
            <p className="text-slate-600 text-sm">
              Especialistas a tu servicio
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
            <div className="bg-purple-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="text-purple-600" size={26} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">
              Exámenes profesionales
            </h3>
            <p className="text-slate-600 text-sm">
              Tecnología moderna y precisa
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection
