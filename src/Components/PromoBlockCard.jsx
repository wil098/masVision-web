export default function PromoBlockCard({ block }) {
  if (!block) return null

  const { title, subtitle, image } = block

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-3xl overflow-hidden bg-gray-900">
      <img src={image} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
        <h3 className="text-xl sm:text-2xl font-extrabold leading-tight mb-1">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  )
}
