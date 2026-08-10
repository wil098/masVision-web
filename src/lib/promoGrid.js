// Intercala los bloques promocionales dentro de la grilla de productos según
// su "position" (1 = primera celda), empujando el resto hacia la derecha.
export function buildGridItems(productos, promoBlocks) {
  const items = productos.map((p) => ({ type: 'product', key: `p-${p.codigo}`, data: p }))
  const sortedBlocks = [...promoBlocks].sort((a, b) => a.position - b.position)
  for (const block of sortedBlocks) {
    const index = Math.min(Math.max(block.position - 1, 0), items.length)
    items.splice(index, 0, { type: 'promo', key: `promo-${block.id}`, data: block })
  }
  return items
}
