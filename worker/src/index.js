import { buildVendorEmailHtml, buildCustomerEmailHtml } from './emailTemplates.js'
import {
  insertPendingOrder,
  markOrderStatus,
  markVendorEmailSent,
  markCustomerEmailSent,
  upsertUser,
  listAddresses,
  getAddress,
  createAddress,
  deleteAddress,
  listOrdersByUser,
  listAllOrders,
  updateOrderTracking,
  listCustomers,
} from './db.js'
import {
  listProducts,
  listAllProductsForAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productsDb.js'
import {
  listLensOptions,
  listAllLensOptionsForAdmin,
  getLensOption,
  createLensOption,
  updateLensOption,
  deleteLensOption,
} from './lensOptionsDb.js'
import { logEvent, logError } from './logger.js'
import { requireUser, requireAdmin } from './auth.js'

function corsHeaders(origin, allowedOrigins) {
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// Verifica el token de sesión y devuelve { user } o { errorResponse } listo para
// retornar tal cual desde el handler que la llame. Además garantiza que el
// usuario ya exista en D1 (users.id) antes de continuar, porque addresses y
// orders tienen una llave foránea hacia esa tabla.
async function authenticateOrRespond(request, env, cors) {
  try {
    const user = await requireUser(request, env)
    await upsertUser(env, user)
    return { user }
  } catch (err) {
    return { errorResponse: jsonResponse({ success: false, message: err.message }, err.status || 401, cors) }
  }
}

// Igual, pero exige is_admin = 1. Se usa en todas las rutas /admin/*.
async function authenticateAdminOrRespond(request, env, cors) {
  try {
    return { user: await requireAdmin(request, env) }
  } catch (err) {
    return { errorResponse: jsonResponse({ success: false, message: err.message }, err.status || 401, cors) }
  }
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

async function hmacSha256Hex(secret, message) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getWompiToken(env) {
  const response = await fetch(`${env.WOMPI_ID_BASE_URL}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      audience: 'wompi_api',
      client_id: env.WOMPI_CLIENT_ID,
      client_secret: env.WOMPI_CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    throw new Error('No se pudo autenticar con Wompi.')
  }

  const data = await response.json()
  return data.access_token
}

async function createWompiPaymentLink(env, token, { orderId, monto, nombreProducto, descripcion, urlWebhook, urlRedirect }) {
  const response = await fetch(`${env.WOMPI_API_BASE_URL}/EnlacePago`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identificadorEnlaceComercio: orderId,
      monto,
      nombreProducto,
      formaPago: {
        permitirTarjetaCreditoDebido: true,
        permitirPagoConPuntoAgricola: false,
        permitirPagoEnCuotasAgricola: true,
        permitirPagoEnBitcoin: false,
        permitePagoQuickPay: false,
      },
      cantidadMaximaCuotas: 'Doce',
      infoProducto: { descripcionProducto: descripcion },
      configuracion: {
        urlWebhook,
        urlRedirect,
        emailsNotificacion: env.DESTINATION_EMAIL,
      },
      limitesDeUso: { cantidadMaximaPagosExitosos: 1 },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Wompi rechazó la creación del enlace: ${errorBody}`)
  }

  return response.json()
}

async function sendResendMessage(env, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Resend rechazó el envío: ${errorBody}`)
  }
}

async function sendVendorEmail(env, order) {
  const payload = {
    from: env.FROM_EMAIL,
    to: env.DESTINATION_EMAIL,
    reply_to: order.correoCliente,
    subject: `Pago confirmado: ${order.asunto}`,
    html: buildVendorEmailHtml(order),
  }
  if (order.recetaAttachment) {
    payload.attachments = [order.recetaAttachment]
  }
  await sendResendMessage(env, payload)
}

async function sendCustomerEmail(env, order) {
  await sendResendMessage(env, {
    from: env.FROM_EMAIL,
    to: order.correoCliente,
    subject: 'Tu pedido en Óptica MasVision fue confirmado',
    html: buildCustomerEmailHtml(order),
  })
}

async function handleCheckout(request, env, cors) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let formData
  try {
    formData = await request.formData()
  } catch {
    return jsonResponse({ success: false, message: 'No se pudo leer el formulario.' }, 400, cors)
  }

  const get = (key) => {
    const value = formData.get(key)
    return typeof value === 'string' ? value : ''
  }

  const telefono = get('Telefono')
  const siteUrl = get('SiteUrl')
  const file = formData.get('attachment')
  const addressId = get('AddressId')

  // El precio SIEMPRE se recalcula aquí desde D1 — nunca se confía en un
  // total mandado por el navegador (eso era lo que permitía pagar cualquier
  // monto con solo editar el request).
  let items
  try {
    items = JSON.parse(get('Items') || '[]')
  } catch {
    return jsonResponse({ success: false, message: 'Los productos del pedido no son válidos.' }, 400, cors)
  }
  if (!Array.isArray(items) || items.length === 0) {
    return jsonResponse({ success: false, message: 'El pedido no tiene productos.' }, 400, cors)
  }

  let monto = 0
  let firstProductName = null
  const resumenLines = []
  for (const rawItem of items) {
    const codigo = String(rawItem?.codigo || '')
    const cantidad = Math.max(1, Math.floor(Number(rawItem?.cantidad) || 1))
    const color = typeof rawItem?.color === 'string' ? rawItem.color : ''
    const medida = typeof rawItem?.medida === 'string' ? rawItem.medida : ''

    const product = await getProduct(env, codigo)
    if (!product || !product.disponible) {
      logEvent('checkout_invalid_product', { codigo })
      return jsonResponse({ success: false, message: `El producto ${codigo} ya no está disponible.` }, 400, cors)
    }

    // Igual que el precio del aro, el precio de las opciones de lente
    // (filtro, marca, etc.) siempre se recalcula aquí desde D1 — el
    // navegador solo manda los ids elegidos, nunca un precio. La
    // personalización de lente solo aplica a aros oftálmicos (no tiene
    // sentido en lentes de sol), y esa regla no se confía solo al frontend.
    const lensOptionIds = Array.isArray(rawItem?.lensOptionIds) ? rawItem.lensOptionIds : []
    if (lensOptionIds.length > 0 && product.categoria !== 'oftalmico') {
      logEvent('checkout_invalid_lens_option', { codigo, reason: 'categoria_no_oftalmico' })
      return jsonResponse({ success: false, message: 'Las opciones de lente solo aplican a aros oftálmicos.' }, 400, cors)
    }
    let lensOptionsTotal = 0
    const lensOptionNames = []
    for (const rawId of lensOptionIds) {
      const lensOption = await getLensOption(env, Number(rawId))
      if (!lensOption || !lensOption.disponible || lensOption.precio_adicional === null) {
        logEvent('checkout_invalid_lens_option', { codigo, lensOptionId: rawId })
        return jsonResponse({ success: false, message: 'Una de las opciones de lente elegidas ya no está disponible.' }, 400, cors)
      }
      lensOptionsTotal += lensOption.precio_adicional
      lensOptionNames.push(lensOption.nombre)
    }

    firstProductName ??= product.name
    const lineTotal = (product.price + lensOptionsTotal) * cantidad
    monto += lineTotal
    const lensSuffix = lensOptionNames.length ? ` - Lente: ${lensOptionNames.join(', ')}` : ''
    const medidaSuffix = medida ? ` - Medida: ${medida}` : ''
    resumenLines.push(
      `${product.name} (${product.codigo}) - ${product.brand}${color ? ` - Color: ${color}` : ''}${medidaSuffix}${lensSuffix} x${cantidad} — $${lineTotal.toFixed(2)}`
    )
  }

  if (!Number.isFinite(monto) || monto <= 0) {
    return jsonResponse({ success: false, message: 'No se pudo calcular el total del pedido.' }, 400, cors)
  }

  const asunto = items.length === 1 ? `Nuevo pedido: ${firstProductName}` : `Nuevo pedido: ${items.length} productos`
  const resumen = resumenLines.join('\n')

  let envio
  if (addressId) {
    const saved = await getAddress(env, addressId, user.uid)
    if (!saved) {
      return jsonResponse({ success: false, message: 'Dirección no encontrada.' }, 404, cors)
    }
    envio = saved
  } else {
    const departamento = get('Departamento')
    const municipio = get('Municipio')
    const direccion = get('Direccion')
    const referencia = get('Referencia')
    if (!departamento || !municipio || !direccion) {
      return jsonResponse({ success: false, message: 'Falta la dirección de envío.' }, 400, cors)
    }
    envio = { departamento, municipio, direccion, referencia }
    if (get('GuardarDireccion') === '1') {
      await createAddress(env, user.uid, envio)
    }
  }

  if (!telefono || !siteUrl) {
    logEvent('checkout_validation_failed', { asunto })
    return jsonResponse({ success: false, message: 'Faltan campos obligatorios.' }, 400, cors)
  }

  const orderId = crypto.randomUUID()
  logEvent('checkout_received', { orderId, asunto, monto, userId: user.uid })

  let recetaAttachment = null
  if (file && typeof file.arrayBuffer === 'function') {
    const buffer = await file.arrayBuffer()
    recetaAttachment = { filename: file.name || 'receta.jpg', content: arrayBufferToBase64(buffer) }
  }

  const order = {
    id: orderId,
    asunto,
    resumen,
    total: monto,
    nombreCliente: user.name || user.email,
    telefono,
    correoCliente: user.email,
    departamento: envio.departamento,
    municipio: envio.municipio,
    direccion: envio.direccion,
    referencia: envio.referencia,
    recetaAttachment,
    tieneReceta: Boolean(recetaAttachment),
    userId: user.uid,
  }

  const redirectBase = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`

  let urlEnlace
  try {
    const token = await getWompiToken(env)
    ;({ urlEnlace } = await createWompiPaymentLink(env, token, {
      orderId,
      monto,
      nombreProducto: asunto.slice(0, 500),
      descripcion: resumen.slice(0, 500),
      urlWebhook: `${new URL(request.url).origin}/wompi-webhook`,
      urlRedirect: `${redirectBase}?pedido=${orderId}`,
    }))
  } catch (err) {
    logError('checkout_payment_link_error', err, { orderId })
    return jsonResponse({ success: false, message: err.message || 'No se pudo crear el enlace de pago.' }, 502, cors)
  }

  // El pedido solo se guarda una vez que Wompi confirma el enlace de pago:
  // KV cachea el archivo de la receta mientras el cliente paga (con expiración),
  // D1 guarda el registro permanente y consultable del pedido.
  await env.ORDERS_KV.put(orderId, JSON.stringify(order), { expirationTtl: 3600 })
  await insertPendingOrder(env, order)
  logEvent('checkout_created', { orderId, monto })

  return jsonResponse({ success: true, urlEnlace, orderId }, 200, cors)
}

async function handleWebhook(request, env) {
  const rawBody = await request.text()
  const receivedHash = request.headers.get('wompi_hash') ?? ''
  const expectedHash = await hmacSha256Hex(env.WOMPI_CLIENT_SECRET, rawBody)

  if (!receivedHash || receivedHash.toLowerCase() !== expectedHash.toLowerCase()) {
    logEvent('webhook_invalid_signature', {})
    return jsonResponse({ success: false, message: 'Firma inválida.' }, 400, {})
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    logEvent('webhook_invalid_json', {})
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, {})
  }

  const orderId = payload?.EnlacePago?.IdentificadorEnlaceComercio
  const wompiTransaccionId = payload?.IdTransaccion ?? null
  const aprobado = payload?.ResultadoTransaccion === 'ExitosaAprobada'

  logEvent('webhook_received', { orderId, resultado: payload?.ResultadoTransaccion })

  if (!orderId) {
    return jsonResponse({ success: true }, 200, {})
  }

  if (!aprobado) {
    await markOrderStatus(env, orderId, 'fallido', wompiTransaccionId)
    logEvent('payment_failed', { orderId })
    return jsonResponse({ success: true }, 200, {})
  }

  // El estado se marca "pagado" en D1 sin importar si la caché de KV (que solo
  // guarda el archivo de la receta mientras se envían los correos) sigue
  // disponible o no — así el registro nunca se queda desactualizado.
  await markOrderStatus(env, orderId, 'pagado', wompiTransaccionId)

  const orderRaw = await env.ORDERS_KV.get(orderId)
  if (!orderRaw) {
    // El pago quedó registrado, pero ya no tenemos los datos en caché para
    // armar el correo (venció el TTL o Wompi reintentó el webhook luego de
    // que ya lo procesamos). Se deja registrado en los logs para revisar.
    logError('webhook_order_not_found_in_cache', new Error('KV vencido o pedido ya procesado'), { orderId })
    return jsonResponse({ success: true }, 200, {})
  }

  const order = JSON.parse(orderRaw)

  try {
    await sendVendorEmail(env, order)
    await markVendorEmailSent(env, orderId)
    logEvent('vendor_email_sent', { orderId })
  } catch (err) {
    // No se borra el pedido de KV: así Wompi puede reintentar el webhook más tarde.
    logError('vendor_email_failed', err, { orderId })
    return jsonResponse({ success: false, message: err.message }, 502, {})
  }

  try {
    await sendCustomerEmail(env, order)
    await markCustomerEmailSent(env, orderId)
    logEvent('customer_email_sent', { orderId })
  } catch (err) {
    // El aviso al vendedor es lo crítico y ya se envió; el del cliente es
    // best-effort (por ejemplo, puede fallar si el dominio de envío de
    // Resend aún no está verificado para mandar a destinatarios externos).
    logError('customer_email_failed', err, { orderId })
  }

  await env.ORDERS_KV.delete(orderId)
  logEvent('order_completed', { orderId })
  return jsonResponse({ success: true }, 200, {})
}

async function handleListAddresses(request, env, cors) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const addresses = await listAddresses(env, user.uid)
  return jsonResponse({ success: true, addresses }, 200, cors)
}

async function handleCreateAddress(request, env, cors) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  const { etiqueta, departamento, municipio, direccion, referencia, esPredeterminada } = body || {}
  if (!departamento || !municipio || !direccion) {
    return jsonResponse({ success: false, message: 'Faltan campos obligatorios.' }, 400, cors)
  }

  const id = await createAddress(env, user.uid, {
    etiqueta,
    departamento,
    municipio,
    direccion,
    referencia,
    esPredeterminada,
  })
  logEvent('address_created', { userId: user.uid, addressId: id })
  return jsonResponse({ success: true, id }, 201, cors)
}

async function handleDeleteAddress(request, env, cors, addressId) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  const deleted = await deleteAddress(env, addressId, user.uid)
  if (!deleted) {
    return jsonResponse({ success: false, message: 'Dirección no encontrada.' }, 404, cors)
  }
  logEvent('address_deleted', { userId: user.uid, addressId })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleListOrders(request, env, cors) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const orders = await listOrdersByUser(env, user.uid)
  return jsonResponse({ success: true, orders }, 200, cors)
}

async function handleMe(request, env, cors) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const row = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind(user.uid).first()
  return jsonResponse(
    { success: true, email: user.email, name: user.name, isAdmin: Boolean(row?.is_admin) },
    200,
    cors
  )
}

async function handleGetProducts(request, env, cors) {
  const url = new URL(request.url)
  const categoria = url.searchParams.get('categoria') || undefined
  const destacado = url.searchParams.get('destacado') === '1'
  const products = await listProducts(env, { categoria, destacado })
  return jsonResponse({ success: true, products }, 200, cors)
}

async function handleGetProduct(env, cors, codigo) {
  const product = await getProduct(env, codigo)
  if (!product || !product.disponible) {
    return jsonResponse({ success: false, message: 'Producto no encontrado.' }, 404, cors)
  }
  return jsonResponse({ success: true, product }, 200, cors)
}

async function handleGetLensOptions(request, env, cors) {
  const lensOptions = await listLensOptions(env)
  return jsonResponse({ success: true, lensOptions }, 200, cors)
}

async function handleGetImage(env, pathname) {
  const key = decodeURIComponent(pathname.replace('/images/', ''))
  const object = await env.IMAGES_BUCKET.get(key)
  if (!object) {
    return new Response('No encontrado', { status: 404 })
  }
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
}

async function handleAdminListProducts(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const products = await listAllProductsForAdmin(env)
  return jsonResponse({ success: true, products }, 200, cors)
}

async function handleAdminCreateProduct(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  if (!body?.codigo || !body?.name || !body?.categoria || !Number.isFinite(Number(body?.price))) {
    return jsonResponse(
      { success: false, message: 'Faltan campos obligatorios (código, nombre, categoría, precio).' },
      400,
      cors
    )
  }

  try {
    await createProduct(env, { ...body, price: Number(body.price) })
  } catch {
    return jsonResponse({ success: false, message: 'Ya existe un producto con ese código.' }, 409, cors)
  }
  logEvent('admin_product_created', { codigo: body.codigo })
  return jsonResponse({ success: true }, 201, cors)
}

async function handleAdminUpdateProduct(request, env, cors, codigo) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  const updated = await updateProduct(env, codigo, { ...body, price: Number(body.price) })
  if (!updated) {
    return jsonResponse({ success: false, message: 'Producto no encontrado.' }, 404, cors)
  }
  logEvent('admin_product_updated', { codigo })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleAdminDeleteProduct(request, env, cors, codigo) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  const deleted = await deleteProduct(env, codigo)
  if (!deleted) {
    return jsonResponse({ success: false, message: 'Producto no encontrado.' }, 404, cors)
  }
  logEvent('admin_product_deleted', { codigo })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleAdminUpload(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  if (!env.IMAGES_BUCKET) {
    return jsonResponse(
      { success: false, message: 'El almacenamiento de imágenes (R2) todavía no está configurado.' },
      503,
      cors
    )
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return jsonResponse({ success: false, message: 'No se pudo leer el archivo.' }, 400, cors)
  }

  const file = formData.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return jsonResponse({ success: false, message: 'Falta el archivo.' }, 400, cors)
  }

  const key = `${crypto.randomUUID()}-${file.name}`
  await env.IMAGES_BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  const url = `${new URL(request.url).origin}/images/${key}`
  return jsonResponse({ success: true, url }, 200, cors)
}

async function handleAdminListOrders(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const orders = await listAllOrders(env)
  return jsonResponse({ success: true, orders }, 200, cors)
}

async function handleAdminUpdateOrder(request, env, cors, orderId) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  await updateOrderTracking(env, orderId, {
    courierName: body?.courierName,
    trackingNumber: body?.trackingNumber,
    trackingUrl: body?.trackingUrl,
    status: body?.status,
  })
  logEvent('admin_order_updated', { orderId })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleAdminListCustomers(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const customers = await listCustomers(env)
  return jsonResponse({ success: true, customers }, 200, cors)
}

async function handleAdminListLensOptions(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const lensOptions = await listAllLensOptionsForAdmin(env)
  return jsonResponse({ success: true, lensOptions }, 200, cors)
}

async function handleAdminCreateLensOption(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  if (!body?.categoria || !body?.nombre) {
    return jsonResponse({ success: false, message: 'Faltan campos obligatorios (categoría, nombre).' }, 400, cors)
  }

  const id = await createLensOption(env, body)
  logEvent('admin_lens_option_created', { id })
  return jsonResponse({ success: true, id }, 201, cors)
}

async function handleAdminUpdateLensOption(request, env, cors, id) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  const updated = await updateLensOption(env, id, body)
  if (!updated) {
    return jsonResponse({ success: false, message: 'Opción de lente no encontrada.' }, 404, cors)
  }
  logEvent('admin_lens_option_updated', { id })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleAdminDeleteLensOption(request, env, cors, id) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  const deleted = await deleteLensOption(env, id)
  if (!deleted) {
    return jsonResponse({ success: false, message: 'Opción de lente no encontrada.' }, 404, cors)
  }
  logEvent('admin_lens_option_deleted', { id })
  return jsonResponse({ success: true }, 200, cors)
}

export default {
  async fetch(request, env) {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    const origin = request.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin, allowedOrigins)
    const { pathname } = new URL(request.url)
    const { method } = request

    if (method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    if (method === 'POST' && pathname === '/checkout') {
      return handleCheckout(request, env, cors)
    }

    if (method === 'POST' && pathname === '/wompi-webhook') {
      return handleWebhook(request, env)
    }

    if (method === 'GET' && pathname === '/api/addresses') {
      return handleListAddresses(request, env, cors)
    }

    if (method === 'POST' && pathname === '/api/addresses') {
      return handleCreateAddress(request, env, cors)
    }

    if (method === 'DELETE' && pathname.startsWith('/api/addresses/')) {
      const addressId = pathname.split('/').pop()
      return handleDeleteAddress(request, env, cors, addressId)
    }

    if (method === 'GET' && pathname === '/api/orders') {
      return handleListOrders(request, env, cors)
    }

    if (method === 'GET' && pathname === '/api/me') {
      return handleMe(request, env, cors)
    }

    if (method === 'GET' && pathname === '/api/products') {
      return handleGetProducts(request, env, cors)
    }

    if (method === 'GET' && pathname.startsWith('/api/products/')) {
      return handleGetProduct(env, cors, decodeURIComponent(pathname.split('/').pop()))
    }

    if (method === 'GET' && pathname === '/api/lens-options') {
      return handleGetLensOptions(request, env, cors)
    }

    if (method === 'GET' && pathname.startsWith('/images/')) {
      return handleGetImage(env, pathname)
    }

    if (method === 'GET' && pathname === '/admin/products') {
      return handleAdminListProducts(request, env, cors)
    }

    if (method === 'POST' && pathname === '/admin/products') {
      return handleAdminCreateProduct(request, env, cors)
    }

    if (method === 'PUT' && pathname.startsWith('/admin/products/')) {
      return handleAdminUpdateProduct(request, env, cors, decodeURIComponent(pathname.split('/').pop()))
    }

    if (method === 'DELETE' && pathname.startsWith('/admin/products/')) {
      return handleAdminDeleteProduct(request, env, cors, decodeURIComponent(pathname.split('/').pop()))
    }

    if (method === 'POST' && pathname === '/admin/upload') {
      return handleAdminUpload(request, env, cors)
    }

    if (method === 'GET' && pathname === '/admin/orders') {
      return handleAdminListOrders(request, env, cors)
    }

    if (method === 'PUT' && pathname.startsWith('/admin/orders/')) {
      return handleAdminUpdateOrder(request, env, cors, pathname.split('/').pop())
    }

    if (method === 'GET' && pathname === '/admin/customers') {
      return handleAdminListCustomers(request, env, cors)
    }

    if (method === 'GET' && pathname === '/admin/lens-options') {
      return handleAdminListLensOptions(request, env, cors)
    }

    if (method === 'POST' && pathname === '/admin/lens-options') {
      return handleAdminCreateLensOption(request, env, cors)
    }

    if (method === 'PUT' && pathname.startsWith('/admin/lens-options/')) {
      return handleAdminUpdateLensOption(request, env, cors, Number(pathname.split('/').pop()))
    }

    if (method === 'DELETE' && pathname.startsWith('/admin/lens-options/')) {
      return handleAdminDeleteLensOption(request, env, cors, Number(pathname.split('/').pop()))
    }

    return jsonResponse({ success: false, message: 'Ruta no encontrada.' }, 404, cors)
  },
}
