import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.status = status
  }
}

// Verifica el ID token de Firebase enviado en el header Authorization.
// Devuelve { uid, email, name } del cliente autenticado, o lanza AuthError.
export async function requireUser(request, env) {
  const authorization = request.headers.get('Authorization') ?? ''
  const idToken = authorization.replace(/^Bearer\s+/i, '')
  if (!idToken) {
    throw new AuthError('Falta el token de sesión.')
  }

  const auth = Auth.getOrInitialize(
    env.PROJECT_ID,
    WorkersKVStoreSingle.getOrInitialize(env.PUBLIC_JWK_CACHE_KEY, env.FIREBASE_JWK_CACHE_KV)
  )

  let firebaseToken
  try {
    firebaseToken = await auth.verifyIdToken(idToken, false, env)
  } catch {
    throw new AuthError('Sesión inválida o expirada.')
  }

  return {
    uid: firebaseToken.uid,
    email: firebaseToken.email ?? '',
    name: firebaseToken.name ?? '',
    emailVerified: firebaseToken.email_verified === true,
  }
}

// Correos que son admin aunque todavía no tengan cuenta (ADMIN_EMAILS en
// wrangler.toml). Solo cuenta si Google verificó que el correo es del usuario.
export function isAdminByEmail(env, user) {
  if (!user?.emailVerified || !user.email) return false
  const list = String(env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(user.email.toLowerCase())
}

// Si el correo está en ADMIN_EMAILS, deja la marca is_admin = 1 en su cuenta
// (para que el panel lo muestre como admin). Devuelve si el usuario es admin.
export async function syncAdminFlag(env, user) {
  const row = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind(user.uid).first()
  if (row?.is_admin) return true
  if (isAdminByEmail(env, user)) {
    await env.DB.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(user.uid).run()
    return true
  }
  return false
}

// Igual que requireUser, pero además exige que la cuenta sea admin.
export async function requireAdmin(request, env) {
  const user = await requireUser(request, env)
  if (!(await syncAdminFlag(env, user))) {
    throw new AuthError('No tienes permisos de administrador.', 403)
  }
  return user
}

export { AuthError }
