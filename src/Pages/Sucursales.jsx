import { Calendar, Clock, MapPin, Phone, ExternalLink, Sparkles } from 'lucide-react'

export default function Ubicaciones() {
  const sucursales = [
    {
      id: 1,
      nombre: "Casa Matriz",
      ciudad: "San Vicente",
      direccion: "4 local 3b, 4A Calle Oriente Bis, San Vicente",
      telefono: "+503 7149-7972",
      mapaUrl: "https://maps.app.goo.gl/inmttgdC75NxPR9k9",
      imagen: "public/img/cas matriz optica.jpg", // Imagen profesional de tienda/óptica
      tipo: "Sede Central",
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: 2,
      nombre: "Sucursal San Vicente",
      ciudad: "San Vicente",
      direccion: "1 Calle Pte local 12, San Vicente",
      telefono: "+503 7149-7972",
      mapaUrl: "https://maps.app.goo.gl/bnGn1JNfsRcyNN5S6",
      imagen: "public/img/sucursal 1.png",
      tipo: "Sucursal 1",
      color: "from-orange-500 to-red-600"
    },
    {
      id: 3,
      nombre: "Sucursal Zacatecoluca",
      ciudad: "Zacatecoluca",
      direccion: "Avenida Juan Vicente Villacorta, Local #12",
      telefono: "+503 7149-7972",
      mapaUrl: "https://maps.app.goo.gl/rv1syUiv2xZfPowC9 ",
      imagen: "public/img/sucursal 2.png",
      tipo: "Sucursal 2",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 4,
      nombre: "Sucursal Cojutepeque",
      ciudad: "Cojutepeque",
      direccion: "Av José María Rivas, Cojutepeque",
      telefono: "+503 7149-7972",
      mapaUrl: "https://maps.app.goo.gl/42YGnDrJoNjqRTq48",
      imagen: "public/img/sucursal 4.png",
      tipo: "Sucursal 3",
      color: "from-purple-500 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full mb-6">
            <Sparkles size={20} />
            <span className="font-bold">Nuestras Ópticas</span>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Ubicaciones y Horarios
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visítanos en cualquiera de nuestras sucursales y recibe la atención profesional que tus ojos merecen
          </p>
        </div>

        {/* Grid de Sucursales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Imagen */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={sucursal.imagen}
                    alt={sucursal.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badge Ciudad */}
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${sucursal.color} text-white px-5 py-2 rounded-full shadow-xl`}>
                    <span className="text-sm font-extrabold">{sucursal.ciudad}</span>
                  </div>

                  {/* Tipo / Tag */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <span className="text-xs font-bold text-gray-700">{sucursal.tipo}</span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors flex items-center gap-2">
                    <MapPin className="text-cyan-600 shrink-0" size={24} />
                    {sucursal.nombre}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {sucursal.direccion}
                  </p>

                  {/* Horarios Integrados en la Tarjeta */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 border border-gray-100">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <Clock size={18} className="text-cyan-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-950">Horarios de Atención:</p>
                        <p>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
                        <p>Sábados: 8:00 AM - 12:00 MD</p>
                        <p className="text-xs text-red-500 font-medium mt-1">Domingos: Cerrado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de acción fijo abajo */}
              <div className="px-6 pb-6 mt-auto">
                <a
                  href={sucursal.mapaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <ExternalLink size={20} />
                  Ver en Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
        {/* ================= SECCIÓN DE FOTOS / GALERÍA ================= */}
<div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
  {/* Encabezado de la Galería */}
  <div className="mb-10 text-center md:text-left">
    <h3 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-2">
      <span className="text-cyan-600">📷</span> Conoce Nuestras Instalaciones
    </h3>
    <p className="text-gray-600 max-w-xl">
      Equipos con tecnología de vanguardia y espacios cómodos diseñados para brindarte la mejor experiencia visual.
    </p>
  </div>

  {/* Grid Asimétrico de Fotos */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    
    {/* Foto 1: Fachada / Recepción (Ocupa más espacio en pantallas grandes) */}
    <div className="relative md:col-span-2 md:row-span-2 h-72 md:h-auto min-h-[300px] rounded-2xl overflow-hidden group shadow-md">
      <img 
        src="public/img/abel.jpeg" 
        alt="Clínica y Recepción" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <p className="text-white font-bold text-lg">Área de Recepción y Exhibición</p>
      </div>
      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-700 shadow-sm">Moderna & Confortable</span>
    </div>

    {/* Foto 2: Laboratorio / Tecnología */}
    <div className="relative h-60 rounded-2xl overflow-hidden group shadow-md">
      <img 
        src="public/img/maquina.jpg" 
        alt="Equipos Tecnológicos" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white font-bold text-sm">Tecnología de Alta Precisión</p>
      </div>
      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-700 shadow-sm">Laboratorio</span>
    </div>

    {/* Foto 3: Variedad de Aros */}
    <div className="relative h-60 rounded-2xl overflow-hidden group shadow-md">
      <img 
        src="public/img/aro gildi.jpg" 
        alt="Variedad de Aros" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white font-bold text-sm">Más de 500 Diseños Exclusivos</p>
      </div>
      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-700 shadow-sm">Tendencias</span>
    </div>

    {/* Foto 4: Consultorio del Examen */}
    <div className="relative h-60 rounded-2xl overflow-hidden group shadow-md">
      <img 
        src="public/img/exam.jpg" 
        alt="Consultorio de Optometría" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white font-bold text-sm">Consultorio Clínico Profesional</p>
      </div>
      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-700 shadow-sm">Examen Clínico</span>
    </div>

    {/* Foto 5: Lentes de Sol */}
    <div className="relative h-60 rounded-2xl overflow-hidden group shadow-md">
      <img 
        src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80" 
        alt="Colección de Sol" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white font-bold text-sm">Marcas Premium de Sol</p>
      </div>
      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-700 shadow-sm">Protección UV</span>
    </div>

  </div>
</div>

{/* ================= SECCIÓN INFORMATIVA DE SUCURSALES ================= */}
<div className="mt-20 space-y-16">
  
  {/* Bloque 1: Beneficios y Facilidades en nuestras instalaciones */}
  <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
        Pensado para tu Comodidad y Confianza
      </h3>
      <p className="text-gray-600">
        No importa cuál sucursal elijas visitar, en todas garantizamos el mismo estándar de excelencia, comodidad y tecnología para el cuidado de tus ojos.
      </p>
    </div>

    {/* Grid de Características / Comodidades */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {/* Facilidad 1 */}
      <div className="flex flex-col items-center text-center p-4 group">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-md">
          <span className="text-2xl font-bold">🚗</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Parqueo Seguro</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          Todas nuestras sucursales cuentan con estacionamiento vigilado o zonas seguras de aparcamiento totalmente gratis para nuestros clientes.
        </p>
      </div>

      {/* Facilidad 2 */}
      <div className="flex flex-col items-center text-center p-4 group">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-md">
          <span className="text-2xl font-bold">💳</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Métodos de Pago</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          Aceptamos efectivo, transferencias bancarias, enlaces de pago y todas las tarjetas de crédito o débito (tasa 0 disponible en sucursales participantes).
        </p>
      </div>

      {/* Facilidad 3 */}
      <div className="flex flex-col items-center text-center p-4 group">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-md">
          <span className="text-2xl font-bold">🔬</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Laboratorio Propio</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          Contamos con equipo digital avanzado para el biselado y montaje de tus lentes, reduciendo el tiempo de entrega al mínimo.
        </p>
      </div>
    </div>
  </div>

  {/* Bloque 2: Preguntas Frecuentes Relacionadas con las Visitas */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
    {/* Título lateral */}
    <div className="md:col-span-1 space-y-3 sticky top-28">
      <div className="inline-flex items-center gap-1.5 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-bold">
        <span>💡</span> Información Útil
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900 leading-tight">
        ¿Tienes dudas sobre cómo visitarnos?
      </h3>
      <p className="text-gray-600 text-sm">
        Aquí resolvemos las preguntas más comunes de nuestros pacientes antes de asistir a nuestras ópticas.
      </p>
    </div>

    {/* Lista de Preguntas */}
    <div className="md:col-span-2 space-y-4">
      {/* Pregunta 1 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-cyan-200 transition-colors">
        <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-start gap-2">
          <span className="text-cyan-500 mt-1 shrink-0">❖</span>
          ¿Es necesario programar una cita para el examen visual?
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed pl-6">
          No es estrictamente necesario, atendemos por orden de llegada. Sin embargo, te recomendamos agendar tu cita previamente vía WhatsApp para asegurarte un espacio sin tiempos de espera, especialmente los días sábados.
        </p>
      </div>

      {/* Pregunta 2 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-cyan-200 transition-colors">
        <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-start gap-2">
          <span className="text-cyan-500 mt-1 shrink-0">❖</span>
          ¿Cuánto tiempo tardan en entregar mis lentes nuevos?
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed pl-6">
          Para graduaciones sencillas o antirreflejantes estándar, podemos tener tus lentes listos el mismo día gracias a nuestro laboratorio express. Para lentes más especializados (como progresivos o policarbonato con tratamientos avanzados), el tiempo estimado es de 3 a 5 días hábiles.
        </p>
      </div>

      {/* Pregunta 3 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-cyan-200 transition-colors">
        <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-start gap-2">
          <span className="text-cyan-500 mt-1 shrink-0">❖</span>
          ¿Puedo llevar mi propio aro y solo comprar los lentes graduados?
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed pl-6">
          ¡Por supuesto! Trae tu aro favorito a cualquiera de nuestras sucursales. Nuestros técnicos evaluarán el material y estado del aro para garantizar que soporte el montaje de las nuevas lunas de forma segura.
        </p>
      </div>
    </div>
  </div>

</div>
{/* ====================================================================== */}
{/* ============================================================= */}

        {/* CTA inferior */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
          <Phone size={48} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Tienes dudas de cómo llegar?
          </h2>
          <p className="text-xl text-cyan-50 mb-8 max-w-2xl mx-auto">
            Comunícate directamente con nuestro equipo de soporte central para agendar tu cita en tu sucursal más cercana.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/50371497972?text=Hola, necesito ayuda para ubicar una sucursal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Calendar size={22} />
              Agendar Cita por WhatsApp
            </a>

            
          </div>
        </div>

      </div>
    </div>
  )
}