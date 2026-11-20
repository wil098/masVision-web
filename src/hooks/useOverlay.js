import { useEffect } from 'react'

// Evita que la página de fondo haga scroll mientras hay un panel o modal
// abierto. Cuenta cuántos overlays lo pidieron para no soltar el bloqueo
// antes de tiempo cuando se abren uno encima de otro.
let locks = 0
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return
    locks += 1
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      locks -= 1
      if (locks === 0) document.body.style.overflow = prev === 'hidden' ? '' : prev
    }
  }, [active])
}

export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onEscape])
}
