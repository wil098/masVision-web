// Máximo de slides que se muestran a la vez en la portada.
export const HERO_MAX_VISIBLE = 5

function parseHeroSlide(row) {
  if (!row) return null
  return {
    ...row,
    position: Number(row.position),
    mostrar_texto: Boolean(row.mostrar_texto),
    activo: Boolean(row.activo),
  }
}

// Fecha de hoy (YYYY-MM-DD) en El Salvador (UTC-6, sin horario de verano).
function todayInElSalvador() {
  return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// Público: slides activos y vigentes hoy, en orden, hasta HERO_MAX_VISIBLE.
export async function listVisibleHeroSlides(env) {
  const today = todayInElSalvador()
  const { results } = await env.DB.prepare(
    `SELECT * FROM hero_slides
     WHERE activo = 1
       AND (fecha_inicio = '' OR fecha_inicio <= ?)
       AND (fecha_fin = '' OR fecha_fin >= ?)
     ORDER BY position ASC, id ASC
     LIMIT ?`
  )
    .bind(today, today, HERO_MAX_VISIBLE)
    .all()
  return results.map(parseHeroSlide)
}

export async function listAllHeroSlidesForAdmin(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM hero_slides ORDER BY position ASC, id ASC`).all()
  return results.map(parseHeroSlide)
}

export async function countHeroSlides(env) {
  const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM hero_slides`).first()
  return Number(row?.n || 0)
}

function bindValues(s) {
  return [
    s.eyebrow,
    s.title,
    s.subtitle,
    s.image,
    s.image_movil,
    s.boton_texto,
    s.boton_link,
    s.mostrar_texto ? 1 : 0,
    s.enfoque,
    s.position,
    s.activo ? 1 : 0,
    s.fecha_inicio,
    s.fecha_fin,
  ]
}

export async function createHeroSlide(env, slide) {
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    `INSERT INTO hero_slides
       (eyebrow, title, subtitle, image, image_movil, boton_texto, boton_link, mostrar_texto, enfoque,
        position, activo, fecha_inicio, fecha_fin, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(...bindValues(slide), now, now)
    .run()
  return result.meta.last_row_id
}

export async function updateHeroSlide(env, id, slide) {
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    `UPDATE hero_slides SET
       eyebrow = ?, title = ?, subtitle = ?, image = ?, image_movil = ?, boton_texto = ?, boton_link = ?,
       mostrar_texto = ?, enfoque = ?, position = ?, activo = ?, fecha_inicio = ?, fecha_fin = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(...bindValues(slide), now, id)
    .run()
  return result.meta.changes > 0
}

export async function deleteHeroSlide(env, id) {
  const result = await env.DB.prepare(`DELETE FROM hero_slides WHERE id = ?`).bind(id).run()
  return result.meta.changes > 0
}
