import React from "react";
import { Phone, Mail, MapPin, Instagram, Facebook, FacebookIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-700 py-10 text-sm text-gray-100 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contacto */}
        <div>
          <h4 className="text-gray-100 font-bold mb-2">Contacto</h4>
          <p className="flex items-center gap-2">
            <Phone size={16} /> +503 7149-7972
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} /> contacto@opticamvision.com
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={16} />Casa Matriz parque infantil, San Vicente, El Salvador
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={16} /> Sucursal 1, Barrio El Centro, San Vicente, El Salvador
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={16} /> Sucursal 2, Zacatecoluca, El Salvador
          </p>
        </div>

        {/* Información */}
        <div>
          <h4 className="text-gray-100 font-bold mb-2">Información</h4>
          <ul className="space-y-1">
            <li>Sobre nosotros</li>
            <li>Servicios</li>
            <li>Preguntas frecuentes</li>
            <li>Próximamente: Blog</li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h4 className="text-gray-100 font-bold mb-2">Síguenos</h4>
          <ul className="space-y-1">
            <li>
              <a href="https://www.facebook.com/OpticaMasVisionSv" className="hover:underline inline-flex gap-2"> <FacebookIcon size={16}/> Facebook</a>
              
            </li>
            <li>
              <a href="https://www.instagram.com/opticamasv/" className="hover:underline inline-flex gap-2"><Instagram size={16} /> Instagram </a>
            </li>
        
          </ul>
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-gray-500">
        © {new Date().getFullYear()} Óptica Más Visión. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
