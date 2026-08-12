import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // El build normal (Cloudflare Pages, dev local) sirve desde la raíz.
  // Solo el deploy a GitHub Pages (npm run deploy) necesita el subpath,
  // por eso ese script pasa GH_PAGES=1 antes de compilar.
  base: process.env.GH_PAGES ? '/masVision-web/' : '/',
})