function parseLensOption(row) {
  if (!row) return null
  return {
    ...row,
    precio_adicional: row.precio_adicional === null ? null : Number(row.precio_adicional),
    disponible: Boolean(row.disponible),
  }
}

// Público: solo lo que el cliente puede ver y elegir. Exige precio definido
// además de disponible = 1, para que activar el switch sin haber puesto el
// precio no llegue a filtrarse al catálogo.
export async function listLensOptions(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM lens_options WHERE disponible = 1 AND precio_adicional IS NOT NULL ORDER BY categoria, nombre`
  ).all()
  return results.map(parseLensOption)
}

export async function listAllLensOptionsForAdmin(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM lens_options ORDER BY categoria, nombre`).all()
  return results.map(parseLensOption)
}

export async function getLensOption(env, id) {
  const row = await env.DB.prepare(`SELECT * FROM lens_options WHERE id = ?`).bind(id).first()
  return parseLensOption(row)
}

export async function createLensOption(env, option) {
  const now = new Date().toISOString()
  const precio = option.precio_adicional === '' || option.precio_adicional == null ? null : Number(option.precio_adicional)
  const result = await env.DB.prepare(
    `INSERT INTO lens_options (categoria, nombre, precio_adicional, disponible, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(option.categoria, option.nombre, precio, option.disponible ? 1 : 0, now, now)
    .run()
  return result.meta.last_row_id
}

export async function updateLensOption(env, id, option) {
  const now = new Date().toISOString()
  const precio = option.precio_adicional === '' || option.precio_adicional == null ? null : Number(option.precio_adicional)
  const result = await env.DB.prepare(
    `UPDATE lens_options SET categoria = ?, nombre = ?, precio_adicional = ?, disponible = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(option.categoria, option.nombre, precio, option.disponible ? 1 : 0, now, id)
    .run()
  return result.meta.changes > 0
}

export async function deleteLensOption(env, id) {
  const result = await env.DB.prepare(`DELETE FROM lens_options WHERE id = ?`).bind(id).run()
  return result.meta.changes > 0
}
