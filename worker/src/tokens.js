// Utilidades criptográficas pequeñas: tokens firmados para el enlace de baja
// de los correos de marketing y comparación de firmas en tiempo constante.

async function hmacHex(secret, message) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Compara dos strings hex sin cortar en la primera diferencia, para no
// filtrar por tiempos cuántos caracteres de una firma son correctos.
export function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Firma del enlace público de un pedido (/pedido/:id?t=...): permite ver la
// cotización y pagarla sin iniciar sesión, solo a quien recibió el enlace.
export async function orderViewToken(env, orderId) {
  if (!env.UNSUBSCRIBE_SECRET) return null
  return (await hmacHex(env.UNSUBSCRIBE_SECRET, `pedido:${orderId}`)).slice(0, 32)
}

export async function verifyOrderViewToken(env, orderId, token) {
  const expected = await orderViewToken(env, orderId)
  return Boolean(expected) && timingSafeEqualHex(expected, String(token))
}

export async function buildOrderViewUrl(env, orderId) {
  const token = await orderViewToken(env, orderId)
  if (!token) return null
  const base = env.PUBLIC_SITE_URL.endsWith('/') ? env.PUBLIC_SITE_URL : `${env.PUBLIC_SITE_URL}/`
  return `${base}pedido/${orderId}?t=${token}`
}

export async function unsubscribeToken(env, uid) {
  if (!env.UNSUBSCRIBE_SECRET) return null
  return (await hmacHex(env.UNSUBSCRIBE_SECRET, `baja:${uid}`)).slice(0, 32)
}

export async function verifyUnsubscribeToken(env, uid, token) {
  const expected = await unsubscribeToken(env, uid)
  return Boolean(expected) && timingSafeEqualHex(expected, String(token))
}

// URL pública del enlace de baja (la sirve este mismo Worker).
export async function buildUnsubscribeUrl(env, uid, tipo = 'marketing') {
  const token = await unsubscribeToken(env, uid)
  if (!token || !env.PUBLIC_API_URL) return null
  const url = new URL('/api/baja', env.PUBLIC_API_URL)
  url.searchParams.set('u', uid)
  url.searchParams.set('t', token)
  if (tipo !== 'marketing') url.searchParams.set('tipo', tipo)
  return url.toString()
}
