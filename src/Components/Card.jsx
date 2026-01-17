export default function Card({ product }) {
  if (!product) return null; // evita error si product es undefined

  const { name, description, price, brand, images } = product
  const whatsappURL = `https://wa.me/50370000000?text=${encodeURIComponent(
    `Hola, estoy interesado en el modelo "${name}" de la marca ${brand}. ¿Está disponible? Precio: $${price}`
  )}`

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden m-4 w-[300px]">
      <div className="relative group w-full h-48 overflow-hidden">
        <img
          src={images?.[0]}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        <img
          src={images?.[1]}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="text-xl font-bold mt-2">${price}</p>
        <a
          href={whatsappURL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  )
}
