// El Worker rechaza cantidades mayores a 50 por línea.
export const MAX_QTY = 50

// Una línea por combinación producto + color + medida + opciones de lente:
// el mismo aro en dos colores son dos líneas distintas.
export function lineIdOf(line) {
  const lens = (line.lensOptions || []).map((o) => o.id).sort().join(',')
  return [line.codigo, line.color?.nombre || '', line.medida || '', lens].join('|')
}

export function lineUnitPrice(line) {
  return line.price + (line.lensOptions || []).reduce((s, o) => s + (o.precio || 0), 0)
}
