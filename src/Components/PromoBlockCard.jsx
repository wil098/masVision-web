export default function PromoBlockCard({ block }) {
  if (!block) return null

  const { title, subtitle, image } = block

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-md w-full max-w-[340px] h-full flex flex-col">
      <div className="h-64 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-center">
        <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  )
}
