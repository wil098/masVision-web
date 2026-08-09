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
  }
}

// Igual que requireUser, pero además exige que la cuenta tenga is_admin = 1.
export async function requireAdmin(request, env) {
  const user = await requireUser(request, env)
  const row = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind(user.uid).first()
  if (!row?.is_admin) {
    throw new AuthError('No tienes permisos de administrador.', 403)
  }
  return user
}

export { AuthError }
