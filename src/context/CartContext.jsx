import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildCartLine, needsVariantChoice } from '../lib/productUtils'
import { lineIdOf, lineUnitPrice, MAX_QTY } from '../lib/cartUtils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { fetchServerCart, saveServerCart } from '../lib/orderService'

// Formato compacto que se guarda en el servidor.
const toServerLine = (l) => ({
  codigo: l.codigo,
  name: l.name,
  brand: l.brand || '',
  price: l.price,
  image: l.image || '',
  color: l.color?.nombre || '',
  colorHex: l.color?.hex || '',
  medida: l.medida || '',
  quantity: l.quantity,
})

const fromServerLine = (s) => {
  const line = {
    codigo: s.codigo,
    name: s.name,
    brand: s.brand,
    price: Number(s.price),
    image: s.image || null,
    color: s.color ? { nombre: s.color, hex: s.colorHex || null } : null,
    medida: s.medida || '',
    lensOptions: [],
    quantity: s.quantity,
  }
  return { ...line, lineId: lineIdOf(line) }
}

const CartContext = createContext()

const STORAGE_KEY = 'masVision_cart_v2'
const LEGACY_STORAGE_KEY = 'masVision_cart'

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadInitialCart() {
  const saved = readStorage(STORAGE_KEY)
  if (Array.isArray(saved)) return saved.map((l) => ({ ...l, lineId: lineIdOf(l) }))
  // Carritos guardados con el formato anterior (sin color ni medida).
  const legacy = readStorage(LEGACY_STORAGE_KEY)
  if (Array.isArray(legacy)) {
    return legacy
      .filter((i) => i && (i.codigo || i.id))
      .map((i) => {
        const line = {
          codigo: i.codigo || i.id,
          name: i.name,
          brand: i.brand,
          price: Number(i.price || i.precio || 0),
          image: i.image || null,
          color: null,
          medida: '',
          lensOptions: [],
          quantity: Math.min(Math.max(1, i.quantity || 1), MAX_QTY),
        }
        return { ...line, lineId: lineIdOf(line) }
      })
  }
  return []
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadInitialCart)
  const { user, getIdToken } = useAuth()
  const [serverReady, setServerReady] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [quickAddProduct, setQuickAddProduct] = useState(null)
  const [lastAdded, setLastAdded] = useState({ id: null, at: 0 })
  const [lastRemoved, setLastRemoved] = useState(null) // { line, index }
  const undoTimer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Navegación privada o almacenamiento bloqueado: el carrito sigue
      // funcionando en memoria.
    }
  }, [cart])

  // Sincroniza el carrito entre pestañas abiertas del sitio.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setCart(JSON.parse(e.newValue))
        } catch {
          /* ignorar */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Al iniciar sesión: si este navegador no tiene carrito, se recupera el
  // guardado en el servidor (por ejemplo, desde otro dispositivo).
  useEffect(() => {
    setServerReady(false)
    if (!user) return
    let cancelled = false
    fetchServerCart(getIdToken)
      .then((items) => {
        if (cancelled || !items.length) return
        setCart((curr) => (curr.length ? curr : items.map(fromServerLine)))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setServerReady(true)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  // Copia el carrito al servidor (con pausa, para no mandar cada clic). Es
  // lo que permite el recordatorio de carrito abandonado.
  useEffect(() => {
    if (!user || !serverReady) return
    const t = setTimeout(() => {
      saveServerCart(cart.map(toServerLine), getIdToken).catch(() => {})
    }, 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, user?.uid, serverReady])

  // El botón "Volver a mi carrito" del correo abre el carrito (?carrito=1).
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('carrito') === '1') {
      setIsCartOpen(true)
      params.delete('carrito')
      const qs = params.toString()
      navigate({ pathname: location.pathname, search: qs ? `?${qs}` : '' }, { replace: true })
    }
  }, [location.search, location.pathname, navigate])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  // Agrega una línea ya armada (ver buildCartLine) y abre el carrito.
  const addLine = useCallback((line, { open = true } = {}) => {
    const withId = { ...line, lineId: lineIdOf(line) }
    setCart((curr) => {
      const existing = curr.find((l) => l.lineId === withId.lineId)
      if (existing) {
        return curr.map((l) =>
          l.lineId === withId.lineId ? { ...l, quantity: Math.min(l.quantity + withId.quantity, MAX_QTY) } : l
        )
      }
      return [...curr, { ...withId, quantity: Math.min(withId.quantity, MAX_QTY) }]
    })
    setLastAdded({ id: withId.lineId, at: Date.now() })
    if (open) setIsCartOpen(true)
  }, [])

  // Punto de entrada desde las tarjetas del catálogo: si el aro tiene varios
  // colores o medidas, primero pregunta cuál; si no, lo agrega directo.
  const requestAdd = useCallback(
    (product) => {
      if (needsVariantChoice(product)) {
        setQuickAddProduct(product)
      } else {
        addLine(buildCartLine(product))
      }
    },
    [addLine]
  )

  const closeQuickAdd = useCallback(() => setQuickAddProduct(null), [])

  const setQuantity = useCallback((lineId, quantity) => {
    const q = Math.min(Math.max(1, Math.floor(quantity) || 1), MAX_QTY)
    setCart((curr) => curr.map((l) => (l.lineId === lineId ? { ...l, quantity: q } : l)))
  }, [])

  const removeLine = useCallback((lineId) => {
    setCart((curr) => {
      const index = curr.findIndex((l) => l.lineId === lineId)
      if (index === -1) return curr
      setLastRemoved({ line: curr[index], index })
      return curr.filter((l) => l.lineId !== lineId)
    })
    clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setLastRemoved(null), 6000)
  }, [])

  const undoRemove = useCallback(() => {
    setLastRemoved((removed) => {
      if (removed) {
        setCart((curr) => {
          if (curr.some((l) => l.lineId === removed.line.lineId)) return curr
          const next = [...curr]
          next.splice(Math.min(removed.index, next.length), 0, removed.line)
          return next
        })
      }
      return null
    })
    clearTimeout(undoTimer.current)
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  useEffect(() => () => clearTimeout(undoTimer.current), [])

  const value = useMemo(() => {
    const cartCount = cart.reduce((t, l) => t + l.quantity, 0)
    const cartSubtotal = cart.reduce((t, l) => t + l.price * l.quantity, 0)
    const cartLensTotal = cart.reduce((t, l) => t + (lineUnitPrice(l) - l.price) * l.quantity, 0)
    const cartTotal = cartSubtotal + cartLensTotal
    return {
      cart,
      cartCount,
      cartSubtotal,
      cartLensTotal,
      cartTotal,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      requestAdd,
      quickAddProduct,
      closeQuickAdd,
      setQuantity,
      removeLine,
      undoRemove,
      lastRemoved,
      lastAddedId: lastAdded.id,
      lastAddedAt: lastAdded.at,
      clearCart,
    }
  }, [cart, isCartOpen, openCart, closeCart, addLine, requestAdd, quickAddProduct, closeQuickAdd, setQuantity, removeLine, undoRemove, lastRemoved, lastAdded, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider')
  }
  return context
}
