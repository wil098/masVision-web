// Productos antiguos guardan cada color como texto plano (ej. "C1"); los
// nuevos llevan { nombre, hex, images } para poder mostrar el color real.
export function getColorNombre(color) {
  return typeof color === 'string' ? color : color?.nombre
}

export function getColorHex(color) {
  return typeof color === 'string' ? null : color?.hex || null
}

export function getColorImages(color) {
  return typeof color === 'string' ? [] : color?.images || []
}

export function formatMedida(medida) {
  if (!medida) return ''
  return [medida.calibre, medida.puente, medida.varilla].filter(Boolean).join(' / ')
}

export function cleanBrand(brand) {
  return (brand || '').replace(/\.$/, '')
}

// ¿Hace falta que el cliente elija algo antes de agregar al carrito?
export function needsVariantChoice(product) {
  return (product?.colores_disponibles?.length || 0) > 1 || (product?.medidas_disponibles?.length || 0) > 1
}

// Arma la línea de carrito a partir del producto y la variante elegida.
// Por defecto toma el primer color/medida (caso de productos con una sola
// opción, que se agregan directo sin preguntar).
export function buildCartLine(product, { color, medida, lensOptions = [], quantity = 1 } = {}) {
  const colorObj = color ?? product.colores_disponibles?.[0] ?? null
  const medidaObj = medida ?? product.medidas_disponibles?.[0] ?? null
  const colorImages = getColorImages(colorObj)
  return {
    codigo: product.codigo,
    name: product.name,
    brand: cleanBrand(product.brand),
    categoria: product.categoria,
    price: Number(product.price),
    image: colorImages[0] || product.images?.[0] || null,
    color: colorObj ? { nombre: getColorNombre(colorObj), hex: getColorHex(colorObj) } : null,
    medida: formatMedida(medidaObj),
    lensOptions: lensOptions.map((o) => ({ id: o.id, nombre: o.nombre, precio: Number(o.precio_adicional ?? o.precio ?? 0) })),
    quantity,
  }
}
