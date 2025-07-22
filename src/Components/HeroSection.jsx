const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="w-full  pt-24 pb-16 px-4 md:px-8"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-cyan-100 to-white rounded-3xl shadow-md overflow-hidden flex flex-col md:flex-row items-center">
        {/* Imagen para móvil (solo se muestra en mobile) */}
        <div className="md:hidden w-full">
          <img
            src="src/img/lentes famillia HeroSection.png" // ← cambia por tu ruta de imagen móvil
            alt="Óptica móvil"
            className="w-full h-auto object-cover rounded-t-3xl"
          />
        </div>

        {/* Texto */}
        <div className="w-full md:w-1/2 p-6 md:p-12 text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Cuidamos tu visión<br />
            con tecnología y experiencia
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl mb-8">
            Exámenes de la vista profesionales, lentes de calidad, y atención personalizada para toda tu familia.
          </p>
          <a
            href="https://wa.me/50371497972?text=Hola, quiero agendar una cita en Óptica Más Visión y obtener la promoción web"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold py-3 px-6 rounded-full transition duration-200"
          >
            Agendar Cita por WhatsApp
          </a>
        </div>

        {/* Imagen para desktop */}
        <div className="hidden md:block w-full md:w-1/2 h-full">
          <img
            src="/src/img/lentes famillia HeroSection.png"
            alt="Óptica"
            className="w-full h-full object-cover rounded-r-3xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
