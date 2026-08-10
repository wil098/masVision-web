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
