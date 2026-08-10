// Rate limiting por IP usando KV (ventana fija). KV es eventually-consistent,
// así que esto es una defensa razonable a esta escala, no un límite exacto
// bajo concurrencia extrema — para eso se usarían Durable Objects.
export const RATE_LIMITS = {
  general: { limit: 100, windowSeconds: 900 }, // API pública de lectura
  sensitive: { limit: 10, windowSeconds: 900 }, // /checkout y mutaciones /admin/*
  authFailure: { limit: 5, windowSeconds: 900 }, // intentos de auth rechazados por IP
}

export function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown'
}

export async function checkRateLimit(env, bucket, identifier) {
  const { limit, windowSeconds } = RATE_LIMITS[bucket]
  const key = `ratelimit:${bucket}:${identifier}`
  const now = Date.now()

  const raw = await env.ORDERS_KV.get(key)
  let entry = raw ? JSON.parse(raw) : null
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowSeconds * 1000 }
  }
  entry.count += 1

  const ttlSeconds = Math.max(60, Math.ceil((entry.resetAt - now) / 1000))
  await env.ORDERS_KV.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds })

  return {
    allowed: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  }
}

// Cuenta un intento de autenticación fallido; si la IP ya viene abusando de
// tokens inválidos, bloquea antes de siquiera intentar verificar el token.
export async function isAuthBlocked(env, ip) {
  const key = `ratelimit:authFailure:${ip}`
  const raw = await env.ORDERS_KV.get(key)
  if (!raw) return false
  const entry = JSON.parse(raw)
  return entry.resetAt > Date.now() && entry.count >= RATE_LIMITS.authFailure.limit
}

export async function recordAuthFailure(env, ip) {
  return checkRateLimit(env, 'authFailure', ip)
}
