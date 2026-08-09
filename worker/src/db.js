export async function upsertUser(env, { uid, email, name }) {
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO users (id, email, nombre, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET email = excluded.email, nombre = excluded.nombre, updated_at = excluded.updated_at`
  )
    .bind(uid, email, name || null, now, now)
    .run()
}

export async function listAddresses(env, userId) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM addresses WHERE user_id = ? ORDER BY es_predeterminada DESC, created_at DESC`
  )
    .bind(userId)
    .all()
  return results
}

export async function getAddress(env, addressId, userId) {
  return env.DB.prepare(`SELECT * FROM addresses WHERE id = ? AND user_id = ?`).bind(addressId, userId).first()
}

export async function createAddress(env, userId, address) {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO addresses (
      id, user_id, etiqueta, departamento, municipio, direccion, referencia, es_predeterminada, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      userId,
      address.etiqueta || null,
      address.departamento,
      address.municipio,
      address.direccion,
      address.referencia || null,
      address.esPredeterminada ? 1 : 0,
      now
    )
    .run()
  return id
}

export async function deleteAddress(env, addressId, userId) {
  const result = await env.DB.prepare(`DELETE FROM addresses WHERE id = ? AND user_id = ?`)
    .bind(addressId, userId)
    .run()
  return result.meta.changes > 0
}

export async function listOrdersByUser(env, userId) {
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, status, asunto, resumen, total, departamento, municipio, direccion, referencia,
            tracking_number, tracking_url, courier_name
     FROM orders WHERE user_id = ? ORDER BY created_at DESC`
  )
    .bind(userId)
    .all()
  return results
}

export async function insertPendingOrder(env, order) {
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO orders (
      id, created_at, updated_at, status, asunto, resumen, total,
      nombre_cliente, telefono, correo_cliente, departamento, municipio,
      direccion, referencia, tiene_receta, user_id
    ) VALUES (?, ?, ?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      order.id,
      now,
      now,
      order.asunto,
      order.resumen,
      order.total,
      order.nombreCliente,
      order.telefono,
      order.correoCliente,
      order.departamento,
      order.municipio,
      order.direccion,
      order.referencia || null,
      order.tieneReceta ? 1 : 0,
      order.userId
    )
    .run()
}

export async function markOrderStatus(env, orderId, status, wompiTransaccionId = null) {
  const now = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE orders SET status = ?, updated_at = ?, wompi_transaccion_id = COALESCE(?, wompi_transaccion_id) WHERE id = ?`
  )
    .bind(status, now, wompiTransaccionId, orderId)
    .run()
}

export async function markVendorEmailSent(env, orderId) {
  await env.DB.prepare(`UPDATE orders SET email_vendedor_enviado = 1, updated_at = ? WHERE id = ?`)
    .bind(new Date().toISOString(), orderId)
    .run()
}

export async function markCustomerEmailSent(env, orderId) {
  await env.DB.prepare(`UPDATE orders SET email_cliente_enviado = 1, updated_at = ? WHERE id = ?`)
    .bind(new Date().toISOString(), orderId)
    .run()
}

export async function listAllOrders(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`).all()
  return results
}

export async function updateOrderTracking(env, orderId, { courierName, trackingNumber, trackingUrl, status } = {}) {
  const now = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE orders SET
      courier_name = COALESCE(?, courier_name),
      tracking_number = COALESCE(?, tracking_number),
      tracking_url = COALESCE(?, tracking_url),
      status = COALESCE(?, status),
      updated_at = ?
     WHERE id = ?`
  )
    .bind(courierName || null, trackingNumber || null, trackingUrl || null, status || null, now, orderId)
    .run()
}

export async function listCustomers(env) {
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.email, u.nombre, u.created_at, u.is_admin,
            COUNT(o.id) as total_pedidos,
            COALESCE(SUM(CASE WHEN o.status = 'pagado' THEN o.total ELSE 0 END), 0) as total_gastado
     FROM users u LEFT JOIN orders o ON o.user_id = u.id
     GROUP BY u.id ORDER BY u.created_at DESC`
  ).all()
  return results
}
