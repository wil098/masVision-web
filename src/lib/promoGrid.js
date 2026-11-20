const norm = (s) => (s || '').toString().trim().toLowerCase()

// Arma la grilla del catálogo intercalando los bloques promocionales.
//
// - Bloques con "coleccion": encabezan su colección. Los aros de esa
//   colección se muestran justo después del bloque, y "position" define el
//   orden de las colecciones (1 = primera). Los aros sin bloque de colección
//   van al final, en su orden original.
// - Bloques sin "coleccion" (comportamiento anterior): se insertan en la
//   celda "position" de la grilla ya armada (1 = primera celda).
export function buildGridItems(productos, promoBlocks) {
  const sorted = [...promoBlocks].sort((a, b) => a.position - b.position)
  const porColeccion = sorted.filter((b) => norm(b.coleccion))
  const sueltos = sorted.filter((b) => !norm(b.coleccion))

  const items = []
  const usados = new Set()
  for (const block of porColeccion) {
    const delGrupo = productos.filter((p) => !usados.has(p.codigo) && norm(p.coleccion) === norm(block.coleccion))
    if (delGrupo.length === 0) continue
    items.push({ type: 'promo', key: `promo-${block.id}`, data: block })
    for (const p of delGrupo) {
      usados.add(p.codigo)
      items.push({ type: 'product', key: `p-${p.codigo}`, data: p })
    }
  }
  for (const p of productos) {
    if (!usados.has(p.codigo)) items.push({ type: 'product', key: `p-${p.codigo}`, data: p })
  }

  for (const block of sueltos) {
    const index = Math.min(Math.max(block.position - 1, 0), items.length)
    items.splice(index, 0, { type: 'promo', key: `promo-${block.id}`, data: block })
  }
  return items
}
