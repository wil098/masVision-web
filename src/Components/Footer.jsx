import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100">
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Sobre nosotros */}
          <div>
            <img
              src="./img/logo.png"
              alt="Óptica Más Visión"
              className="h-16 mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Tu salud visual es nuestra prioridad. Más de 10 años cuidando la visión de las familias salvadoreñas.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Contacto</h4>
            <div className="space-y-3 text-sm">
              <a href="tel:+50371497972" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <Phone size={18} className="text-cyan-400" />
                +503 7149-7972
              </a>
              <a href="mailto:contacto@opticamvision.com" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <Mail size={18} className="text-cyan-400" />
                contacto@opticamvision.com
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <Clock size={18} className="text-cyan-400 mt-0.5" />
                <div>
                  <p>Lun - Sáb: 8:00 AM - 6:00 PM</p>
                  <p>Dom: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sucursales */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Sucursales</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <p>Casa Matriz: Parque Infantil, San Vicente</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <p>Sucursal 1: Barrio El Centro, San Vicente</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <p>Sucursal 2: Zacatecoluca</p>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/OpticaMasVisionSv"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 p-3 rounded-full hover:bg-cyan-500 transition-all duration-200 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              
              <a
                href="https://www.instagram.com/opticamasv/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 p-3 rounded-full hover:bg-pink-500 transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
            
            <div className="mt-6">
              <a
                href="https://wa.me/50371497972"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                <Phone size={16} />
                Escríbenos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Óptica Más Visión. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer