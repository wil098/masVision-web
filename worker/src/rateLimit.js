// Rate limiting por IP usando KV (ventana fija). KV es eventually-consistent,
// así que esto es una defensa razonable a esta escala, no un límite exacto
// bajo concurrencia extrema — para eso se usarían Durable Objects.
export const RATE_LIMITS = {
  general: { limit: 100, windowSeconds: 900 }, // API pública de lectura
  sensitive: { limit: 10, windowSeconds: 900 }, // /checkout (pagos, debe quedarse estricto)
  admin: { limit: 30, windowSeconds: 900 }, // mutaciones /admin/*, solo accesibles por admins autenticados
  authFailure: { limit: 5, windowSeconds: 900 }, // intentos de auth rechazados por IP
}

export function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown'
}

// Bindings de Workers Rate Limiting (contadores en memoria de Cloudflare,
// sin costo ni escrituras de KV). Ver [[ratelimits]] en wrangler.toml.
const RATE_LIMIT_BINDINGS = {
  general: 'RL_GENERAL',
  sensitive: 'RL_SENSITIVE',
  admin: 'RL_ADMIN',
}

export async function checkRateLimit(env, bucket, identifier) {
  const binding = env[RATE_LIMIT_BINDINGS[bucket]]
  if (binding) {
    try {
      const { success } = await binding.limit({ key: `${bucket}:${identifier}` })
      return { allowed: success, resetAt: Date.now() + 60_000 }
    } catch {
      // Si el servicio de rate limiting falla, no se tumba la tienda.
      return { allowed: true, resetAt: Date.now() }
    }
  }
  try {
    return await checkKvRateLimit(env, bucket, identifier)
  } catch {
    // KV con la cuota diaria agotada (u otro error) no debe dejar la tienda
    // sin responder: se deja pasar la petición.
    return { allowed: true, resetAt: Date.now() }
  }
}

async function checkKvRateLimit(env, bucket, identifier) {
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
  let raw = null
  try {
    raw = await env.ORDERS_KV.get(key)
  } catch {
    return false
  }
  if (!raw) return false
  const entry = JSON.parse(raw)
  return entry.resetAt > Date.now() && entry.count >= RATE_LIMITS.authFailure.limit
}

export async function recordAuthFailure(env, ip) {
  try {
    return await checkKvRateLimit(env, 'authFailure', ip)
  } catch {
    return null
  }
}
