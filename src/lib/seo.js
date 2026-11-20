import { useEffect } from 'react'

export const SITE_NAME = 'Óptica Más Visión'
// URL pública del sitio (sin barra final). En producción se define con
// VITE_SITE_URL; si no, se usa la URL actual.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || `${typeof window !== 'undefined' ? window.location.origin : ''}${import.meta.env.BASE_URL}`
).replace(/\/$/, '')

export const DEFAULT_DESCRIPTION =
  'Óptica en El Salvador: aros oftálmicos, lentes de sol y exámenes de la vista. Sucursales en San Vicente, Zacatecoluca y Cojutepeque, con envíos a todo el país.'
export const DEFAULT_IMAGE = `${SITE_URL}/img/og-image.jpg`

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

// Título, descripción, Open Graph, canonical y JSON-LD de la página actual.
export function usePageMeta({ title, description = DEFAULT_DESCRIPTION, path = '/', image, type = 'website', noindex = false, jsonLd } = {}) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Aros, lentes de sol y exámenes de la vista`
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const img = image || DEFAULT_IMAGE
    document.title = fullTitle
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', img)
    setCanonical(url)
    setJsonLd('page-jsonld', jsonLdKey ? JSON.parse(jsonLdKey) : null)
  }, [title, description, path, image, type, noindex, jsonLdKey])
}
