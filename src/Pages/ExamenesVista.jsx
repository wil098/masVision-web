import {
  AlertCircle,
  ArrowRight,
  Baby,
  BookOpen,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  ExternalLink,
  Eye,
  Glasses,
  GraduationCap,
  HeartPulse,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  ScanEye,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from 'lucide-react'

const WHATSAPP = '50371497972'

const SUCURSALES = [
  {
    nombre: 'Casa Matriz',
    ciudad: 'San Vicente',
    direccion: '4 local 3b, 4A Calle Oriente Bis, San Vicente',
    telefono: '2393-0403',
    mapaUrl: 'https://maps.app.goo.gl/inmttgdC75NxPR9k9',
  },
  {
    nombre: 'Sucursal #1',
    ciudad: 'San Vicente',
    direccion: '1 Calle Pte local 12, San Vicente',
    telefono: '2319-2358',
    mapaUrl: 'https://maps.app.goo.gl/bnGn1JNfsRcyNN5S6',
  },
  {
    nombre: 'Sucursal #2',
    ciudad: 'Zacatecoluca',
    direccion: 'Avenida Juan Vicente Villacorta, Local #12',
    telefono: '2334-1463',
    mapaUrl: 'https://maps.app.goo.gl/rv1syUiv2xZfPowC9',
  },
  {
    nombre: 'Sucursal #3',
    ciudad: 'Cojutepeque',
    direccion: 'Av José María Rivas, Cojutepeque',
    telefono: '2397-9044',
    mapaUrl: 'https://maps.app.goo.gl/42YGnDrJoNjqRTq48',
  },
]

const FRECUENCIA = [
  {
    icon: Baby,
    edad: 'Bebés',
    rango: '6 a 12 meses',
    cuando: 'Primer examen',
    detalle: 'Permite descartar a tiempo problemas de alineación o de desarrollo visual.',
  },
  {
    icon: GraduationCap,
    edad: 'Niños',
    rango: '3 a 17 años',
    cuando: 'Cada año',
    detalle: 'Al menos una vez entre los 3 y 5 años, antes de entrar a la escuela y luego anualmente.',
  },
  {
    icon: User,
    edad: 'Adultos',
    rango: '18 a 64 años',
    cuando: 'Cada 1 a 2 años',
    detalle: 'Cada año si usas lentes, pasas muchas horas frente a pantallas o tienes algún factor de riesgo.',
  },
  {
    icon: Users,
    edad: 'Adultos mayores',
    rango: '65 años o más',
    cuando: 'Cada año',
    detalle: 'Con la edad aumenta el riesgo de cataratas, glaucoma y degeneración macular.',
  },
]

const DETECTA = [
  {
    icon: Glasses,
    titulo: 'Miopía, hipermetropía y astigmatismo',
    texto: 'Los errores de refracción más comunes. Corregirlos mejora tu visión, tu rendimiento y reduce dolores de cabeza.',
  },
  {
    icon: BookOpen,
    titulo: 'Presbicia (vista cansada)',
    texto: 'A partir de los 40 años cuesta enfocar de cerca. Unos buenos lentes te devuelven la comodidad para leer.',
  },
  {
    icon: Eye,
    titulo: 'Ojo perezoso y estrabismo',
    texto: 'En los niños, detectarlos a temprana edad es clave: el tratamiento funciona mejor mientras la visión aún se desarrolla.',
  },
  {
    icon: ScanEye,
    titulo: 'Glaucoma',
    texto: 'Conocido como el "ladrón silencioso de la vista": avanza sin síntomas y el daño que causa no se recupera.',
  },
  {
    icon: Droplets,
    titulo: 'Cataratas',
    texto: 'La visión se vuelve opaca o borrosa poco a poco. Detectarlas permite planificar su tratamiento a tiempo.',
  },
  {
    icon: HeartPulse,
    titulo: 'Señales de diabetes e hipertensión',
    texto: 'Los vasos de la retina pueden mostrar los efectos de estas enfermedades, a veces antes de que te des cuenta.',
  },
]

const SENALES = [
  'Ves borroso de lejos o de cerca',
  'Tienes dolores de cabeza frecuentes',
  'Entrecierras los ojos para ver mejor',
  'Sientes ardor, resequedad u ojos cansados',
  'Te cuesta manejar de noche o te molestan las luces',
  'Alejas el celular o el libro para poder leer',
  'Tu hijo se acerca mucho a la pantalla o al cuaderno',
  'Han pasado más de dos años desde tu último examen',
]

const PASOS = [
  {
    icon: MessageCircle,
    titulo: 'Conversamos contigo',
    texto: 'Te preguntamos por tus molestias, tus hábitos y tus antecedentes de salud y familiares.',
  },
  {
    icon: Eye,
    titulo: 'Medimos tu agudeza visual',
    texto: 'Evaluamos qué tan bien ves de lejos y de cerca, con cada ojo por separado.',
  },
  {
    icon: Stethoscope,
    titulo: 'Determinamos tu graduación',
    texto: 'Con equipo especializado encontramos la corrección exacta que necesitan tus ojos.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Revisamos la salud de tus ojos',
    texto: 'Te explicamos los resultados y, si hace falta, te orientamos con el especialista adecuado.',
  },
]

function whatsappUrl(sucursal) {
  const mensaje = `Hola, quiero agendar un examen de la vista en ${sucursal.nombre} (${sucursal.ciudad}).`
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600 mb-2">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{title}</h2>
      {children && <p className="mt-4 text-lg text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

export default function ExamenesVista() {
  return (
    <article className="min-h-screen bg-white">
      {/* Portada */}
      <header className="pt-28 pb-16 px-4 bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 bg-white text-cyan-700 border border-cyan-100 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm mb-6">
              <Eye size={16} />
              Salud visual
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              ¿Cuándo fue tu último examen de la vista?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
              Ver bien no siempre significa que tus ojos estén sanos. Te contamos por qué un examen
              visual periódico es una de las mejores decisiones para tu salud, cada cuánto hacerlo y
              qué puede detectar a tiempo.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} />
                Lectura de 4 minutos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope size={16} />
                Óptica Más Visión
              </span>
            </div>
            <a
              href="#agendar"
              className="inline-flex items-center gap-2 bg-cyan-600 text-white px-7 py-3.5 rounded-full font-semibold shadow-md hover:bg-cyan-500 transition-colors"
            >
              <CalendarCheck size={20} />
              Agendar mi examen
            </a>
          </div>
          <div className="relative">
            <img
              src={`${import.meta.env.BASE_URL}img/exam.jpg`}
              alt="Examen de la vista en Óptica Más Visión"
              className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-72 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
              <p className="text-3xl font-extrabold text-cyan-600">1,000 millones</p>
              <p className="text-sm text-gray-600 mt-1">
                de personas en el mundo viven con un problema visual que pudo prevenirse o que aún no
                se trata.<span className="text-gray-400"> — OMS</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        {/* Por qué es importante */}
        <section className="py-16 max-w-3xl">
          <SectionTitle eyebrow="La importancia" title="Tus ojos pueden necesitar ayuda aunque no lo notes" />
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              Muchos problemas visuales avanzan de forma lenta y silenciosa. El cerebro se acostumbra a
              ver un poco peor, y por eso es común pasar meses —o años— con una graduación desactualizada
              sin darse cuenta.
            </p>
            <p>
              Un examen de la vista no solo sirve para saber si necesitas lentes. También revisa la salud
              de tus ojos y puede revelar condiciones que, detectadas a tiempo, se controlan mucho mejor.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: GraduationCap, texto: 'Los niños aprenden mejor cuando ven bien la pizarra y el cuaderno.' },
              { icon: Car, texto: 'Una buena visión es clave para manejar seguro, sobre todo de noche.' },
              { icon: Monitor, texto: 'Las horas frente a pantallas cansan la vista y causan molestias.' },
            ].map(({ icon: Icon, texto }) => (
              <div key={texto} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <Icon size={24} className="text-cyan-600 mb-3" />
                <p className="text-gray-700 text-sm leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Frecuencia */}
        <section className="py-16 border-t border-gray-100">
          <SectionTitle eyebrow="La frecuencia" title="¿Cada cuánto debo revisarme la vista?">
            Estas son recomendaciones generales. Si tienes diabetes, hipertensión o antecedentes familiares
            de glaucoma, lo ideal es hacerlo cada año o según te indique tu especialista.
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FRECUENCIA.map(({ icon: Icon, edad, rango, cuando, detalle }) => (
              <div
                key={edad}
                className="rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{edad}</h3>
                <p className="text-sm text-gray-500 mb-4">{rango}</p>
                <p className="inline-block bg-cyan-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {cuando}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{detalle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qué detecta */}
        <section className="py-16 border-t border-gray-100">
          <SectionTitle eyebrow="La prevención" title="Lo que un examen ayuda a detectar a tiempo" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DETECTA.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="flex gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-white text-cyan-600 flex items-center justify-center shadow-sm">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{titulo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Señales */}
        <section className="py-16 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2">
              <SectionTitle eyebrow="Atención a las señales" title="¿Te pasa alguna de estas cosas?">
                Si te identificas con una o más, no esperes a tu próximo control: es buen momento para
                revisarte.
              </SectionTitle>
              <img
                src={`${import.meta.env.BASE_URL}img/maquina.jpg`}
                alt="Equipo de optometría"
                className="hidden lg:block w-full aspect-[4/3] object-cover rounded-2xl shadow-lg"
              />
            </div>
            <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SENALES.map((senal) => (
                <li key={senal} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <CheckCircle2 size={20} className="text-cyan-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{senal}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cómo es el examen */}
        <section className="py-16 border-t border-gray-100">
          <SectionTitle eyebrow="Sin complicaciones" title="¿Cómo es el examen?">
            Es rápido, no duele y no necesitas prepararte. Si ya usas lentes, tráelos contigo.
          </SectionTitle>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PASOS.map(({ icon: Icon, titulo, texto }, i) => (
              <li key={titulo} className="relative p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <span className="absolute top-5 right-6 text-5xl font-extrabold text-gray-100 select-none">
                  {i + 1}
                </span>
                <Icon size={26} className="text-cyan-600 mb-4 relative" />
                <h3 className="font-bold text-gray-900 mb-2 relative">{titulo}</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">{texto}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Agendar */}
      <section id="agendar" className="scroll-mt-24 py-20 px-4 bg-gradient-to-br from-cyan-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <CalendarCheck size={40} className="mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Agenda tu examen de la vista</h2>
            <p className="text-lg text-cyan-50">
              Elige la sucursal que te quede más cerca y escríbenos por WhatsApp o llámanos. Te
              atendemos de lunes a viernes de 8:00 AM a 5:00 PM y sábados de 8:00 AM a 12:00 MD.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUCURSALES.map((sucursal) => (
              <div key={sucursal.nombre} className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">{sucursal.ciudad}</p>
                <h3 className="text-xl font-bold mt-1 mb-3">{sucursal.nombre}</h3>
                <p className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={16} className="text-cyan-600 shrink-0 mt-0.5" />
                  {sucursal.direccion}
                </p>
                <a
                  href={`tel:+503${sucursal.telefono.replace('-', '')}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 mb-6"
                >
                  <Phone size={16} className="text-cyan-600 shrink-0" />
                  {sucursal.telefono}
                </a>
                <div className="mt-auto space-y-2">
                  <a
                    href={whatsappUrl(sucursal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-cyan-500 transition-colors"
                  >
                    <CalendarCheck size={18} />
                    Agendar por WhatsApp
                  </a>
                  <a
                    href={sucursal.mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 text-cyan-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-50 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Cómo llegar
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="max-w-3xl mx-auto px-4 py-8 text-xs text-gray-400 flex items-start gap-2">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        La información de este artículo es orientativa y no sustituye la evaluación de un profesional de la
        salud visual.
      </p>
    </article>
  )
}
