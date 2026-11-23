// Carritos guardados de clientes con sesión, para recordatorios y para
// recuperar el carrito en otro dispositivo.

export async function getCart(env, userId) {
  const row = await env.DB.prepare(`SELECT items, updated_at FROM carritos WHERE user_id = ?`).bind(userId).first()
  if (!row) return null
  try {
    return { items: JSON.parse(row.items), updated_at: row.updated_at }
  } catch {
    return null
  }
}

// Guarda el carrito. Si cambió el contenido, vuelve a habilitar el
// recordatorio (una vez por versión del carrito). Vacío = se borra.
export async function saveCart(env, userId, items) {
  if (!items.length) {
    await deleteCart(env, userId)
    return
  }
  const json = JSON.stringify(items)
  const total = items.reduce((t, i) => t + i.price * i.quantity, 0)
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO carritos (user_id, items, total, updated_at, recordatorio_enviado_at) VALUES (?, ?, ?, ?, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       recordatorio_enviado_at = CASE WHEN carritos.items = excluded.items THEN carritos.recordatorio_enviado_at ELSE NULL END,
       updated_at = CASE WHEN carritos.items = excluded.items THEN carritos.updated_at ELSE excluded.updated_at END,
       total = excluded.total,
       items = excluded.items`
  )
    .bind(userId, json, total, now)
    .run()
}

export async function deleteCart(env, userId) {
  await env.DB.prepare(`DELETE FROM carritos WHERE user_id = ?`).bind(userId).run()
}

// Carritos que llevan entre 24 h y 7 días sin cambios, sin recordatorio
// enviado, de clientes que no se dieron de baja y que no hicieron un pedido
// después de su último cambio al carrito.
export async function listAbandonedCarts(env, { minHours = 24, maxDays = 7, limit = 50 } = {}) {
  const now = Date.now()
  const desde = new Date(now - maxDays * 86400_000).toISOString()
  const hasta = new Date(now - minHours * 3600_000).toISOString()
  const { results } = await env.DB.prepare(
    `SELECT c.user_id, c.items, c.total, c.updated_at, u.email, u.nombre
     FROM carritos c JOIN users u ON u.id = c.user_id
     WHERE c.recordatorio_enviado_at IS NULL
       AND c.updated_at BETWEEN ? AND ?
       AND u.recordatorio_carrito = 1
       AND u.email IS NOT NULL AND u.email <> ''
       AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = c.user_id AND o.created_at >= c.updated_at)
     ORDER BY c.updated_at ASC
     LIMIT ?`
  )
    .bind(desde, hasta, limit)
    .all()
  return results
}

// Marca el recordatorio como enviado de forma atómica (evita duplicados si
// dos ejecuciones del cron se cruzan).
export async function claimCartReminder(env, userId, updatedAt) {
  const result = await env.DB.prepare(
    `UPDATE carritos SET recordatorio_enviado_at = ? WHERE user_id = ? AND updated_at = ? AND recordatorio_enviado_at IS NULL`
  )
    .bind(new Date().toISOString(), userId, updatedAt)
    .run()
  return result.meta.changes > 0
}

export async function releaseCartReminder(env, userId) {
  await env.DB.prepare(`UPDATE carritos SET recordatorio_enviado_at = NULL WHERE user_id = ?`).bind(userId).run()
}

export async function setCartReminderOptIn(env, userId, enabled) {
  await env.DB.prepare(`UPDATE users SET recordatorio_carrito = ? WHERE id = ?`).bind(enabled ? 1 : 0, userId).run()
}
