// Genera dist/robots.txt y dist/sitemap.xml al publicar, con todas las
// páginas y productos disponibles (leídos de la API en ese momento).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const env = Object.fromEntries(
  (existsSync('.env') ? readFileSync('.env', 'utf8') : '')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const SITE_URL = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || 'https://wil098.github.io/masVision-web').replace(/\/$/, '')
const API = process.env.VITE_ORDER_API_BASE || env.VITE_ORDER_API_BASE

const today = new Date().toISOString().slice(0, 10)
const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/aros-oftalmicos', priority: '0.9', changefreq: 'weekly' },
  { path: '/aros-de-sol', priority: '0.9', changefreq: 'weekly' },
  { path: '/examenes-de-la-vista', priority: '0.8', changefreq: 'monthly' },
  { path: '/sucursales', priority: '0.8', changefreq: 'monthly' },
]

let products = []
try {
  const res = await fetch(`${API}/api/products`)
  products = (await res.json()).products || []
} catch (err) {
  console.warn('No se pudieron leer los productos para el sitemap:', err.message)
}

const xmlEscape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const urls = [
  ...pages.map((p) => ({ loc: `${SITE_URL}${p.path}`, lastmod: today, ...p })),
  ...products.map((p) => ({
    loc: `${SITE_URL}/producto/${encodeURIComponent(p.codigo)}`,
    lastmod: (p.updated_at || today).slice(0, 10),
    changefreq: 'weekly',
    priority: '0.7',
    image: p.images?.[0],
  })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.image ? `\n    <image:image><image:loc>${xmlEscape(encodeURI(u.image))}</image:loc></image:image>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>
`
const basePath = new URL(SITE_URL).pathname.replace(/\/$/, '')
const robots = `User-agent: *
Allow: /
Disallow: ${basePath}/admin
Disallow: ${basePath}/mi-cuenta

Sitemap: ${SITE_URL}/sitemap.xml
`
writeFileSync('dist/sitemap.xml', sitemap)
writeFileSync('dist/robots.txt', robots)
console.log(`SEO: sitemap con ${urls.length} URLs (${products.length} productos) para ${SITE_URL}`)
