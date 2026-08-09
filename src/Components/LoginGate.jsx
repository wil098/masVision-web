import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function LoginGate({ message }) {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState(null)

  const handleClick = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch {
      setError('No pudimos iniciar sesión. Intenta de nuevo.')
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
      <h3 className="text-xl font-bold text-gray-900">Inicia sesión para continuar</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        {message || 'Necesitas una cuenta para completar tu pedido — así guardamos tu historial y direcciones de envío.'}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-sm transition-all"
      >
        <GoogleIcon />
        Continuar con Google
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}