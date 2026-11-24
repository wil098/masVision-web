import { authFetch, requireApiBase } from './orderService'

async function callJson(path, options, getIdToken) {
  const apiBase = requireApiBase()
  const response = await authFetch(`${apiBase}${path}`, options, getIdToken)
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'Ocurrió un error inesperado.')
  }
  return result
}

export async function fetchMe(getIdToken) {
  return callJson('/api/me', { method: 'GET' }, getIdToken)
}

export async function fetchAdminProducts(getIdToken) {
  const result = await callJson('/admin/products', { method: 'GET' }, getIdToken)
  return result.products
}

export async function createAdminProduct(product, getIdToken) {
  return callJson(
    '/admin/products',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) },
    getIdToken
  )
}

export async function updateAdminProduct(codigo, product, getIdToken) {
  return callJson(
    `/admin/products/${encodeURIComponent(codigo)}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) },
    getIdToken
  )
}

export async function deleteAdminProduct(codigo, getIdToken) {
  return callJson(`/admin/products/${encodeURIComponent(codigo)}`, { method: 'DELETE' }, getIdToken)
}

export async function renameAdminProductCode(codigo, newCodigo, getIdToken) {
  return callJson(
    `/admin/products/${encodeURIComponent(codigo)}/codigo`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newCodigo }) },
    getIdToken
  )
}

export async function uploadAdminImage(file, getIdToken) {
  const body = new FormData()
  body.append('file', file)
  const result = await callJson('/admin/upload', { method: 'POST', body }, getIdToken)
  return result.url
}

export async function fetchAdminOrders(getIdToken) {
  const result = await callJson('/admin/orders', { method: 'GET' }, getIdToken)
  return result.orders
}

export async function updateAdminOrder(orderId, updates, getIdToken) {
  return callJson(
    `/admin/orders/${encodeURIComponent(orderId)}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) },
    getIdToken
  )
}

export async function sendAdminQuote(orderId, { descripcion, precio }, getIdToken) {
  return callJson(
    `/admin/orders/${encodeURIComponent(orderId)}/cotizacion`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descripcion, precio }) },
    getIdToken
  )
}

// Abre la receta (bucket privado) en una pestaña nueva usando la sesión del admin.
export async function openAdminReceta(orderId, getIdToken) {
  const apiBase = requireApiBase()
  const response = await authFetch(`${apiBase}/admin/orders/${encodeURIComponent(orderId)}/receta`, { method: 'GET' }, getIdToken)
  if (!response.ok) {
    let message = 'No se pudo abrir la receta.'
    try {
      message = (await response.json()).message || message
    } catch {
      /* no era JSON */
    }
    throw new Error(message)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function sendAdminTestEmail(getIdToken) {
  return callJson('/admin/test-email', { method: 'POST' }, getIdToken)
}

export async function fetchAdminCustomers(getIdToken) {
  const result = await callJson('/admin/customers', { method: 'GET' }, getIdToken)
  return result.customers
}

export async function fetchAdminLensOptions(getIdToken) {
  const result = await callJson('/admin/lens-options', { method: 'GET' }, getIdToken)
  return result.lensOptions
}

export async function createAdminLensOption(lensOption, getIdToken) {
  return callJson(
    '/admin/lens-options',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lensOption) },
    getIdToken
  )
}

export async function updateAdminLensOption(id, lensOption, getIdToken) {
  return callJson(
    `/admin/lens-options/${id}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lensOption) },
    getIdToken
  )
}

export async function deleteAdminLensOption(id, getIdToken) {
  return callJson(`/admin/lens-options/${id}`, { method: 'DELETE' }, getIdToken)
}

export async function fetchAdminPromoBlocks(getIdToken) {
  const result = await callJson('/admin/promo-blocks', { method: 'GET' }, getIdToken)
  return result.promoBlocks
}

export async function createAdminPromoBlock(promoBlock, getIdToken) {
  return callJson(
    '/admin/promo-blocks',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promoBlock) },
    getIdToken
  )
}

export async function updateAdminPromoBlock(id, promoBlock, getIdToken) {
  return callJson(
    `/admin/promo-blocks/${id}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promoBlock) },
    getIdToken
  )
}

export async function deleteAdminPromoBlock(id, getIdToken) {
  return callJson(`/admin/promo-blocks/${id}`, { method: 'DELETE' }, getIdToken)
}

export async function fetchAdminHeroSlides(getIdToken) {
  return callJson('/admin/hero-slides', { method: 'GET' }, getIdToken)
}

export async function createAdminHeroSlide(slide, getIdToken) {
  return callJson(
    '/admin/hero-slides',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(slide) },
    getIdToken
  )
}

export async function updateAdminHeroSlide(id, slide, getIdToken) {
  return callJson(
    `/admin/hero-slides/${id}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(slide) },
    getIdToken
  )
}

export async function deleteAdminHeroSlide(id, getIdToken) {
  return callJson(`/admin/hero-slides/${id}`, { method: 'DELETE' }, getIdToken)
}
