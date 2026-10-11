import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { streamListPwa } from './pwa-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), streamListPwa()],
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:3001' } },
})
