import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/masVision-web/', // muy importante para GitHub Pages
  plugins: [react()],
})
