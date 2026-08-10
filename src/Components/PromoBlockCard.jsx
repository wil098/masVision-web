export default function PromoBlockCard({ block }) {
  if (!block) return null

  const { title, subtitle, image } = block

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-md w-full max-w-[340px] h-96 flex self-start">
      <div className="w-1/2 p-5 flex flex-col justify-center">
        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">{title}</h3>
        {subtitle && <p className="text-xs text-gray-600 leading-relaxed">{subtitle}</p>}
      </div>
      <div className="w-1/2 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
