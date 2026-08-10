// API JSON pura (sin HTML propio), así que la CSP puede ser tan estricta
// como 'none' — no hay nada que este Worker deba poder cargar en un navegador.
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  }
}

const REQUIRED_ENV_VARS = [
  'PROJECT_ID',
  'FROM_EMAIL',
  'DESTINATION_EMAIL',
  'ALLOWED_ORIGINS',
  'WOMPI_ID_BASE_URL',
  'WOMPI_API_BASE_URL',
  'WOMPI_CLIENT_ID',
  'WOMPI_CLIENT_SECRET',
  'RESEND_API_KEY',
  'PUBLIC_JWK_CACHE_KEY',
]

const REQUIRED_BINDINGS = ['DB', 'ORDERS_KV', 'FIREBASE_JWK_CACHE_KV']

// Falla rápido y con un mensaje claro si falta una var/binding, en vez de
// tronar a mitad de una petición real (ej. a mitad de un pago).
export function assertEnvIsConfigured(env) {
  const missingVars = REQUIRED_ENV_VARS.filter((key) => !env[key])
  const missingBindings = REQUIRED_BINDINGS.filter((key) => !env[key])
  if (missingVars.length > 0 || missingBindings.length > 0) {
    throw new Error(
      `Configuración incompleta del Worker. Faltan: ${[...missingVars, ...missingBindings].join(', ')}`
    )
  }
}
