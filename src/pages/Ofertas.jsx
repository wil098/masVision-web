import { Calendar, Tag, Percent, Clock, Gift, Sparkles } from 'lucide-react'

export default function Ofertas() {
  const ofertas = [
    {
      id: 1,
      titulo: "2x1 en Lentes de Sol",
      descripcion: "Compra un par de lentes de sol y lleva el segundo con 50% de descuento",
      descuento: "50%",
      vigencia: "Válido hasta el 28 de Febrero 2025",
      imagen: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      tipo: "Promo Especial",
      color: "from-orange-500 to-red-600"
    },
    {
      id: 2,
      titulo: "Examen Visual Gratis",
      descripcion: "Examen de la vista completamente gratis con la compra de cualquier aro oftálmico",
      descuento: "Gratis",
      vigencia: "Válido hasta el 31 de Marzo 2025",
      imagen: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
      tipo: "Promoción Web",
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: 3,
      titulo: "Descuento Familiar",
      descripcion: "15% de descuento en la compra de 3 o más aros para toda la familia",
      descuento: "15%",
      vigencia: "Promoción permanente",
      imagen: "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=800&q=80",
      tipo: "Oferta Familiar",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 4,
      titulo: "Paquete Completo",
      descripcion: "Aro + Lentes + Estuche protector por un precio especial",
      descuento: "25%",
      vigencia: "Válido hasta el 15 de Febrero 2025",
      imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      tipo: "Pack Ahorro",
      color: "from-purple-500 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full mb-6">
            <Sparkles size={20} />
            <span className="font-bold">¡Ofertas Especiales!</span>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Promociones del Mes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aprovecha nuestras ofertas exclusivas y lleva la mejor calidad al mejor precio
          </p>
        </div>

        {/* Grid de Ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {ofertas.map((oferta) => (
            <div
              key={oferta.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Imagen */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={oferta.imagen}
                  alt={oferta.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badge descuento */}
                <div className={`absolute top-4 right-4 bg-gradient-to-r ${oferta.color} text-white px-6 py-3 rounded-full shadow-xl`}>
                  <span className="text-2xl font-extrabold">{oferta.descuento}</span>
                  {oferta.descuento !== "Gratis" && <span className="text-sm"> OFF</span>}
                </div>

                {/* Tipo */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <span className="text-xs font-bold text-gray-700">{oferta.tipo}</span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                  {oferta.titulo}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {oferta.descripcion}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <Clock size={16} className="text-cyan-600" />
                  <span>{oferta.vigencia}</span>
                </div>

                <a
                  href={`https://wa.me/50371497972?text=Hola, quiero más información sobre la oferta: ${oferta.titulo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <Gift size={20} />
                  Quiero esta oferta
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA inferior */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
          <Tag size={48} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Quieres estar al tanto de nuevas ofertas?
          </h2>
          <p className="text-xl text-cyan-50 mb-8 max-w-2xl mx-auto">
            Contáctanos por WhatsApp y recibe notificaciones de nuestras promociones exclusivas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/50371497972?text=Hola, quiero recibir notificaciones de ofertas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Calendar size={22} />
              Suscribirme a Ofertas
            </a>

            <a
              href="tel:+50371497972"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              Llamar Ahora
            </a>
          </div>
        </div>

        {/* Términos */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Percent size={20} className="text-cyan-600" />
            Términos y Condiciones
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Las ofertas no son acumulables con otras promociones</li>
            <li>• Válido únicamente en sucursales participantes</li>
            <li>• Sujeto a disponibilidad de stock</li>
            <li>• Presenta este cupón digital para hacer válida la promoción</li>
            <li>• Las fechas de vigencia pueden variar sin previo aviso</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
