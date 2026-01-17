import { useState } from "react"
import { Link } from "react-router-dom"
import { Glasses, Home, MapPin, Menu, Percent, Sun, X, Phone } from "lucide-react"

const Navbar = () => {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/aros-de-sol", icon: Sun, label: "Lentes de Sol" },
    { to: "/aros-oftalmicos", icon: Glasses, label: "Aros" },
    { to: "/sucursales", icon: MapPin, label: "Sucursales" },
    { to: "/ofertas", icon: Percent, label: "Ofertas" },
  ]

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" onClick={() => setOpen(false)}>
            <img
              src={`${import.meta.env.BASE_URL}img/logo-mas-vision.png`}
              alt="Óptica Más Visión"
              className="h-16 w-auto object-contain"
            />

          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 font-medium hover:text-cyan-600"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <a
              href="https://wa.me/50371497972"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              <Phone size={18} />
              Contáctanos
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-cyan-50"
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              )
            })}

            <a
              href="https://wa.me/50371497972"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold mt-4"
            >
              <Phone size={18} />
              Contáctanos
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
