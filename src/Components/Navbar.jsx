import { useState } from "react"
import { Link } from "react-router-dom"
import { Glasses, Home, MapPin, Menu, Percent, Sun, X, Phone, ShoppingCart, User, LogOut, Settings } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import CartSidebar from "./CartSidebar.jsx"

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false) // Estado para abrir/cerrar la barra lateral
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { cartCount } = useCart()
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth()

  const navLinks = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/aros-de-sol", icon: Sun, label: "Lentes de Sol" },
    { to: "/aros-oftalmicos", icon: Glasses, label: "Aros" },
    { to: "/sucursales", icon: MapPin, label: "Sucursales" },
    { to: "/ofertas", icon: Percent, label: "Ofertas" },
  ]

  return (
    <>
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

            {/* Navegación de Escritorio */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 font-medium hover:text-cyan-600 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Botón de Carrito (Escritorio) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-xl transition-all"
                aria-label="Abrir carrito"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              <a
                href="https://wa.me/50371497972"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors shadow-md shadow-cyan-100"
              >
                <Phone size={18} />
                Contáctanos
              </a>

              {/* Cuenta */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center">
                        <User size={18} className="text-cyan-600" />
                      </div>
                    )}
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <p className="px-4 py-2 text-sm font-semibold text-gray-800 truncate border-b border-gray-100">
                        {user.displayName}
                      </p>
                      <Link
                        to="/mi-cuenta"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={16} /> Mi cuenta
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings size={16} /> Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut size={16} /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  <User size={18} />
                  Iniciar sesión
                </button>
              )}
            </div>

            {/* Controles Móviles (Carrito + Hamburguesa) */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Botón de Carrito (Móvil) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-700"
                aria-label="Abrir carrito móvil"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setOpen(!open)}
                className="p-2 text-gray-700"
                aria-label="Toggle menu"
              >
                {open ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {open && (
          <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-cyan-50 font-medium transition-colors"
                  >
                    <Icon size={20} className="text-gray-500" />
                    {link.label}
                  </Link>
                )
              })}

              <a
                href="https://wa.me/50371497972"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold mt-4 shadow-md shadow-cyan-100"
              >
                <Phone size={18} />
                Contáctanos
              </a>

              {user ? (
                <>
                  <Link
                    to="/mi-cuenta"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-cyan-50 font-medium transition-colors"
                  >
                    <User size={20} className="text-gray-500" />
                    Mi cuenta
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-cyan-50 font-medium transition-colors"
                    >
                      <Settings size={20} className="text-gray-500" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-cyan-50 font-medium transition-colors"
                  >
                    <LogOut size={20} className="text-gray-500" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false)
                    signInWithGoogle()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-cyan-50 font-medium transition-colors"
                >
                  <User size={20} className="text-gray-500" />
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Barra Lateral del Carrito */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar