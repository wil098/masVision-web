import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/masVision-web/', // 👈 Muy importante
  plugins: [react()],
})

