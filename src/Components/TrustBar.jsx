import { Truck, Eye, MapPin, ShieldCheck } from 'lucide-react'

const ITEMS = [
  { icon: Truck, title: 'Envíos a todo El Salvador', text: 'Recibe tus lentes en casa' },
  { icon: Eye, title: 'Exámenes de la vista', text: 'Optometristas profesionales' },
  { icon: MapPin, title: '4 sucursales', text: 'San Vicente, Zacatecoluca y Cojutepeque' },
  { icon: ShieldCheck, title: 'Pago seguro', text: 'Paga en línea con total confianza' },
]

export default function TrustBar() {
  return (
    <section className="relative z-10 px-4 -mt-12 sm:-mt-14">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/70 border border-gray-100">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
