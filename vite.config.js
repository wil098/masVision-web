import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/masVision-web/', // 👈 Esto es vital para GitHub Pages
})