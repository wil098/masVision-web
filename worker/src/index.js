import {
  buildVendorEmailHtml,
  buildCustomerEmailHtml,
  buildShippedEmailHtml,
  buildWelcomeEmailHtml,
  buildUnsubscribePageHtml,
  buildQuoteRequestVendorHtml,
  buildQuoteRequestCustomerHtml,
  buildQuoteReadyCustomerHtml,
} from './emailTemplates.js'
import {
  insertPendingOrder,
  markOrderStatus,
  upsertUser,
  listAddresses,
  getAddress,
  createAddress,
  deleteAddress,
  listOrdersByUser,
  listAllOrders,
  updateOrderTracking,
  listCustomers,
  claimWelcomeEmail,
  getUser,
  setMarketingConsent,
  getOrder,
  claimOrderEmail,
  releaseOrderEmail,
  setOrderQuote,
} from './db.js'
import {
  listProducts,
  listAllProductsForAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  renameProductCode,
} from './productsDb.js'
import {
  listLensOptions,
  listAllLensOptionsForAdmin,
  getLensOption,
  createLensOption,
  updateLensOption,
  deleteLensOption,
} from './lensOptionsDb.js'
import {
  listPromoBlocks,
  listAllPromoBlocksForAdmin,
  createPromoBlock,
  updatePromoBlock,
  deletePromoBlock,
} from './promoBlocksDb.js'
import { logEvent, logError } from './logger.js'
import { requireUser, requireAdmin, syncAdminFlag } from './auth.js'
import { checkRateLimit, getClientIp, isAuthBlocked, recordAuthFailure } from './rateLimit.js'
import { verifyUnsubscribeToken, buildUnsubscribeUrl, timingSafeEqualHex } from './tokens.js'
import { securityHeaders, assertEnvIsConfigured } from './security.js'
import {
  checkoutItemsSchema,
  addressSchema,
  adminProductSchema,
  adminRenameProductCodeSchema,
  adminLensOptionSchema,
  adminPromoBlockSchema,
  adminOrderUpdateSchema,
  adminQuoteSchema,
  parseSchema,
} from './validation.js'

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
  const ip = getClientIp(request)
  if (await isAuthBlocked(env, ip)) {
    logEvent('auth_blocked_rate_limit', { ip })
    return { errorResponse: jsonResponse({ success: false, message: 'Demasiados intentos fallidos. Intenta más tarde.' }, 429, cors) }
  }
  let user
  try {
    user = await requireUser(request, env)
    await upsertUser(env, user)
  } catch (err) {
    await recordAuthFailure(env, ip)
    logEvent('auth_failed', { ip, reason: err.message })
    return { errorResponse: jsonResponse({ success: false, message: err.message }, err.status || 401, cors) }
  }
  await maybeSendWelcomeEmail(env, user)
  return { user }
}

// Primera vez que un cliente inicia sesión: correo de bienvenida. Nunca
// bloquea ni rompe la petición original si el correo falla.
async function maybeSendWelcomeEmail(env, user) {
  if (!user?.email) return
  try {
    if (!(await claimWelcomeEmail(env, user.uid))) return
    const row = await getUser(env, user.uid)
    await sendResendMessage(env, {
      from: env.FROM_EMAIL,
      to: user.email,
      subject: 'Bienvenido a Óptica Más Visión',
      html: buildWelcomeEmailHtml({
        nombre: user.name,
        siteUrl: env.PUBLIC_SITE_URL,
        aceptaMarketing: Boolean(row?.acepta_marketing),
        unsubscribeUrl: await buildUnsubscribeUrl(env, user.uid),
      }),
    })
    logEvent('welcome_email_sent', { userId: user.uid })
  } catch (err) {
    logError('welcome_email_failed', err, { userId: user.uid })
  }
}

// Igual, pero exige is_admin = 1. Se usa en todas las rutas /admin/*.
async function authenticateAdminOrRespond(request, env, cors) {
  const ip = getClientIp(request)
  if (await isAuthBlocked(env, ip)) {
    logEvent('auth_blocked_rate_limit', { ip })
    return { errorResponse: jsonResponse({ success: false, message: 'Demasiados intentos fallidos. Intenta más tarde.' }, 429, cors) }
  }
  try {
    return { user: await requireAdmin(request, env) }
  } catch (err) {
    await recordAuthFailure(env, ip)
    logEvent('auth_failed', { ip, reason: err.message, admin: true })
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
    headers: { 'Content-Type': 'application/json', ...securityHeaders(), ...headers },
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
        emailsNotificacion: env.WOMPI_NOTIFY_EMAIL,
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
    html: buildVendorEmailHtml(order, { siteUrl: env.PUBLIC_SITE_URL }),
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
    subject: `Pedido confirmado #${String(order.id).slice(0, 8).toUpperCase()} · Óptica Más Visión`,
    html: buildCustomerEmailHtml(order, { siteUrl: env.PUBLIC_SITE_URL }),
  })
}

async function sendShippedEmail(env, orderRow) {
  await sendResendMessage(env, {
    from: env.FROM_EMAIL,
    to: orderRow.correo_cliente,
    subject: `Tu pedido va en camino · Óptica Más Visión`,
    html: buildShippedEmailHtml(orderRow, { siteUrl: env.PUBLIC_SITE_URL }),
  })
}

// Reconstruye el pedido desde D1 cuando la caché de KV (que guarda la receta
// mientras el cliente paga, 1 hora) ya venció: así los correos salen igual,
// solo que sin el archivo adjunto.
function orderFromRow(row) {
  const lentes =
    row.lentes_precio > 0
      ? `\nLentes: ${row.lentes_descripcion || 'según receta'} — $${Number(row.lentes_precio).toFixed(2)}`
      : ''
  return {
    id: row.id,
    asunto: row.asunto,
    resumen: `${row.resumen || ''}${lentes}`,
    total: row.total,
    nombreCliente: row.nombre_cliente,
    telefono: row.telefono,
    correoCliente: row.correo_cliente,
    departamento: row.departamento,
    municipio: row.municipio,
    direccion: row.direccion,
    referencia: row.referencia,
    recetaAttachment: null,
    tieneReceta: Boolean(row.tiene_receta),
    userId: row.user_id,
  }
}

// Adjunta al correo la receta guardada en el bucket privado (si existe).
async function loadRecetaAttachment(env, row) {
  if (!row?.receta_key || !env.RECETAS_BUCKET) return null
  try {
    const obj = await env.RECETAS_BUCKET.get(row.receta_key)
    if (!obj) return null
    return {
      filename: row.receta_key.split('/').pop() || 'receta',
      content: arrayBufferToBase64(await obj.arrayBuffer()),
    }
  } catch (err) {
    logError('receta_load_failed', err, { orderId: row.id })
    return null
  }
}

const RECETA_MAX_BYTES = 5 * 1024 * 1024
const RECETA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
const UPLOAD_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' }

function safeFileName(name, fallback) {
  const cleaned = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, 80)
  return cleaned || fallback
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

  const telefono = get('Telefono').trim()
  const siteUrl = get('SiteUrl')
  // 'cotizar': el cliente subió receta y quiere aro + lentes; no paga ahora,
  // la óptica le envía después un solo enlace por el total.
  const modo = get('Modo') === 'cotizar' ? 'cotizar' : 'pagar'

  // El teléfono va al correo y a la base: solo dígitos, espacios, +, - y ().
  if (!/^[0-9+()\s-]{8,20}$/.test(telefono)) {
    return jsonResponse({ success: false, message: 'El teléfono no es válido.' }, 400, cors)
  }

  // SiteUrl define a dónde redirige Wompi después del pago: solo se aceptan
  // los orígenes del sitio, para que no se pueda usar como redirección abierta.
  let siteOrigin = ''
  try {
    siteOrigin = new URL(siteUrl).origin
  } catch {
    /* inválida */
  }
  const allowedSiteOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  if (!allowedSiteOrigins.includes(siteOrigin)) {
    logEvent('checkout_invalid_site_url', { siteUrl: siteUrl.slice(0, 200) })
    return jsonResponse({ success: false, message: 'Origen del pedido no válido.' }, 400, cors)
  }
  const file = formData.get('attachment')
  const addressId = get('AddressId')

  // El precio SIEMPRE se recalcula aquí desde D1 — nunca se confía en un
  // total mandado por el navegador (eso era lo que permitía pagar cualquier
  // monto con solo editar el request).
  let rawItems
  try {
    rawItems = JSON.parse(get('Items') || '[]')
  } catch {
    return jsonResponse({ success: false, message: 'Los productos del pedido no son válidos.' }, 400, cors)
  }

  const { data: items, error: itemsError } = parseSchema(checkoutItemsSchema, rawItems)
  if (itemsError) {
    logEvent('validation_rejected', { endpoint: 'checkout', userId: user.uid, error: itemsError })
    return jsonResponse({ success: false, message: 'Los productos del pedido no son válidos.' }, 400, cors)
  }

  let monto = 0
  let firstProductName = null
  const resumenLines = []
  for (const item of items) {
    const { codigo, cantidad, color, medida, lensOptionIds } = item

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
    if (lensOptionIds.length > 0 && product.categoria !== 'oftalmico') {
      logEvent('checkout_invalid_lens_option', { codigo, reason: 'categoria_no_oftalmico' })
      return jsonResponse({ success: false, message: 'Las opciones de lente solo aplican a aros oftálmicos.' }, 400, cors)
    }
    let lensOptionsTotal = 0
    const lensOptionNames = []
    for (const rawId of lensOptionIds) {
      const lensOption = await getLensOption(env, rawId)
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

  // Envío fijo por pedido (no por artículo) a todo el país, definido en
  // wrangler.toml. Se suma aquí para que el navegador no pueda omitirlo.
  const costoEnvio = Number(env.COSTO_ENVIO ?? 0)
  if (Number.isFinite(costoEnvio) && costoEnvio > 0) {
    monto += costoEnvio
    resumenLines.push(`Envío a domicilio — $${costoEnvio.toFixed(2)}`)
  }
  monto = Math.round(monto * 100) / 100

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
    const { data: parsedAddress, error: addressError } = parseSchema(addressSchema, {
      departamento: get('Departamento'),
      municipio: get('Municipio'),
      direccion: get('Direccion'),
      referencia: get('Referencia') || undefined,
    })
    if (addressError) {
      logEvent('validation_rejected', { endpoint: 'checkout_address', userId: user.uid, error: addressError })
      return jsonResponse({ success: false, message: 'Falta la dirección de envío.' }, 400, cors)
    }
    envio = parsedAddress
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
  let recetaKey = null
  if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
    if (file.size > RECETA_MAX_BYTES || !RECETA_TYPES.includes(file.type)) {
      return jsonResponse(
        { success: false, message: 'La receta debe ser una foto o PDF de máximo 5 MB.' },
        400,
        cors
      )
    }
    const buffer = await file.arrayBuffer()
    recetaAttachment = { filename: safeFileName(file.name, 'receta'), content: arrayBufferToBase64(buffer) }
    // La receta (dato médico) va a un bucket privado, nunca al público de fotos.
    if (env.RECETAS_BUCKET) {
      recetaKey = `${orderId}/${recetaAttachment.filename}`
      await env.RECETAS_BUCKET.put(recetaKey, buffer, { httpMetadata: { contentType: file.type } })
    }
  }

  if (modo === 'cotizar' && !recetaAttachment) {
    return jsonResponse({ success: false, message: 'Sube tu receta para pedir la cotización de tus lentes.' }, 400, cors)
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

  if (modo === 'cotizar') {
    await insertPendingOrder(env, order, { status: 'cotizacion', recetaKey })
    logEvent('quote_requested', { orderId, monto })
    try {
      await sendResendMessage(env, {
        from: env.FROM_EMAIL,
        to: env.DESTINATION_EMAIL,
        reply_to: order.correoCliente,
        subject: `Cotizar lentes: ${order.asunto}`,
        html: buildQuoteRequestVendorHtml(order, { siteUrl: env.PUBLIC_SITE_URL }),
        attachments: recetaAttachment ? [recetaAttachment] : undefined,
      })
    } catch (err) {
      logError('quote_vendor_email_failed', err, { orderId })
    }
    try {
      await sendResendMessage(env, {
        from: env.FROM_EMAIL,
        to: order.correoCliente,
        subject: 'Recibimos tu receta · Óptica Más Visión',
        html: buildQuoteRequestCustomerHtml(order, { siteUrl: env.PUBLIC_SITE_URL }),
      })
    } catch (err) {
      logError('quote_customer_email_failed', err, { orderId })
    }
    return jsonResponse({ success: true, modo: 'cotizar', orderId }, 200, cors)
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
    // El detalle de Wompi queda en los logs; al navegador solo un mensaje genérico.
    logError('checkout_payment_link_error', err, { orderId })
    return jsonResponse({ success: false, message: 'No pudimos generar el enlace de pago. Intenta de nuevo en unos minutos.' }, 502, cors)
  }

  // El pedido solo se guarda una vez que Wompi confirma el enlace de pago.
  // D1 guarda el registro y la receta queda en el bucket privado (ya no se
  // usa KV aquí: ahorra escrituras del plan gratuito).
  await insertPendingOrder(env, order, { recetaKey })
  logEvent('checkout_created', { orderId, monto })

  return jsonResponse({ success: true, urlEnlace, orderId }, 200, cors)
}

async function handleWebhook(request, env) {
  const rawBody = await request.text()
  const receivedHash = request.headers.get('wompi_hash') ?? ''
  const expectedHash = await hmacSha256Hex(env.WOMPI_CLIENT_SECRET, rawBody)

  if (!receivedHash || !timingSafeEqualHex(receivedHash.toLowerCase(), expectedHash.toLowerCase())) {
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

  // Los enlaces de cotización usan "<orderId>-q<n>"; el id son los 36
  // caracteres del UUID.
  const orderId = String(payload?.EnlacePago?.IdentificadorEnlaceComercio || '').slice(0, 36) || null
  const wompiTransaccionId = payload?.IdTransaccion ?? null
  const aprobado = payload?.ResultadoTransaccion === 'ExitosaAprobada'

  logEvent('webhook_received', { orderId, resultado: payload?.ResultadoTransaccion })

  if (!orderId) {
    return jsonResponse({ success: true }, 200, {})
  }

  const existing = await getOrder(env, orderId)
  if (!existing) {
    logEvent('webhook_unknown_order', { orderId })
    return jsonResponse({ success: true }, 200, {})
  }

  if (!aprobado) {
    // Un pago ya confirmado no vuelve a "fallido" por un aviso posterior.
    if (existing.status === 'pagado') return jsonResponse({ success: true }, 200, {})
    await markOrderStatus(env, orderId, 'fallido', wompiTransaccionId)
    logEvent('payment_failed', { orderId })
    return jsonResponse({ success: true }, 200, {})
  }

  // El estado se marca "pagado" en D1 sin importar si la caché de KV (que solo
  // guarda el archivo de la receta mientras se envían los correos) sigue
  // disponible o no — así el registro nunca se queda desactualizado.
  await markOrderStatus(env, orderId, 'pagado', wompiTransaccionId)

  // Los datos para los correos salen de KV (incluye la receta adjunta) o, si
  // la caché ya venció, de D1 (sin adjunto). Antes, si el cliente tardaba más
  // de una hora en pagar, no salía ningún correo.
  const orderRaw = await env.ORDERS_KV.get(orderId)
  let order
  if (orderRaw) {
    order = JSON.parse(orderRaw)
  } else {
    order = orderFromRow(existing)
    order.recetaAttachment = await loadRecetaAttachment(env, existing)
  }

  // claimOrderEmail marca el correo como enviado de forma atómica, así los
  // reintentos de Wompi nunca duplican correos.
  if (await claimOrderEmail(env, orderId, 'email_vendedor_enviado')) {
    try {
      await sendVendorEmail(env, order)
      logEvent('vendor_email_sent', { orderId })
    } catch (err) {
      // Se libera la marca y se responde error para que Wompi reintente.
      await releaseOrderEmail(env, orderId, 'email_vendedor_enviado')
      logError('vendor_email_failed', err, { orderId })
      return jsonResponse({ success: false, message: 'No se pudo enviar el aviso.' }, 502, {})
    }
  }

  if (await claimOrderEmail(env, orderId, 'email_cliente_enviado')) {
    try {
      await sendCustomerEmail(env, order)
      logEvent('customer_email_sent', { orderId })
    } catch (err) {
      await releaseOrderEmail(env, orderId, 'email_cliente_enviado')
      logError('customer_email_failed', err, { orderId })
    }
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

  const { data: address, error } = parseSchema(addressSchema, body || {})
  if (error) {
    logEvent('validation_rejected', { endpoint: 'addresses_create', userId: user.uid, error })
    return jsonResponse({ success: false, message: 'Faltan campos obligatorios.' }, 400, cors)
  }

  const id = await createAddress(env, user.uid, address)
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
  const isAdmin = await syncAdminFlag(env, user)
  const row = await getUser(env, user.uid)
  return jsonResponse(
    {
      success: true,
      email: user.email,
      name: user.name,
      isAdmin,
      aceptaMarketing: Boolean(row?.acepta_marketing),
    },
    200,
    cors
  )
}

async function handleUpdatePreferences(request, env, cors) {
  const { user, errorResponse } = await authenticateOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }
  if (typeof body?.aceptaMarketing !== 'boolean') {
    return jsonResponse({ success: false, message: 'Preferencia inválida.' }, 400, cors)
  }
  await setMarketingConsent(env, user.uid, body.aceptaMarketing)
  logEvent('marketing_consent_updated', { userId: user.uid, acepta: body.aceptaMarketing })
  return jsonResponse({ success: true, aceptaMarketing: body.aceptaMarketing }, 200, cors)
}

// Enlace de baja de los correos de marketing (sin iniciar sesión): el token
// es un HMAC del id de usuario, así nadie puede dar de baja a otra persona.
async function handleUnsubscribe(request, env) {
  const url = new URL(request.url)
  const uid = url.searchParams.get('u') || ''
  const token = url.searchParams.get('t') || ''
  const ok = uid && token && (await verifyUnsubscribeToken(env, uid, token))
  if (ok) {
    await setMarketingConsent(env, uid, false)
    logEvent('marketing_unsubscribed', { userId: uid })
  }
  return new Response(buildUnsubscribePageHtml({ ok: Boolean(ok), siteUrl: env.PUBLIC_SITE_URL }), {
    status: ok ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src https:; frame-ancestors 'none'",
    },
  })
}

async function handleGetProducts(request, env, cors) {
  const url = new URL(request.url)
  const categoria = url.searchParams.get('categoria') || undefined
  const destacado = url.searchParams.get('destacado') === '1'
  const nuevaColeccion = url.searchParams.get('nuevaColeccion') === '1'
  const products = await listProducts(env, { categoria, destacado, nuevaColeccion })
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

async function handleGetPromoBlocks(request, env, cors) {
  const url = new URL(request.url)
  const pagina = url.searchParams.get('pagina') || ''
  if (!['aros-oftalmicos', 'aros-sol'].includes(pagina)) {
    return jsonResponse({ success: false, message: 'Página inválida.' }, 400, cors)
  }
  const promoBlocks = await listPromoBlocks(env, { pagina })
  return jsonResponse({ success: true, promoBlocks }, 200, cors)
}

async function handleGetImage(env, pathname) {
  const key = decodeURIComponent(pathname.replace('/images/', ''))
  const object = await env.IMAGES_BUCKET.get(key)
  if (!object) {
    return new Response('No encontrado', { status: 404 })
  }
  const headers = new Headers(securityHeaders())
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

  const { data: product, error } = parseSchema(adminProductSchema, body)
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_product_create', error })
    return jsonResponse({ success: false, message: `Datos del producto inválidos: ${error}` }, 400, cors)
  }

  try {
    await createProduct(env, product)
  } catch {
    return jsonResponse({ success: false, message: 'Ya existe un producto con ese código.' }, 409, cors)
  }
  logEvent('admin_product_created', { codigo: product.codigo })
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

  const { data: product, error } = parseSchema(adminProductSchema, { ...body, codigo })
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_product_update', codigo, error })
    return jsonResponse({ success: false, message: `Datos del producto inválidos: ${error}` }, 400, cors)
  }

  const updated = await updateProduct(env, codigo, product)
  if (!updated) {
    return jsonResponse({ success: false, message: 'Producto no encontrado.' }, 404, cors)
  }
  logEvent('admin_product_updated', { codigo })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleAdminRenameProductCode(request, env, cors, codigo) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  const { data, error } = parseSchema(adminRenameProductCodeSchema, body)
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_product_rename_code', codigo, error })
    return jsonResponse({ success: false, message: 'Código nuevo inválido.' }, 400, cors)
  }

  const result = await renameProductCode(env, codigo, data.newCodigo)
  if (!result.success) {
    return jsonResponse({ success: false, message: result.message }, 409, cors)
  }
  logEvent('admin_product_code_renamed', { oldCodigo: codigo, newCodigo: data.newCodigo })
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

  // Solo imágenes reales y de tamaño razonable: el bucket se sirve público
  // desde este dominio, así que no se permite subir HTML, SVG ni otros tipos.
  const ext = UPLOAD_TYPES[file.type]
  if (!ext || file.size > UPLOAD_MAX_BYTES) {
    return jsonResponse({ success: false, message: 'Sube una imagen JPG, PNG, WebP, AVIF o GIF de máximo 10 MB.' }, 400, cors)
  }
  const base = safeFileName(String(file.name || '').replace(/\.[^.]+$/, ''), 'imagen')
  const key = `${crypto.randomUUID()}-${base}.${ext}`
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

  const { data: orderUpdate, error } = parseSchema(adminOrderUpdateSchema, body || {})
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_order_update', orderId, error })
    return jsonResponse({ success: false, message: 'Datos de actualización inválidos.' }, 400, cors)
  }

  await updateOrderTracking(env, orderId, orderUpdate)
  logEvent('admin_order_updated', { orderId })

  // En cuanto el pedido pagado tiene número de guía, se avisa al cliente
  // (una sola vez).
  let envioNotificado = false
  const row = await getOrder(env, orderId)
  if (row && row.status === 'pagado' && row.tracking_number && row.correo_cliente) {
    if (await claimOrderEmail(env, orderId, 'email_envio_enviado')) {
      try {
        await sendShippedEmail(env, row)
        envioNotificado = true
        logEvent('shipped_email_sent', { orderId })
      } catch (err) {
        await releaseOrderEmail(env, orderId, 'email_envio_enviado')
        logError('shipped_email_failed', err, { orderId })
      }
    }
  }
  return jsonResponse({ success: true, envioNotificado }, 200, cors)
}

// El admin pone el precio de los lentes: se crea UN enlace de pago por el
// total (aro + envío + lentes) y se le manda al cliente.
async function handleAdminSendQuote(request, env, cors, orderId) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }
  const { data, error } = parseSchema(adminQuoteSchema, body || {})
  if (error) {
    return jsonResponse({ success: false, message: 'Escribe la descripción y un precio válido para los lentes.' }, 400, cors)
  }

  const row = await getOrder(env, orderId)
  if (!row) return jsonResponse({ success: false, message: 'Pedido no encontrado.' }, 404, cors)
  if (!['cotizacion', 'cotizado'].includes(row.status)) {
    return jsonResponse({ success: false, message: 'Este pedido no está esperando cotización.' }, 409, cors)
  }

  const base = Number(row.total_base ?? row.total)
  const total = Math.round((base + data.precio) * 100) / 100
  const version = Number(row.cotizacion_version || 0) + 1
  const siteBase = env.PUBLIC_SITE_URL.endsWith('/') ? env.PUBLIC_SITE_URL : `${env.PUBLIC_SITE_URL}/`
  const resumen = `${row.resumen}\nLentes: ${data.descripcion} — $${data.precio.toFixed(2)}`

  let urlPago
  try {
    const token = await getWompiToken(env)
    ;({ urlEnlace: urlPago } = await createWompiPaymentLink(env, token, {
      orderId: `${orderId}-q${version}`,
      monto: total,
      nombreProducto: `${row.asunto} + lentes`.slice(0, 500),
      descripcion: resumen.slice(0, 500),
      urlWebhook: `${new URL(request.url).origin}/wompi-webhook`,
      urlRedirect: `${siteBase}?pedido=${orderId}`,
    }))
  } catch (err) {
    logError('quote_payment_link_error', err, { orderId })
    return jsonResponse({ success: false, message: 'No se pudo crear el enlace de pago en Wompi. Intenta de nuevo.' }, 502, cors)
  }

  await setOrderQuote(env, orderId, { descripcion: data.descripcion, precio: data.precio, total, urlPago, version })
  logEvent('quote_sent', { orderId, total, version })

  let correoEnviado = false
  try {
    await sendResendMessage(env, {
      from: env.FROM_EMAIL,
      to: row.correo_cliente,
      subject: 'Tu cotización de lentes está lista · Óptica Más Visión',
      html: buildQuoteReadyCustomerHtml(
        { ...row, lentes_descripcion: data.descripcion, lentes_precio: data.precio, total },
        { siteUrl: env.PUBLIC_SITE_URL, urlPago }
      ),
    })
    correoEnviado = true
  } catch (err) {
    logError('quote_ready_email_failed', err, { orderId })
  }

  return jsonResponse({ success: true, urlPago, total, correoEnviado }, 200, cors)
}

// Descarga de la receta para el admin (el bucket es privado).
async function handleAdminGetReceta(request, env, cors, orderId) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const row = await getOrder(env, orderId)
  if (!row?.receta_key || !env.RECETAS_BUCKET) {
    return jsonResponse({ success: false, message: 'Este pedido no tiene receta guardada.' }, 404, cors)
  }
  const obj = await env.RECETAS_BUCKET.get(row.receta_key)
  if (!obj) return jsonResponse({ success: false, message: 'No se encontró el archivo de la receta.' }, 404, cors)
  const headers = new Headers({ ...securityHeaders(), ...cors })
  obj.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'private, no-store')
  headers.set('Content-Disposition', `inline; filename="${row.receta_key.split('/').pop().replace(/"/g, '')}"`)
  return new Response(obj.body, { headers })
}

// Manda al admin una muestra de cada correo para verificar que llegan.
async function handleAdminTestEmail(request, env, cors) {
  const { user, errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  if (!user.email) return jsonResponse({ success: false, message: 'Tu cuenta no tiene correo.' }, 400, cors)

  const sample = {
    id: crypto.randomUUID(),
    asunto: 'Aro Gildi Mopan',
    resumen: 'Aro Gildi Mopan (GCP2400174) - Gildi - Color: C7 - Verde - Medida: 50 mm / 18 mm / 140 mm x1 — $34.99',
    total: 34.99,
    nombreCliente: user.name || 'Cliente de prueba',
    telefono: '7000-0000',
    correoCliente: user.email,
    departamento: 'San Vicente',
    municipio: 'San Vicente',
    direccion: 'Dirección de prueba',
    referencia: 'Correo de prueba',
    tieneReceta: false,
  }
  const results = {}
  const tryEmail = async (key, fn) => {
    try {
      await fn()
      results[key] = 'enviado'
    } catch (err) {
      results[key] = `error: ${err.message}`.slice(0, 300)
    }
  }
  await tryEmail('bienvenida', () =>
    sendResendMessage(env, {
      from: env.FROM_EMAIL,
      to: user.email,
      subject: '[Prueba] Bienvenido a Óptica Más Visión',
      html: buildWelcomeEmailHtml({ nombre: user.name, siteUrl: env.PUBLIC_SITE_URL, aceptaMarketing: false }),
    })
  )
  await tryEmail('pedido', () => sendCustomerEmail(env, sample))
  await tryEmail('envio', () =>
    sendShippedEmail(env, {
      id: sample.id,
      asunto: sample.asunto,
      nombre_cliente: sample.nombreCliente,
      correo_cliente: user.email,
      courier_name: 'Empresa de prueba',
      tracking_number: 'PRUEBA-123',
      tracking_url: env.PUBLIC_SITE_URL,
      departamento: sample.departamento,
      municipio: sample.municipio,
      direccion: sample.direccion,
      referencia: sample.referencia,
    })
  )
  logEvent('admin_test_email', { results })
  return jsonResponse({ success: true, to: user.email, results }, 200, cors)
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

  const { data: lensOption, error } = parseSchema(adminLensOptionSchema, body)
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_lens_option_create', error })
    return jsonResponse({ success: false, message: 'Faltan campos obligatorios (categoría, nombre).' }, 400, cors)
  }

  const id = await createLensOption(env, lensOption)
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

  const { data: lensOption, error } = parseSchema(adminLensOptionSchema, body)
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_lens_option_update', id, error })
    return jsonResponse({ success: false, message: 'Datos de la opción de lente inválidos.' }, 400, cors)
  }

  const updated = await updateLensOption(env, id, lensOption)
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

async function handleAdminListPromoBlocks(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse
  const promoBlocks = await listAllPromoBlocksForAdmin(env)
  return jsonResponse({ success: true, promoBlocks }, 200, cors)
}

async function handleAdminCreatePromoBlock(request, env, cors) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  const { data: promoBlock, error } = parseSchema(adminPromoBlockSchema, body)
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_promo_block_create', error })
    return jsonResponse({ success: false, message: 'Faltan campos obligatorios (página, título, imagen).' }, 400, cors)
  }

  const id = await createPromoBlock(env, promoBlock)
  logEvent('admin_promo_block_created', { id })
  return jsonResponse({ success: true, id }, 201, cors)
}

async function handleAdminUpdatePromoBlock(request, env, cors, id) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, message: 'JSON inválido.' }, 400, cors)
  }

  const { data: promoBlock, error } = parseSchema(adminPromoBlockSchema, body)
  if (error) {
    logEvent('validation_rejected', { endpoint: 'admin_promo_block_update', id, error })
    return jsonResponse({ success: false, message: 'Datos del bloque promocional inválidos.' }, 400, cors)
  }

  const updated = await updatePromoBlock(env, id, promoBlock)
  if (!updated) {
    return jsonResponse({ success: false, message: 'Bloque promocional no encontrado.' }, 404, cors)
  }
  logEvent('admin_promo_block_updated', { id })
  return jsonResponse({ success: true }, 200, cors)
}

async function handleAdminDeletePromoBlock(request, env, cors, id) {
  const { errorResponse } = await authenticateAdminOrRespond(request, env, cors)
  if (errorResponse) return errorResponse

  const deleted = await deletePromoBlock(env, id)
  if (!deleted) {
    return jsonResponse({ success: false, message: 'Bloque promocional no encontrado.' }, 404, cors)
  }
  logEvent('admin_promo_block_deleted', { id })
  return jsonResponse({ success: true }, 200, cors)
}

// Determina el bucket de rate limiting según la ruta: pagos y escritura en
// /admin/* son "sensitive" (10 req/15min), el resto de la API es "general"
// (100 req/15min). Las lecturas de /admin/* van en "general" — con
// "sensitive" el propio panel de administración se bloquearía solo al
// cargar (varias peticiones GET en un solo vistazo).
function rateLimitBucketFor(method, pathname) {
  if (pathname === '/checkout') return 'sensitive'
  if (pathname.startsWith('/admin/') && method !== 'GET') return 'admin'
  return 'general'
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env)
    } catch (err) {
      // Cualquier error no controlado responde JSON (con CORS) en vez de la
      // página de error de Cloudflare, que el navegador ve como fallo de CORS.
      logError('unhandled_error', err, { path: new URL(request.url).pathname })
      const origin = request.headers.get('Origin') ?? ''
      const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim())
      return jsonResponse({ success: false, message: 'Ocurrió un error inesperado.' }, 500, corsHeaders(origin, allowed))
    }
  },
}

async function route(request, env) {
  {
    try {
      assertEnvIsConfigured(env)
    } catch (err) {
      logError('startup_config_error', err, {})
      return jsonResponse({ success: false, message: 'El servicio no está disponible en este momento.' }, 500, {})
    }

    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    const origin = request.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin, allowedOrigins)
    const { pathname } = new URL(request.url)
    const { method } = request

    if (method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    // Las fotos de productos son públicas y el navegador/CDN las cachea un
    // año, así que no pasan por el rate limit: un catálogo carga ~30 de un
    // golpe, y contarlas agotaba el límite (fotos rotas por ERR_BLOCKED_BY_ORB)
    // y gastaba una escritura de KV por cada imagen.
    if ((method === 'GET' || method === 'HEAD') && pathname.startsWith('/images/')) {
      return handleGetImage(env, pathname)
    }

    if (method === 'GET' && pathname === '/api/baja') {
      return handleUnsubscribe(request, env)
    }

    const bucket = rateLimitBucketFor(method, pathname)
    const ip = getClientIp(request)
    const rateLimit = await checkRateLimit(env, bucket, ip)
    if (!rateLimit.allowed) {
      logEvent('rate_limit_exceeded', { ip, bucket, pathname, method })
      return jsonResponse(
        { success: false, message: 'Demasiadas peticiones. Intenta de nuevo más tarde.' },
        429,
        { ...cors, 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
      )
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

    if (method === 'PUT' && pathname === '/api/me/preferencias') {
      return handleUpdatePreferences(request, env, cors)
    }

    if (method === 'POST' && pathname === '/admin/test-email') {
      return handleAdminTestEmail(request, env, cors)
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

    if (method === 'GET' && pathname === '/api/promo-blocks') {
      return handleGetPromoBlocks(request, env, cors)
    }

    if (method === 'GET' && pathname === '/admin/products') {
      return handleAdminListProducts(request, env, cors)
    }

    if (method === 'POST' && pathname === '/admin/products') {
      return handleAdminCreateProduct(request, env, cors)
    }

    if (method === 'PUT' && pathname.startsWith('/admin/products/') && pathname.endsWith('/codigo')) {
      const segments = pathname.split('/')
      return handleAdminRenameProductCode(request, env, cors, decodeURIComponent(segments[segments.length - 2]))
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

    if (method === 'POST' && pathname.startsWith('/admin/orders/') && pathname.endsWith('/cotizacion')) {
      const segments = pathname.split('/')
      return handleAdminSendQuote(request, env, cors, segments[segments.length - 2])
    }

    if (method === 'GET' && pathname.startsWith('/admin/orders/') && pathname.endsWith('/receta')) {
      const segments = pathname.split('/')
      return handleAdminGetReceta(request, env, cors, segments[segments.length - 2])
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

    if (method === 'GET' && pathname === '/admin/promo-blocks') {
      return handleAdminListPromoBlocks(request, env, cors)
    }

    if (method === 'POST' && pathname === '/admin/promo-blocks') {
      return handleAdminCreatePromoBlock(request, env, cors)
    }

    if (method === 'PUT' && pathname.startsWith('/admin/promo-blocks/')) {
      return handleAdminUpdatePromoBlock(request, env, cors, Number(pathname.split('/').pop()))
    }

    if (method === 'DELETE' && pathname.startsWith('/admin/promo-blocks/')) {
      return handleAdminDeletePromoBlock(request, env, cors, Number(pathname.split('/').pop()))
    }

    return jsonResponse({ success: false, message: 'Ruta no encontrada.' }, 404, cors)
  }
}
