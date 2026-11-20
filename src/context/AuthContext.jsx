import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe } from '../lib/adminService'

const AuthContext = createContext()

// Firebase Auth pesa bastante; se carga en un chunk aparte después del
// primer render para que el catálogo aparezca sin esperarlo.
let firebasePromise = null
let firebaseModule = null
const loadFirebase = () =>
  (firebasePromise ??= import('../lib/firebase').then((m) => {
    firebaseModule = m
    return m
  }))

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const getIdToken = useCallback(async () => {
    const { auth } = await loadFirebase()
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken()
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    loadFirebase().then(({ auth, onAuthStateChanged }) => {
      if (cancelled) return
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser)
        setLoading(false)
        if (currentUser) {
          try {
            const me = await fetchMe(getIdToken)
            setIsAdmin(Boolean(me.isAdmin))
          } catch {
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
        }
      })
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [getIdToken])

  // El popup de Google debe abrirse dentro del mismo clic o el navegador lo
  // bloquea: si Firebase ya cargó (lo normal), se llama sin esperar nada.
  const signInWithGoogle = useCallback(() => {
    if (firebaseModule) {
      const { auth, googleProvider, signInWithPopup } = firebaseModule
      return signInWithPopup(auth, googleProvider)
    }
    return loadFirebase().then(({ auth, googleProvider, signInWithPopup }) => signInWithPopup(auth, googleProvider))
  }, [])

  const signOut = useCallback(async () => {
    const { auth, signOut: firebaseSignOut } = await loadFirebase()
    return firebaseSignOut(auth)
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAdmin, signInWithGoogle, signOut, getIdToken }),
    [user, loading, isAdmin, signInWithGoogle, signOut, getIdToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}
