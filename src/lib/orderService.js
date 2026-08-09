const WHATSAPP_NUMBER = '50371497972'

export async function authFetch(url, options, getIdToken) {
  const idToken = await getIdToken()
  if (!idToken) {
    throw new Error('Debes iniciar sesión para continuar.')
  }
  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${idToken}`)
  return fetch(url, { ...options, headers })
}

export function requireApiBase() {
  const apiBase = import.meta.env.VITE_ORDER_API_BASE
  if (!apiBase) {
    throw new Error('Falta configurar VITE_ORDER_API_BASE en el entorno.')
  }
  return apiBase
}

export async function fetchProducts({ categoria, destacado } = {}) {
  const apiBase = requireApiBase()
  const params = new URLSearchParams()
  if (categoria) params.set('categoria', categoria)
  if (destacado) params.set('destacado', '1')

  const response = await fetch(`${apiBase}/api/products?${params.toString()}`)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudo cargar el catálogo.')
  }
  return result.products
}

export async function fetchProduct(codigo) {
  const apiBase = requireApiBase()
  const response = await fetch(`${apiBase}/api/products/${encodeURIComponent(codigo)}`)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'Producto no encontrado.')
  }
  return result.product
}

// Opciones de lente (filtro, marca, etc.) activas y con precio definido.
// Vacío hasta que el admin cargue precios reales — el llamador debe tratar
// una lista vacía como "no mostrar personalización de lente".
export async function fetchLensOptions() {
  const apiBase = requireApiBase()
  const response = await fetch(`${apiBase}/api/lens-options`)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudieron cargar las opciones de lente.')
  }
  return result.lensOptions
}

// El precio SIEMPRE se calcula del lado del servidor a partir del código de
// cada producto — nunca se manda un total desde el navegador (así se evita
// que alguien pague un monto distinto al real).
export async function createPaymentLink({ items, telefono, addressId, address, guardarDireccion, recetaFile }, getIdToken) {
  const apiBase = requireApiBase()

  const body = new FormData()
  body.append('Items', JSON.stringify(items))
  body.append('Telefono', telefono)
  body.append('SiteUrl', window.location.origin + import.meta.env.BASE_URL)

  if (addressId) {
    body.append('AddressId', addressId)
  } else if (address) {
    body.append('Departamento', address.departamento)
    body.append('Municipio', address.municipio)
    body.append('Direccion', address.direccion)
    body.append('Referencia', address.referencia || '')
    if (guardarDireccion) body.append('GuardarDireccion', '1')
  }
  if (recetaFile) body.append('attachment', recetaFile)

  const response = await authFetch(`${apiBase}/checkout`, { method: 'POST', body }, getIdToken)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudo generar el enlace de pago.')
  }
  return result
}

export function buildPaymentWhatsAppURL({ orderId, monto }) {
  const lineas = [
    'Hola! Acabo de realizar el pago de mi pedido en el sitio web.',
    orderId && `Número de pedido: ${orderId}`,
    monto && `Monto: $${monto}`,
    'Quedo atento(a) a la confirmación.',
  ].filter(Boolean)

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join('\n'))}`
}

export async function fetchAddresses(getIdToken) {
  const apiBase = requireApiBase()
  const response = await authFetch(`${apiBase}/api/addresses`, { method: 'GET' }, getIdToken)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudieron cargar tus direcciones.')
  }
  return result.addresses
}

export async function saveAddress(address, getIdToken) {
  const apiBase = requireApiBase()
  const response = await authFetch(
    `${apiBase}/api/addresses`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    },
    getIdToken
  )
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudo guardar la dirección.')
  }
  return result.id
}

export async function deleteAddress(addressId, getIdToken) {
  const apiBase = requireApiBase()
  const response = await authFetch(`${apiBase}/api/addresses/${addressId}`, { method: 'DELETE' }, getIdToken)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudo borrar la dirección.')
  }
}

export async function fetchOrders(getIdToken) {
  const apiBase = requireApiBase()
  const response = await authFetch(`${apiBase}/api/orders`, { method: 'GET' }, getIdToken)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'No se pudo cargar tu historial.')
  }
  return result.orders
}
