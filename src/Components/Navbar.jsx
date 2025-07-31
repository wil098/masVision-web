import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GlassesIcon, Home, MapIcon, Menu, Percent, Sun, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="./img/logo.png"
            alt="Óptica Más Visión"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link to="/" className="hover:text-cyan-600 gap-2 inline-flex">
            <Home /> Inicio
          </Link>
          <Link to="/aros-de-sol" className="hover:text-cyan-600 gap-2 inline-flex">
            <Sun /> Lentes de sol
          </Link>
          <Link to="/aros-oftalmicos" className="hover:text-cyan-600 gap-2 inline-flex">
            <GlassesIcon /> Aros
          </Link>
          <Link to="/sucursales" className="hover:text-cyan-600 inline-flex gap-2">
            <MapIcon /> Sucursales
          </Link>
          <Link to="/ofertas" className="hover:text-cyan-600 gap-2 inline-flex">
            <Percent /> Ofertas
          </Link>
        </div>

        {/* Call to action */}
        <a
          href="https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-block bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 text-sm"
        >
          ¡Contactáctanos!
        </a>

        {/* Mobile menu button */}
        <button onClick={toggleMenu} className="md:hidden">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white shadow-md px-4 pb-4 space-y-2 text-gray-700 font-medium flex flex-col">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-cyan-600 gap-2 inline-flex">
            <Home /> Inicio
          </Link>
          <Link
            to="/aros-de-sol"
            onClick={() => setOpen(false)}
            className="hover:text-cyan-600 gap-2 inline-flex"
          >
            <Sun /> Lentes de sol
          </Link>
          <Link
            to="/aros-oftalmicos"
            onClick={() => setOpen(false)}
            className="hover:text-cyan-600 gap-2 inline-flex"
          >
            <GlassesIcon /> Aros
          </Link>
          <Link
            to="/sucursales"
            onClick={() => setOpen(false)}
            className="hover:text-cyan-600 gap-2 inline-flex"
          >
            <MapIcon /> Sucursales
          </Link>
          <Link
            to="/ofertas"
            onClick={() => setOpen(false)}
            className="hover:text-cyan-600 gap-2 inline-flex"
          >
            <Percent /> Ofertas
          </Link>
          <a
            href="https://wa.me/50371234567?text=Hola, quiero agendar una cita en Óptica Más Visión"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-cyan-600 text-white text-center px-4 py-2 rounded-full hover:bg-cyan-700 text-sm mt-2"
          >
            Agendar Cita
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
