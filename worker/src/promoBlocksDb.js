function parsePromoBlock(row) {
  if (!row) return null
  return { ...row, position: Number(row.position) }
}

// Público: los bloques de una página, ordenados por posición.
export async function listPromoBlocks(env, { pagina } = {}) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM promo_blocks WHERE pagina = ? ORDER BY position ASC`
  )
    .bind(pagina)
    .all()
  return results.map(parsePromoBlock)
}

export async function listAllPromoBlocksForAdmin(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM promo_blocks ORDER BY pagina, position ASC`).all()
  return results.map(parsePromoBlock)
}

export async function getPromoBlock(env, id) {
  const row = await env.DB.prepare(`SELECT * FROM promo_blocks WHERE id = ?`).bind(id).first()
  return parsePromoBlock(row)
}

export async function createPromoBlock(env, block) {
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    `INSERT INTO promo_blocks (pagina, title, subtitle, image, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(block.pagina, block.title, block.subtitle || '', block.image, block.position, now, now)
    .run()
  return result.meta.last_row_id
}

export async function updatePromoBlock(env, id, block) {
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    `UPDATE promo_blocks SET pagina = ?, title = ?, subtitle = ?, image = ?, position = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(block.pagina, block.title, block.subtitle || '', block.image, block.position, now, id)
    .run()
  return result.meta.changes > 0
}

export async function deletePromoBlock(env, id) {
  const result = await env.DB.prepare(`DELETE FROM promo_blocks WHERE id = ?`).bind(id).run()
  return result.meta.changes > 0
}
